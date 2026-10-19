# 04 · Calculadora

Una calculadora cuyo backend evalúa expresiones de forma segura.

**Qué practicas:**
- Por qué nunca debes usar `eval()` con datos del usuario
- Árboles sintácticos con `ast` y listas blancas de operaciones
- Traducir errores de cálculo a respuestas HTTP 400

## Estructura

```
04-calculadora/
├── backend/    API con FastAPI (Python, gestionado con uv)
│   ├── main.py            <- todo el código del servidor, comentado
│   ├── pyproject.toml     <- dependencias (uv)
│   └── README.md          <- explicación ampliada de los pasos clave del BACKEND
└── frontend/   Interfaz con React + Vite (gestionada con npm)
    ├── src/App.jsx        <- la interfaz, comentada
    ├── src/api.js         <- ayudante para llamar al backend
    ├── vite.config.js     <- proxy /api -> FastAPI
    └── README.md          <- explicación ampliada de los pasos clave del FRONTEND
```

## Requisitos

- **uv** (gestor de paquetes y entornos de Python). Instalación:
  - macOS / Linux: `curl -LsSf https://astral.sh/uv/install.sh | sh`
  - Windows (PowerShell): `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`
  - Alternativas: `brew install uv` o `pip install uv`
  - Comprueba con `uv --version`. uv descarga por sí solo una versión de Python adecuada si no tienes una (se necesita Python 3.12 o superior).
- **Node.js** 20.19+ o 22.12+ (lo exige Vite 8), que incluye `npm`. Comprueba con `node -v`. Descarga desde <https://nodejs.org> o usa `nvm`.

## Puesta en marcha (necesitas dos terminales)

### Terminal 1 · Backend

```bash
cd backend
uv sync                          # crea .venv e instala las dependencias de pyproject.toml / uv.lock
uv run fastapi dev main.py       # arranca la API con recarga automática
```

- API: <http://127.0.0.1:8000>
- Documentación interactiva (Swagger): <http://127.0.0.1:8000/docs>

### Terminal 2 · Frontend

```bash
cd frontend
npm install                      # instala React, Vite, etc. en node_modules
npm run dev                      # arranca el servidor de desarrollo de Vite
```

Abre <http://localhost:5173>. **Deja corriendo las dos terminales a la vez.**

## Cómo se conectan frontend y backend

El navegador solo habla con Vite (`localhost:5173`). `vite.config.js` define un **proxy**: toda petición que empiece por `/api` se reenvía a FastAPI (`127.0.0.1:8000`). Ventajas: no hay que configurar CORS en desarrollo y el frontend usa rutas relativas (`/api/...`). Todas las llamadas pasan por `src/api.js`, que añade el prefijo `/api`, convierte el cuerpo a JSON y traduce los errores de FastAPI a mensajes legibles.

> En producción lo habitual es servir el frontend compilado (`npm run build` → carpeta `dist/`) y el backend bajo el mismo dominio (por ejemplo con un proxy inverso), o habilitar CORS con `CORSMiddleware` si están en dominios distintos.

## Cómo crear este proyecto desde cero (para aprender)

**Backend**

```bash
uv init --bare backend           # crea solo pyproject.toml
cd backend
uv add "fastapi[standard]"   # instala FastAPI, el CLI "fastapi" y uvicorn
# crea main.py con el código de este proyecto
uv run fastapi dev main.py
```

**Frontend**

```bash
npm create vite@latest frontend -- --template react   # plantilla oficial de React con Vite
cd frontend
npm install
# reemplaza el contenido de src/ por el de este proyecto (main.jsx, App.jsx, api.js, styles.css)
# y añade el bloque "server.proxy" de vite.config.js
npm run dev
```

## Documentación ampliada

- Pasos clave del **backend**: [`backend/README.md`](backend/README.md)
- Pasos clave del **frontend**: [`frontend/README.md`](frontend/README.md)

## Ejercicios para seguir aprendiendo

- Añade funciones como raíz cuadrada o porcentaje (ampliando la lista blanca).
- Guarda un historial de operaciones en el backend.
- Soporta el teclado físico (`onKeyDown`).

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| El frontend muestra errores de red / `ECONNREFUSED` en la terminal de Vite | El backend no está corriendo. Arráncalo en la otra terminal. |
| `Address already in use` | El puerto está ocupado. Usa `uv run fastapi dev main.py --port 8001` y cambia el `target` del proxy en `vite.config.js`. |
| `npm run dev` falla por la versión de Node | Vite 8 necesita Node 20.19+ o 22.12+. Actualiza Node. |
| Los datos desaparecen al reiniciar | Es lo esperado: se guardan en memoria. Los ejercicios proponen añadir una base de datos. |
