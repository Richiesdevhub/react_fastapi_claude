# Backend · Clima actual

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
| `GET` | `/api/weather?city=Veracruz` | Devuelve ciudad, país, temperatura (°C), viento (km/h) y descripción |

## Prueba rápida sin frontend

Con el backend corriendo:

```bash
curl "http://127.0.0.1:8000/api/weather?city=Veracruz"
```

## Pasos clave explicados

Cada punto corresponde a un comentario `PASO CLAVE` en `main.py`.

1. **El backend como intermediario.** El navegador no llama a Open-Meteo directamente; llama a tu API y ella consulta al tercero. Ventajas: sin problemas de CORS, puedes ocultar una API key (si el servicio la pidiera) y entregas al frontend un formato simple y estable. Requiere conexión a internet desde la máquina donde corre el backend. Open-Meteo es gratuito para uso no comercial; revisa sus términos si lo vas a usar de otra forma.

2. **Validación del parámetro con `Query(min_length=2, max_length=80)`.** Un `?city=a` devuelve `422` automáticamente.

3. **`httpx.AsyncClient` + `await`.** Las llamadas de red son lentas; con `async def` y `await` el servidor puede atender otras peticiones mientras espera. `timeout=10` evita esperar indefinidamente. Se hacen dos llamadas encadenadas: primero geocodificación (ciudad → latitud/longitud) y después el pronóstico.

4. **Códigos de error correctos.** Si la ciudad no existe, `404`. Si falla el servicio externo (`httpx.HTTPError`: red caída, timeout, respuesta 5xx), `502 Bad Gateway`, que significa "el problema está en un servicio del que dependo".
