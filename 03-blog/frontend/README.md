# Frontend · Mini blog con comentarios

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

1. **"Navegación" sin librería de rutas.** Si `selected` tiene una publicación se muestra `PostView`; si es `null`, `PostList`. Es la forma más simple de tener dos pantallas. Para URLs reales (`/posts/3`) se usaría React Router.

2. **Actualizar el estado local en lugar de volver a pedir todo.** Al crear un comentario, el servidor devuelve ese comentario y se añade a `post.comments` en memoria. Al volver a la lista se recarga para actualizar los contadores.

3. **Props hacia abajo, eventos hacia arriba.** `App` guarda el estado compartido y pasa funciones (`onOpen`, `onBack`, `onChange`) a los componentes hijos.
