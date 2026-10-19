"""API de tareas (To-Do) con FastAPI.

Ejecutar:   uv run fastapi dev main.py
Docs:       http://localhost:8000/docs  (Swagger UI generado automáticamente)
"""

from itertools import count

from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field

# PASO CLAVE 1: la aplicación y un router con prefijo /api.
# Todas las rutas viven bajo /api para que el proxy de Vite sepa cuáles reenviar.
app = FastAPI(title="API To-Do")
router = APIRouter(prefix="/api")


# PASO CLAVE 2: modelos Pydantic = validación automática de lo que llega.
# Si el título está vacío o es muy largo, FastAPI responde 422 sin que escribas código.
class TodoIn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)  # quita espacios sobrantes
    title: str = Field(min_length=1, max_length=200)


class Todo(TodoIn):
    id: int
    done: bool = False


# PASO CLAVE 3: "base de datos" en memoria (se borra al reiniciar el servidor).
todos: dict[int, Todo] = {}
ids = count(1)  # generador 1, 2, 3, ... sin variables globales


def get_or_404(todo_id: int) -> Todo:
    todo = todos.get(todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return todo


# PASO CLAVE 4: el tipo de retorno (-> Todo) define el "response_model":
# FastAPI filtra y documenta la respuesta con ese modelo.
@router.get("/todos")
def list_todos() -> list[Todo]:
    return list(todos.values())


@router.post("/todos", status_code=201)
def create_todo(data: TodoIn) -> Todo:
    todo = Todo(id=next(ids), title=data.title)
    todos[todo.id] = todo
    return todo


@router.patch("/todos/{todo_id}")
def toggle_todo(todo_id: int) -> Todo:
    todo = get_or_404(todo_id)
    todo.done = not todo.done
    return todo


@router.delete("/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int) -> None:
    get_or_404(todo_id)
    del todos[todo_id]


# PASO CLAVE 5: registrar el router AL FINAL, después de declarar sus rutas.
# include_router copia las rutas que existen en ese momento.
app.include_router(router)
