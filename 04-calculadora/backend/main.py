"""Calculadora: el backend evalúa expresiones matemáticas de forma SEGURA.

Ejecutar:   uv run fastapi dev main.py
Docs:       http://localhost:8000/docs
"""

import ast
import math
import operator

from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field

app = FastAPI(title="API de Calculadora")
router = APIRouter(prefix="/api")


class CalcIn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    expression: str = Field(min_length=1, max_length=100)


class CalcOut(BaseModel):
    result: float


# PASO CLAVE 1: NUNCA uses eval() con texto que viene del usuario: permitiría
# ejecutar código arbitrario en tu servidor. En su lugar convertimos el texto a un
# árbol sintáctico (ast) y solo aceptamos los nodos que nosotros permitimos.
BINARY_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
}
UNARY_OPS = {ast.UAdd: operator.pos, ast.USub: operator.neg}


def check(x: float) -> float:
    # Las multiplicaciones con floats NO lanzan error al desbordarse: devuelven inf
    # (y inf - inf da nan). Ninguno de los dos se puede enviar como JSON válido.
    if not math.isfinite(x):
        raise OverflowError
    return x


def evaluate(node: ast.AST) -> float:
    if isinstance(node, ast.Expression):
        return evaluate(node.body)
    # Solo números (int/float). bool es subclase de int, por eso se excluye aparte.
    if isinstance(node, ast.Constant) and type(node.value) in (int, float):
        # float(...) hace que operaciones enormes lancen OverflowError
        # en lugar de calcular enteros gigantescos y bloquear el servidor.
        return check(float(node.value))
    if isinstance(node, ast.BinOp) and type(node.op) in BINARY_OPS:
        result = BINARY_OPS[type(node.op)](evaluate(node.left), evaluate(node.right))
        if isinstance(result, complex):  # p. ej. (-8) ** 0.5 devuelve complejo en Python
            raise ValueError("El resultado no es un número real")
        return check(result)
    if isinstance(node, ast.UnaryOp) and type(node.op) in UNARY_OPS:
        return UNARY_OPS[type(node.op)](evaluate(node.operand))
    raise ValueError("Expresión no permitida")


# PASO CLAVE 2: traducir los errores de cálculo a una respuesta HTTP 400 con un
# mensaje claro que el frontend pueda mostrar tal cual.
@router.post("/calculate")
def calculate(data: CalcIn) -> CalcOut:
    try:
        tree = ast.parse(data.expression, mode="eval")
        return CalcOut(result=evaluate(tree))
    except ZeroDivisionError:
        raise HTTPException(status_code=400, detail="No se puede dividir entre cero")
    except OverflowError:
        raise HTTPException(status_code=400, detail="El número es demasiado grande")
    except (SyntaxError, ValueError, RecursionError):
        raise HTTPException(status_code=400, detail="Expresión inválida")


app.include_router(router)
