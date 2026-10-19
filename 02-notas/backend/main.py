"""API de notas con búsqueda, edición y borrado.

Ejecutar:   uv run fastapi dev main.py
Docs:       http://localhost:8000/docs
"""

from itertools import count

from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field

app = FastAPI(title="API de Notas")
router = APIRouter(prefix="/api")


class NoteIn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    title: str = Field(min_length=1, max_length=100)
    content: str = Field(default="", max_length=5000)


class Note(NoteIn):
    id: int


notes: dict[int, Note] = {}
ids = count(1)


def get_or_404(note_id: int) -> Note:
    note = notes.get(note_id)
    if note is None:
        raise HTTPException(status_code=404, detail="Nota no encontrada")
    return note


# PASO CLAVE 1: parámetros de consulta (query params).
# Un argumento que NO aparece en la ruta (/notes) se lee de la URL: /api/notes?q=hola
# Tiene valor por defecto "", así que es opcional.
@router.get("/notes")
def list_notes(q: str = "") -> list[Note]:
    q = q.strip().lower()
    result = [n for n in notes.values() if q in n.title.lower() or q in n.content.lower()]
    # Las más recientes primero.
    return sorted(result, key=lambda n: n.id, reverse=True)


@router.post("/notes", status_code=201)
def create_note(data: NoteIn) -> Note:
    note = Note(id=next(ids), **data.model_dump())
    notes[note.id] = note
    return note


# PASO CLAVE 2: PUT reemplaza el recurso completo (a diferencia de PATCH, que
# modifica solo una parte). Reutilizamos el mismo modelo de entrada NoteIn.
@router.put("/notes/{note_id}")
def update_note(note_id: int, data: NoteIn) -> Note:
    get_or_404(note_id)
    note = Note(id=note_id, **data.model_dump())
    notes[note_id] = note
    return note


@router.delete("/notes/{note_id}", status_code=204)
def delete_note(note_id: int) -> None:
    get_or_404(note_id)
    del notes[note_id]


app.include_router(router)
