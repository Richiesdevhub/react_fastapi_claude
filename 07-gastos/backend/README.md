# Backend · Control de gastos

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
| `GET` | `/api/expenses` | Lista gastos (más recientes primero) |
| `POST` | `/api/expenses` | Crea un gasto. Cuerpo: `{"description": "...", "amount": 85.5, "category": "comida"}` |
| `DELETE` | `/api/expenses/{id}` | Borra un gasto |
| `GET` | `/api/summary` | Total y total por categoría |

## Prueba rápida sin frontend

Con el backend corriendo:

```bash
curl -X POST http://127.0.0.1:8000/api/expenses -H "Content-Type: application/json" -d '{"description":"Tacos","amount":85.5,"category":"comida"}'
curl http://127.0.0.1:8000/api/summary
```

## Pasos clave explicados

Cada punto corresponde a un comentario `PASO CLAVE` en `main.py`.

1. **Validación declarativa.** `Literal["comida", ...]` limita las categorías (cualquier otra devuelve `422` y aparece como lista desplegable en `/docs`). `Field(gt=0, le=1_000_000)` exige monto positivo y con tope.

2. **Totales calculados en el servidor.** Con `defaultdict(float)` se acumula por categoría. Se redondea a 2 decimales para evitar resultados como `0.30000000000000004`. Con dinero real conviene `Decimal` o guardar centavos como enteros.
