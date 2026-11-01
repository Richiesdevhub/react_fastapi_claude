from itertools import count
from sys import prefix

from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field

app = FastAPI(title="API con fastapi propia, version 1.1")
router = APIRouter(prefix="/api")


#Modelos Pydantic = validación automática de lo que llega.
class TodoIn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    text:str=Field(min_length=1, max_length=200)

class Todo(TodoIn):
    id:int
    done:bool=False

# "base de datos" en memoria (se borra al reiniciar el servidor).
todos:dict[int, Todo]={}
ids=count(1)

#Function get_or_404
def get_or_404(id:int)->Todo:
    todo=todos.get(id)
    if todo is None:
        raise HTTPException(status_code=404, detail="No encontrado")
    return todo

@router.get("/todos")
def todos_list()->list[Todo]:
    return list(todos.values())

@router.post("/todos")
def create_todo(data:TodoIn)->Todo:
    todo=Todo(id=next(ids), text=data.text)
    todos[todo.id] = todo
    return todo

@router.patch("/todos/{todo_id}")
def toggle_todo(id:int)->Todo:
    todo=get_or_404(id)
    todo.done = not todo.done
    return todo

app.include_router(router)
