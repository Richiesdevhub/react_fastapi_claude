# Frontend · Control de gastos

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

1. **`Promise.all` para pedir lista y resumen en paralelo.** Después de cada alta o baja se vuelve a llamar a `load()`, de modo que lista y resumen siempre coinciden con el servidor sin tener que recalcular nada en el cliente.

2. **Los `<input>` entregan texto.** Antes de enviar el monto se convierte con `Number(form.amount)`; si se enviara como texto, Pydantic lo aceptaría por conversión, pero conviene ser explícito.

3. **`toLocaleString` con `style: 'currency'`** formatea el dinero según el idioma del navegador.
