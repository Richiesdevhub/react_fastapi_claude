# Frontend · Notas con búsqueda y edición

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

1. **Búsqueda con `useEffect` y bandera `ignore`.** El efecto se vuelve a ejecutar cada vez que cambia `query`. Si el usuario escribe rápido, una respuesta lenta de una búsqueda anterior podría llegar *después* de la más reciente y pisarla (condición de carrera). La función de limpieza que devuelve el efecto se ejecuta antes del siguiente y marca esa respuesta como obsoleta (`ignore = true`).

2. **Un formulario para crear y editar.** `editingId` es `null` al crear y el id de la nota al editar; según su valor se hace `POST` o `PUT`. Un único manejador `onChange` sirve para todos los campos usando el atributo `name` del input (`[e.target.name]: e.target.value`).

3. **`encodeURIComponent`.** Escapa el texto antes de ponerlo en la URL (espacios, acentos, `&`, etc.).
