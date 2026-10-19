# Frontend · Chat en tiempo real

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

1. **Abrir la conexión dentro de un `useEffect` que depende de `joined`.** La URL usa `ws://` en `http` y `wss://` en `https`, y `window.location.host`, de modo que pase por el proxy de Vite (configurado con `ws: true`).

2. **`ws.onmessage`.** Cada mensaje llega como texto JSON y se añade al estado con `JSON.parse(event.data)`.

3. **Limpieza con `return () => ws.close()`.** Cierra la conexión al desmontar el componente o cuando cambian las dependencias; sin ella quedarían conexiones abiertas (fuga de recursos).

4. **`useRef` para guardar el socket.** Una referencia mantiene el objeto `WebSocket` entre renders sin provocar un re-render al cambiarlo. Antes de enviar se comprueba `readyState === WebSocket.OPEN`. No hay reconexión automática: si el servidor se reinicia, recarga la página.
