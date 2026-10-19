# Backend · Notas con búsqueda y edición

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
| `GET` | `/api/notes?q=texto` | Lista notas; `q` filtra por título o contenido (opcional) |
| `POST` | `/api/notes` | Crea una nota. Cuerpo: `{"title": "...", "content": "..."}` |
| `PUT` | `/api/notes/{id}` | Reemplaza la nota completa |
| `DELETE` | `/api/notes/{id}` | Borra la nota |

## Prueba rápida sin frontend

Con el backend corriendo:

```bash
curl -X POST http://127.0.0.1:8000/api/notes -H "Content-Type: application/json" -d '{"title":"Idea","content":"Probar FastAPI"}'
curl "http://127.0.0.1:8000/api/notes?q=fast"
```

## Pasos clave explicados

Cada punto corresponde a un comentario `PASO CLAVE` en `main.py`.

1. **Parámetros de consulta.** Un argumento de la función que *no* aparece en la ruta se lee de la URL. `q: str = ""` significa `/api/notes?q=hola`, y al tener valor por defecto es opcional. Sin valor por defecto sería obligatorio.

2. **`PUT` frente a `PATCH`.** `PUT` reemplaza el recurso completo (se exige el cuerpo completo, como en `NoteIn`); `PATCH` modifica solo una parte. Aquí reutilizamos el mismo modelo de entrada para crear y para actualizar.
