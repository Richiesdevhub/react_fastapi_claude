# 10 apps pequeñas para aprender React + FastAPI

Diez proyectos breves, cada uno dividido en **`frontend/`** (React + Vite + npm) y **`backend/`** (FastAPI + uv). Son las apps que más se usan como ejercicio al aprender un lenguaje o framework, ordenadas de más simple a más avanzada.

| # | Proyecto | Qué enseña |
|---|---|---|
| 01 | [Lista de tareas](01-todo) | CRUD completo, validación, estado en React |
| 02 | [Notas con búsqueda](02-notas) | Query params, `PUT` vs `PATCH`, condiciones de carrera en efectos |
| 03 | [Mini blog con comentarios](03-blog) | Relación uno a muchos, componentes, modelos de salida |
| 04 | [Calculadora](04-calculadora) | Seguridad: por qué no usar `eval()`, `ast`, errores 400 |
| 05 | [Clima](05-clima) | Consumir una API externa con `httpx` asíncrono, errores 404/502 |
| 06 | [Quiz](06-quiz) | No filtrar datos sensibles al cliente, calificar en el servidor |
| 07 | [Control de gastos](07-gastos) | `Literal`, `Field`, agregaciones, `Promise.all` |
| 08 | [Acortador de URLs](08-acortador) | `HttpUrl`, `secrets`, redirecciones 307, portapapeles |
| 09 | [Pomodoro](09-pomodoro) | `setInterval` en `useEffect`, efectos encadenados |
| 10 | [Chat en tiempo real](10-chat) | WebSockets, connection manager, ciclo de vida de una conexión |

## Versiones con las que se probó (octubre de 2026)

| Pieza | Versión |
|---|---|
| FastAPI | 0.146 (con `fastapi[standard]`: incluye el CLI `fastapi` y uvicorn) |
| Pydantic | 2.14 |
| React / React DOM | 19.3 |
| Vite | 8.3 (con `@vitejs/plugin-react` 6.1) |
| Node.js | 22 (Vite 8 exige 20.19+ o 22.12+) |
| Python | 3.12 o superior (uv lo descarga si no lo tienes) |

Cada proyecto incluye `uv.lock` y `package-lock.json`, que fijan exactamente estas versiones para que obtengas el mismo resultado. Para actualizar más adelante: `uv lock --upgrade` y `npm update` (o `npm install <paquete>@latest`).

## Antes de empezar: instala uv y Node.js (una sola vez)

**uv** (gestor de paquetes de Python):

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# Alternativas: brew install uv   |   pip install uv
uv --version      # comprueba la instalación (reabre la terminal si no lo encuentra)
```

**Node.js** (incluye `npm`): descarga la versión LTS desde <https://nodejs.org> o usa `nvm`.

```bash
node -v           # debe ser 20.19+ o 22.12+
npm -v
```

## Cómo ejecutar cualquier proyecto (dos terminales)

```bash
# Terminal 1 - backend
cd 01-todo/backend
uv sync                          # crea el entorno virtual e instala dependencias
uv run fastapi dev main.py       # http://127.0.0.1:8000  (docs en /docs)

# Terminal 2 - frontend
cd 01-todo/frontend
npm install
npm run dev                      # http://localhost:5173
```

Cambia `01-todo` por la carpeta que quieras. **Ejecuta un proyecto a la vez** (todos usan los puertos 8000 y 5173).

## Cómo funciona la conexión (igual en los 10)

`vite.config.js` reenvía todo lo que empiece por `/api` hacia FastAPI. El navegador solo habla con Vite, no hay problemas de CORS y el frontend usa rutas relativas. `src/api.js` es un pequeño envoltorio de `fetch` que añade el prefijo `/api`, convierte el cuerpo a JSON y traduce los errores de FastAPI en mensajes legibles.

## Dónde leer los pasos críticos

- En el **código**: comentarios `PASO CLAVE n` en `backend/main.py` y `frontend/src/App.jsx`.
- Ampliados en los README: `backend/README.md` (servidor) y `frontend/README.md` (interfaz) de cada proyecto, con los mismos números.

## Notas importantes

- Los datos se guardan **en memoria**: se pierden al reiniciar el backend. Es intencional para mantener cada app corta; cada README propone ejercicios para añadir una base de datos.
- El proyecto **05-clima** necesita internet desde la máquina donde corre el backend (usa Open-Meteo, sin API key).
- Son proyectos de aprendizaje. Para producción faltarían, entre otras cosas, persistencia, autenticación, límites de uso (rate limiting) y despliegue.
