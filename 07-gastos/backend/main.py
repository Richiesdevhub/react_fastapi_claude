"""Control de gastos: registro de gastos y resumen por categoría.

Ejecutar:   uv run fastapi dev main.py
Docs:       http://localhost:8000/docs
"""

from collections import defaultdict
from datetime import date
from itertools import count
from typing import Literal

from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field

app = FastAPI(title="API de Gastos")
router = APIRouter(prefix="/api")

# PASO CLAVE 1: Literal restringe los valores permitidos. Cualquier otra categoría
# se rechaza con 422 y aparece como lista desplegable en /docs.
Category = Literal["comida", "transporte", "casa", "ocio", "otros"]


class ExpenseIn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    description: str = Field(min_length=1, max_length=100)
    amount: float = Field(gt=0, le=1_000_000)  # gt = mayor que; le = menor o igual que
    category: Category


class Expense(ExpenseIn):
    id: int
    date: date


class Summary(BaseModel):
    total: float
    by_category: dict[str, float]


expenses: dict[int, Expense] = {}
ids = count(1)


@router.get("/expenses")
def list_expenses() -> list[Expense]:
    return sorted(expenses.values(), key=lambda e: e.id, reverse=True)


@router.post("/expenses", status_code=201)
def create_expense(data: ExpenseIn) -> Expense:
    expense = Expense(id=next(ids), date=date.today(), **data.model_dump())
    expenses[expense.id] = expense
    return expense


@router.delete("/expenses/{expense_id}", status_code=204)
def delete_expense(expense_id: int) -> None:
    if expense_id not in expenses:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    del expenses[expense_id]


# PASO CLAVE 2: los totales se calculan en el servidor. Con dinero real usarías
# Decimal o guardarías centavos como enteros; aquí redondeamos a 2 decimales
# para evitar resultados como 0.30000000000000004.
@router.get("/summary")
def summary() -> Summary:
    by_category: dict[str, float] = defaultdict(float)
    for e in expenses.values():
        by_category[e.category] += e.amount
    by_category = {k: round(v, 2) for k, v in by_category.items()}
    return Summary(total=round(sum(by_category.values()), 2), by_category=by_category)


app.include_router(router)
