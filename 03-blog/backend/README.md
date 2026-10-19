# Backend · Mini blog con comentarios

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
| `GET` | `/api/posts` | Lista publicaciones (con número de comentarios) |
| `POST` | `/api/posts` | Crea una publicación. Cuerpo: `{"title": "...", "body": "..."}` |
| `GET` | `/api/posts/{id}` | Devuelve una publicación con todos sus comentarios |
| `POST` | `/api/posts/{id}/comments` | Añade un comentario. Cuerpo: `{"author": "...", "text": "..."}` |

## Prueba rápida sin frontend

Con el backend corriendo:

```bash
curl -X POST http://127.0.0.1:8000/api/posts -H "Content-Type: application/json" -d '{"title":"Hola","body":"Mi primer post"}'
curl -X POST http://127.0.0.1:8000/api/posts/1/comments -H "Content-Type: application/json" -d '{"author":"Ana","text":"Muy bueno"}'
```

## Pasos clave explicados

Cada punto corresponde a un comentario `PASO CLAVE` en `main.py`.

1. **Dos modelos de salida para el mismo recurso.** `PostSummary` (lista) solo incluye `comment_count`; `PostDetail` (una publicación) incluye la lista completa de comentarios. Así no se envían datos que la pantalla no usa.

2. **Relación uno a muchos en memoria.** `posts` guarda las publicaciones y `comments` guarda, por id de publicación, su lista de comentarios; funciona como una clave foránea de SQL. En una base de datos real sería una tabla `comments` con una columna `post_id`.

3. **Validar al padre antes de crear al hijo.** `add_comment` llama a `get_post_or_404` para responder `404` si la publicación no existe, en lugar de crear comentarios huérfanos.
