# Frontend · Calculadora

Interfaz con **React 19** y **Vite 8**, gestionada con **npm**.

## Ejecutar

```bash
npm install
npm run dev        # http://localhost:5173  (el backend debe estar corriendo en el puerto 8000)
npm run build      # genera la versión de producción en dist/
```

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `src/App.jsx` | La interfaz de esta app (comentada) |
| `src/api.js` | `api(ruta, opciones)`: `fetch` con prefijo `/api`, JSON automático y errores legibles |
| `src/main.jsx` | Punto de entrada: monta `<App />` |
| `src/styles.css` | Estilos (CSS puro, con modo oscuro) |
| `vite.config.js` | Plugin de React y proxy `/api` → FastAPI |

## Pasos clave explicados

Cada punto corresponde a un comentario `PASO CLAVE` en `src/App.jsx`.

1. **El frontend no calcula nada.** Solo construye el texto de la expresión y lo envía. Mantener la lógica y las validaciones en el servidor evita duplicarlas y asegura que haya una sola fuente de verdad.

2. **Un solo manejador para todas las teclas.** `press(key)` decide según el valor: `C` limpia, `⌫` borra el último carácter, `=` llama al backend y cualquier otra tecla se concatena. Los botones se generan con `KEYS.map(...)` en lugar de escribir 20 botones a mano.
