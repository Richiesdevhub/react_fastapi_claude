"""Acortador de URLs: crea códigos cortos y redirige a la URL original.

Ejecutar:   uv run fastapi dev main.py
Docs:       http://localhost:8000/docs
"""

import secrets

from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, HttpUrl

app = FastAPI(title="API del Acortador")
router = APIRouter(prefix="/api")


# PASO CLAVE 1: HttpUrl valida que sea una URL http(s) real. "hola" o "javascript:..."
# se rechazan con 422. Esto es seguridad: evita redirigir a esquemas peligrosos.
class LinkIn(BaseModel):
    url: HttpUrl


class Link(BaseModel):
    code: str
    url: str
    clicks: int = 0


links: dict[str, Link] = {}


# PASO CLAVE 2: códigos aleatorios con el módulo "secrets" (criptográficamente seguro),
# no con "random". Así los códigos no son predecibles. Repetimos si hubiera colisión.
def new_code() -> str:
    while True:
        code = secrets.token_urlsafe(4)  # ~6 caracteres, p. ej. "aB3_xZ"
        if code not in links:
            return code


@router.post("/links", status_code=201)
def create_link(data: LinkIn) -> Link:
    link = Link(code=new_code(), url=str(data.url))
    links[link.code] = link
    return link


@router.get("/links")
def list_links() -> list[Link]:
    return list(links.values())


# PASO CLAVE 3: la redirección también va bajo /api para que funcione a través del
# proxy de Vite. Respondemos 307 (redirección temporal) y contamos el clic.
# Se declara como "response_class" para que /docs no intente mostrar un JSON.
@router.get("/r/{code}", response_class=RedirectResponse, status_code=307)
def follow(code: str) -> RedirectResponse:
    link = links.get(code)
    if link is None:
        raise HTTPException(status_code=404, detail="Enlace no encontrado")
    link.clicks += 1
    return RedirectResponse(link.url, status_code=307)


app.include_router(router)
