"""Chat en tiempo real con WebSockets.

Ejecutar:   uv run fastapi dev main.py
Docs REST:  http://localhost:8000/docs  (los WebSockets no aparecen en Swagger)
"""

from datetime import datetime

from fastapi import APIRouter, FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI(title="API del Chat")
router = APIRouter(prefix="/api")

MAX_HISTORY = 50


# PASO CLAVE 1: un "manager" que recuerda las conexiones abiertas y puede
# enviar un mensaje a todas (broadcast). Es el patrón estándar para chats.
class ChatManager:
    def __init__(self) -> None:
        self.connections: list[WebSocket] = []
        self.history: list[dict] = []

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()  # PASO CLAVE 2: hay que aceptar el handshake explícitamente
        self.connections.append(ws)
        # El recién llegado recibe el historial reciente.
        for message in self.history:
            await ws.send_json(message)

    def disconnect(self, ws: WebSocket) -> None:
        if ws in self.connections:
            self.connections.remove(ws)

    async def broadcast(self, message: dict) -> None:
        self.history = (self.history + [message])[-MAX_HISTORY:]
        # Iteramos sobre una copia: podemos quitar conexiones muertas mientras recorremos.
        for ws in list(self.connections):
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(ws)


manager = ChatManager()


def make_message(kind: str, user: str, text: str) -> dict:
    return {"type": kind, "user": user, "text": text, "time": datetime.now().isoformat()}


# PASO CLAVE 3: el nombre llega como parámetro de consulta: ws://host/api/ws?name=Ana
@router.websocket("/ws")
async def chat(ws: WebSocket, name: str = "Anónimo") -> None:
    name = name.strip()[:20] or "Anónimo"
    await manager.connect(ws)
    await manager.broadcast(make_message("system", name, f"{name} se unió al chat"))
    try:
        # PASO CLAVE 4: bucle infinito esperando mensajes de este cliente.
        # Cuando el cliente se desconecta, receive_text() lanza WebSocketDisconnect.
        while True:
            text = (await ws.receive_text()).strip()[:500]
            if text:
                await manager.broadcast(make_message("message", name, text))
    except WebSocketDisconnect:
        manager.disconnect(ws)
        await manager.broadcast(make_message("system", name, f"{name} salió del chat"))


app.include_router(router)
