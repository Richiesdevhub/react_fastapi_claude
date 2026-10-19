import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // PASO CLAVE: todo lo que empiece por /api se reenvía al backend (FastAPI).
    // Así el navegador solo habla con Vite (mismo origen) y no hay problemas de CORS.
    // Se usa 127.0.0.1 y no "localhost" porque en algunos sistemas "localhost"
    // se resuelve a IPv6 (::1) mientras uvicorn escucha en IPv4 -> ECONNREFUSED.
    // "ws: true" habilita también WebSockets por el proxy (lo usa el proyecto del chat).
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', ws: true },
    },
  },
})
