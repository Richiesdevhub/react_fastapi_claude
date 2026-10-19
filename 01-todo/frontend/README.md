# Frontend · Lista de tareas (To-Do)

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

1. **Carga inicial con `useEffect(..., [])`.** El arreglo de dependencias vacío hace que se ejecute una sola vez, al montar el componente. Dentro, `api('/todos')` devuelve una promesa cuyo resultado se guarda con `setTodos`.

2. **POST y actualización inmutable.** Tras crear la tarea, se agrega al estado con `setTodos(prev => [...prev, todo])`. React exige no mutar el arreglo original; la forma funcional (`prev => ...`) evita usar un valor desactualizado.

3. **PATCH y reemplazo de un solo elemento.** El servidor devuelve la tarea ya actualizada y `map` sustituye solo esa en la lista. Borrar usa `filter`.
