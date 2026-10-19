# Backend · Lista de tareas (To-Do)

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
| `GET` | `/api/todos` | Lista todas las tareas |
| `POST` | `/api/todos` | Crea una tarea. Cuerpo: `{"title": "..."}` |
| `PATCH` | `/api/todos/{id}` | Alterna el estado completada/pendiente |
| `DELETE` | `/api/todos/{id}` | Borra la tarea (responde 204 sin cuerpo) |

## Prueba rápida sin frontend

Con el backend corriendo:

```bash
curl -X POST http://127.0.0.1:8000/api/todos -H "Content-Type: application/json" -d '{"title":"Aprender FastAPI"}'
curl http://127.0.0.1:8000/api/todos
```

## Pasos clave explicados

Cada punto corresponde a un comentario `PASO CLAVE` en `main.py`.

1. **Aplicación y router con prefijo `/api`.** `APIRouter(prefix="/api")` agrupa las rutas bajo `/api`. El proxy de Vite reenvía solo lo que empieza por `/api`, así el frontend y el backend no se mezclan.

2. **Modelos Pydantic.** `TodoIn` describe lo que el cliente puede enviar y `Todo` hereda de él y añade `id` y `done`. Si el título está vacío o supera 200 caracteres, FastAPI responde `422` con el detalle del error sin que escribas ninguna validación a mano. `str_strip_whitespace` recorta espacios, de modo que `"   "` también se rechaza.

3. **Almacén en memoria.** Un `dict` por id más `itertools.count(1)` como generador de ids. Es suficiente para aprender, pero los datos se pierden al reiniciar. Para persistir, el paso natural es SQLite con SQLModel o SQLAlchemy.

4. **El tipo de retorno es el `response_model`.** Al escribir `-> Todo` o `-> list[Todo]`, FastAPI valida y filtra la respuesta con ese modelo y la documenta en `/docs`.

5. **`include_router` al final.** Registra el router *después* de declarar sus rutas: copia las que existen en ese momento. Si lo llamas antes, las rutas declaradas más abajo no quedan registradas.
