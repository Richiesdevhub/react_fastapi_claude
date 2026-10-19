# Frontend · Clima actual

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

1. **Tres estados de una petición: cargando, error y datos.** `setLoading(true)` antes de pedir y `finally { setLoading(false) }` después, para que el botón se rehabilite pase lo que pase.

2. **`encodeURIComponent(city)`.** Protege la URL de espacios y caracteres especiales (`San José` → `San%20Jos%C3%A9`).

3. **Renderizado condicional.** `{weather && (...)}` solo dibuja la tarjeta si hay datos.
