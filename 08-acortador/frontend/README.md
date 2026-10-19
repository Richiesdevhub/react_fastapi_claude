# Frontend · Acortador de URLs

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

1. **El enlace corto se arma con `window.location.origin`.** En desarrollo es `http://localhost:5173/api/r/CODIGO`: pasa por el proxy de Vite hacia FastAPI. En producción sería tu dominio.

2. **Portapapeles.** `navigator.clipboard.writeText` solo funciona en contextos seguros (`https://` o `localhost`).

3. **`target="_blank"` con `rel="noreferrer"`.** Abre el enlace en otra pestaña sin dar acceso a `window.opener` ni enviar el referrer. El botón "Actualizar clics" vuelve a pedir la lista porque los clics ocurren fuera de la app.
