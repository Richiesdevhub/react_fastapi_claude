# Backend · Acortador de URLs

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
| `POST` | `/api/links` | Crea un enlace corto. Cuerpo: `{"url": "https://..."}` |
| `GET` | `/api/links` | Lista los enlaces con su contador de clics |
| `GET` | `/api/r/{code}` | Redirige (307) a la URL original y suma un clic |

## Prueba rápida sin frontend

Con el backend corriendo:

```bash
curl -X POST http://127.0.0.1:8000/api/links -H "Content-Type: application/json" -d '{"url":"https://fastapi.tiangolo.com"}'
curl -i http://127.0.0.1:8000/api/r/CODIGO   # cambia CODIGO por el código devuelto
```

## Pasos clave explicados

Cada punto corresponde a un comentario `PASO CLAVE` en `main.py`.

1. **`HttpUrl` valida la URL.** Rechaza textos que no son URL y esquemas peligrosos como `javascript:`. Es una medida de seguridad: un acortador que redirige a cualquier cosa puede usarse para ataques. Pydantic normaliza la URL (por ejemplo añade `/` al final en dominios sin ruta).

2. **Códigos con `secrets`, no con `random`.** `secrets.token_urlsafe(4)` genera ~6 caracteres criptográficamente aleatorios (letras, números, `-` y `_`), así los códigos no son predecibles. Se repite si hubiera colisión.

3. **La redirección también va bajo `/api`.** El enlace corto es `/api/r/{code}` para que funcione a través del proxy de Vite sin configuración extra. Responde `307 Temporary Redirect` con `RedirectResponse` y suma un clic. `response_class=RedirectResponse` evita que `/docs` espere un JSON.
