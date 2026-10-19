"""Pomodoro: el frontend corre el temporizador y el backend guarda las sesiones.

Ejecutar:   uv run fastapi dev main.py
Docs:       http://localhost:8000/docs
"""

from datetime import date, datetime
from itertools import count
from typing import Literal

from fastapi import APIRouter, FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="API Pomodoro")
router = APIRouter(prefix="/api")


class SessionIn(BaseModel):
    kind: Literal["focus", "break"]
    seconds: int = Field(ge=1, le=7200)  # entre 1 segundo y 2 horas


class Session(SessionIn):
    id: int
    finished_at: datetime


class SessionsOut(BaseModel):
    focus_today: int  # sesiones de enfoque completadas hoy
    recent: list[Session]  # las últimas 10


sessions: list[Session] = []
ids = count(1)


# PASO CLAVE 1: la hora la pone el SERVIDOR (finished_at), no el cliente.
# Nunca confíes en datos de tiempo enviados por el navegador si importan.
@router.post("/sessions", status_code=201)
def create_session(data: SessionIn) -> Session:
    session = Session(id=next(ids), finished_at=datetime.now(), **data.model_dump())
    sessions.append(session)
    return session


# PASO CLAVE 2: agregaciones en el servidor. El frontend recibe solo lo que va a mostrar.
# "hoy" se calcula con la fecha del servidor (en una app real, usarías la zona del usuario).
@router.get("/sessions")
def list_sessions() -> SessionsOut:
    today = date.today()
    focus_today = sum(
        1 for s in sessions if s.kind == "focus" and s.finished_at.date() == today
    )
    return SessionsOut(focus_today=focus_today, recent=sessions[-10:][::-1])


app.include_router(router)
