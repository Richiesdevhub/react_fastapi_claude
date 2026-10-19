# Backend · Chat en tiempo real

API con **FastAPI** gestionada con **uv**.

## Ejecutar

```bash
uv sync
uv run fastapi dev main.py
```

- API: <http://127.0.0.1:8000> · Docs: <http://127.0.0.1:8000/docs>
- `fastapi dev` activa la recarga automática al guardar cambios. Para producción se usa `uv run fastapi run main.py`.

## Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| `WS` | `/api/ws?name=Ana` | Conexión WebSocket. El cliente envía texto; el servidor responde con JSON `{type, user, text, time}` a todos los conectados |

## Prueba rápida sin frontend

Los WebSockets no se prueban con `curl`: abre el frontend en dos pestañas del navegador, o usa un cliente WebSocket.

## Pasos clave explicados

Cada punto corresponde a un comentario `PASO CLAVE` en `main.py`.

1. **`ChatManager`.** Guarda las conexiones abiertas y el historial (últimos 50 mensajes), y expone `broadcast`, que envía un mensaje a todos. Es el patrón estándar para chats y notificaciones. En `broadcast` se itera sobre una *copia* de la lista para poder quitar conexiones muertas durante el recorrido.

2. **`await ws.accept()`.** El servidor debe aceptar explícitamente el "handshake" antes de enviar o recibir datos.

3. **El nombre llega como parámetro de consulta.** `ws://host/api/ws?name=Ana`. Se recorta a 20 caracteres y, si queda vacío, se usa "Anónimo". Los WebSockets del navegador no permiten cabeceras personalizadas, por eso se usa la URL.

4. **Bucle infinito + `WebSocketDisconnect`.** `while True: await ws.receive_text()` espera mensajes de ese cliente. Cuando se desconecta, `receive_text()` lanza `WebSocketDisconnect`, que se captura para limpiar y avisar a los demás. Limitación: el estado vive en el proceso; con varios procesos o servidores necesitarías algo como Redis Pub/Sub. Los WebSockets no aparecen en Swagger (`/docs`).
