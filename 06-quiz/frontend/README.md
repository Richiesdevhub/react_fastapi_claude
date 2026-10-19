# Frontend · Quiz de programación

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

1. **Respuestas como objeto indexado por id.** `setAnswers(prev => ({ ...prev, [questionId]: optionIndex }))` guarda `{ 1: 0, 2: 2, ... }`, que es exactamente el formato que espera el backend.

2. **Enviar todo de una vez.** El botón "Calificar" se deshabilita hasta responder todas las preguntas y envía el objeto completo.

3. **Mostrar el resultado.** `result.details` trae, por pregunta, si fue correcta y cuál era la opción correcta; la interfaz marca con ✔ la correcta y con ✘ la elegida incorrecta. `fieldset disabled` bloquea los radios tras calificar.
