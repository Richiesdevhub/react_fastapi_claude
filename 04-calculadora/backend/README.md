# Backend · Calculadora

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
| `POST` | `/api/calculate` | Evalúa una expresión. Cuerpo: `{"expression": "2*(3+4)"}` → `{"result": 14.0}` |

## Prueba rápida sin frontend

Con el backend corriendo:

```bash
curl -X POST http://127.0.0.1:8000/api/calculate -H "Content-Type: application/json" -d '{"expression":"2*(3+4)"}'
curl -X POST http://127.0.0.1:8000/api/calculate -H "Content-Type: application/json" -d '{"expression":"1/0"}'
```

## Pasos clave explicados

Cada punto corresponde a un comentario `PASO CLAVE` en `main.py`.

1. **Nunca uses `eval()` con texto del usuario.** `eval("__import__('os').system('...')")` ejecutaría código arbitrario en tu servidor. En su lugar, `ast.parse(..., mode="eval")` convierte el texto en un árbol de nodos que *recorremos nosotros*, aceptando únicamente números, `+ - * / **` y los signos unarios `+`/`-`. Cualquier otra cosa (llamadas a funciones, nombres, atributos...) lanza `ValueError`.

2. **Todo se convierte a `float`.** Con enteros de Python, algo como `9**9**9` intentaría calcular un número con millones de dígitos y bloquearía el servidor. Con `float`, un resultado demasiado grande lanza `OverflowError`, que respondemos con un mensaje claro. También se rechaza el caso en que Python devuelve un número complejo (por ejemplo `(-8) ** 0.5`).

3. **Errores de negocio → `HTTPException(400)`.** División entre cero, desbordamiento y expresión inválida se traducen a `400` con un `detail` legible; el frontend solo muestra ese texto.
