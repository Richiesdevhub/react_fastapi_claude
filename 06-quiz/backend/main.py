"""Quiz de programación: el servidor guarda las respuestas correctas y califica.

Ejecutar:   uv run fastapi dev main.py
Docs:       http://localhost:8000/docs
"""

from fastapi import APIRouter, FastAPI
from pydantic import BaseModel

app = FastAPI(title="API del Quiz")
router = APIRouter(prefix="/api")


# PASO CLAVE 1: este es el banco de preguntas COMPLETO (incluye la respuesta correcta).
# Nunca se envía tal cual al navegador: cualquiera podría ver la respuesta en las
# herramientas de desarrollador y hacer trampa.
QUESTIONS = [
    {
        "id": 1,
        "text": "¿Qué método de HTTP se usa normalmente para crear un recurso?",
        "options": ["GET", "POST", "DELETE", "HEAD"],
        "answer": 1,
    },
    {
        "id": 2,
        "text": "¿Qué hook de React sirve para guardar estado en un componente?",
        "options": ["useEffect", "useRef", "useState", "useMemo"],
        "answer": 2,
    },
    {
        "id": 3,
        "text": "¿Qué librería usa FastAPI para validar datos?",
        "options": ["Pydantic", "Marshmallow", "Django Forms", "Jinja2"],
        "answer": 0,
    },
    {
        "id": 4,
        "text": "¿Qué código de estado HTTP significa 'no encontrado'?",
        "options": ["200", "301", "404", "500"],
        "answer": 2,
    },
    {
        "id": 5,
        "text": "¿Qué formato de datos es el más común en las APIs web?",
        "options": ["JSON", "BMP", "MP3", "CSV binario"],
        "answer": 0,
    },
]
BY_ID = {q["id"]: q for q in QUESTIONS}


class QuestionOut(BaseModel):  # PASO CLAVE 2: modelo de salida SIN el campo "answer"
    id: int
    text: str
    options: list[str]


class SubmitIn(BaseModel):
    # { id_de_pregunta: índice_de_opción }. En JSON las llaves son texto ("1"),
    # pero Pydantic las convierte a int automáticamente por la anotación dict[int, int].
    answers: dict[int, int]


class QuestionResult(BaseModel):
    id: int
    correct: bool
    correct_option: int


class ResultOut(BaseModel):
    score: int
    total: int
    details: list[QuestionResult]


@router.get("/questions")
def list_questions() -> list[QuestionOut]:
    # Al devolver dicts con "answer", response_model (QuestionOut) lo descarta solo.
    return QUESTIONS  # type: ignore[return-value]


# PASO CLAVE 3: la calificación ocurre en el servidor.
@router.post("/submit")
def submit(data: SubmitIn) -> ResultOut:
    details = []
    for q in QUESTIONS:
        chosen = data.answers.get(q["id"])
        details.append(
            QuestionResult(id=q["id"], correct=chosen == q["answer"], correct_option=q["answer"])
        )
    return ResultOut(
        score=sum(d.correct for d in details), total=len(QUESTIONS), details=details
    )


app.include_router(router)
