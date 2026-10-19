"""Mini blog: publicaciones con comentarios (relación uno a muchos).

Ejecutar:   uv run fastapi dev main.py
Docs:       http://localhost:8000/docs
"""

from datetime import datetime
from itertools import count

from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field

app = FastAPI(title="API del Blog")
router = APIRouter(prefix="/api")


class Strip(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)


class CommentIn(Strip):
    author: str = Field(min_length=1, max_length=50)
    text: str = Field(min_length=1, max_length=500)


class Comment(CommentIn):
    id: int
    created_at: datetime


class PostIn(Strip):
    title: str = Field(min_length=1, max_length=120)
    body: str = Field(min_length=1, max_length=5000)


# PASO CLAVE 1: usamos DOS modelos de salida para el mismo recurso.
# - PostSummary: para la lista (liviano: solo cuenta los comentarios).
# - PostDetail: para la vista de un post (incluye todos los comentarios).
# Así no enviamos datos que la pantalla no necesita.
class PostSummary(PostIn):
    id: int
    created_at: datetime
    comment_count: int


class PostDetail(PostIn):
    id: int
    created_at: datetime
    comments: list[Comment]


# PASO CLAVE 2: relación uno-a-muchos en memoria.
# Los posts guardan sus datos y los comentarios viven en un diccionario aparte
# cuya llave es el id del post (como una clave foránea en SQL).
posts: dict[int, dict] = {}
comments: dict[int, list[Comment]] = {}
post_ids = count(1)
comment_ids = count(1)


def get_post_or_404(post_id: int) -> dict:
    post = posts.get(post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    return post


@router.get("/posts")
def list_posts() -> list[PostSummary]:
    result = [
        PostSummary(**p, comment_count=len(comments[p["id"]])) for p in posts.values()
    ]
    return sorted(result, key=lambda p: p.id, reverse=True)


@router.post("/posts", status_code=201)
def create_post(data: PostIn) -> PostSummary:
    post_id = next(post_ids)
    post = {"id": post_id, "created_at": datetime.now(), **data.model_dump()}
    posts[post_id] = post
    comments[post_id] = []
    return PostSummary(**post, comment_count=0)


@router.get("/posts/{post_id}")
def get_post(post_id: int) -> PostDetail:
    post = get_post_or_404(post_id)
    return PostDetail(**post, comments=comments[post_id])


@router.post("/posts/{post_id}/comments", status_code=201)
def add_comment(post_id: int, data: CommentIn) -> Comment:
    get_post_or_404(post_id)  # PASO CLAVE 3: validar que el padre exista antes de crear el hijo
    comment = Comment(id=next(comment_ids), created_at=datetime.now(), **data.model_dump())
    comments[post_id].append(comment)
    return comment


app.include_router(router)
