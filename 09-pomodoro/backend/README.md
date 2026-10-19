# Backend · Temporizador Pomodoro

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
| `POST` | `/api/sessions` | Registra una sesión terminada. Cuerpo: `{"kind": "focus", "seconds": 1500}` (`kind`: `focus` o `break`) |
| `GET` | `/api/sessions` | Devuelve sesiones de enfoque de hoy y las últimas 10 |

## Prueba rápida sin frontend

Con el backend corriendo:

```bash
curl -X POST http://127.0.0.1:8000/api/sessions -H "Content-Type: application/json" -d '{"kind":"focus","seconds":1500}'
curl http://127.0.0.1:8000/api/sessions
```

## Pasos clave explicados

Cada punto corresponde a un comentario `PASO CLAVE` en `main.py`.

1. **La hora la pone el servidor.** `finished_at` se genera con `datetime.now()` en el backend, no se acepta del cliente. Nunca confíes en fechas enviadas por el navegador cuando importan.

2. **Agregaciones en el servidor.** `GET /api/sessions` calcula cuántas sesiones de enfoque se completaron hoy y devuelve solo las últimas 10; el frontend recibe justo lo que va a mostrar. "Hoy" usa la fecha del servidor; en una app real usarías la zona horaria del usuario.
