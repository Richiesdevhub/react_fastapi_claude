# Frontend · Temporizador Pomodoro

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

1. **El temporizador es un efecto con `setInterval`.** Mientras `running` es `true`, cada segundo resta 1 a `secondsLeft`. La función que devuelve el efecto (`clearInterval`) es imprescindible: sin ella se acumularían intervalos y el reloj iría cada vez más rápido.

2. **Un segundo efecto reacciona a llegar a 0.** Cuando `secondsLeft` llega a 0 se guarda la sesión en el backend, se cambia de modo (enfoque ↔ descanso) y se reinicia el reloj. Separar "contar" de "qué pasa al terminar" mantiene cada efecto simple.

3. **Limitación conocida.** Restar 1 por tick se desfasa si el navegador reduce la frecuencia de los temporizadores en pestañas en segundo plano. Para más precisión, guarda la hora de finalización (`Date.now() + duración`) y calcula el tiempo restante en cada tick. El "modo rápido" (5 s) permite probar sin esperar 25 minutos.
