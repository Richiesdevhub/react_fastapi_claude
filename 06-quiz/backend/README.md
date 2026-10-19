# Backend · Quiz de programación

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
| `GET` | `/api/questions` | Lista preguntas con sus opciones (sin la respuesta correcta) |
| `POST` | `/api/submit` | Califica. Cuerpo: `{"answers": {"1": 1, "2": 2}}` (id de pregunta → índice de opción) |

## Prueba rápida sin frontend

Con el backend corriendo:

```bash
curl http://127.0.0.1:8000/api/questions
curl -X POST http://127.0.0.1:8000/api/submit -H "Content-Type: application/json" -d '{"answers":{"1":1,"2":2}}'
```

## Pasos clave explicados

Cada punto corresponde a un comentario `PASO CLAVE` en `main.py`.

1. **El banco de preguntas vive en el servidor, con la respuesta incluida.** Si enviaras la respuesta correcta al navegador, cualquiera podría verla en las herramientas de desarrollador.

2. **Modelo de salida sin `answer`.** `QuestionOut` solo declara `id`, `text` y `options`. Como la función declara `-> list[QuestionOut]`, FastAPI filtra el campo `answer` antes de responder, aunque los diccionarios originales lo contengan.

3. **La calificación ocurre en el servidor.** `answers: dict[int, int]` recibe `{id_pregunta: índice_opción}`. En JSON las llaves son siempre texto (`"1"`), pero Pydantic las convierte a `int` por la anotación. Una pregunta sin responder cuenta como incorrecta (`chosen` es `None`).
