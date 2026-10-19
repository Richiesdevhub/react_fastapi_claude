import { useEffect, useState } from 'react'
import { api } from './api.js'

export default function App() {
  const [links, setLinks] = useState([])
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  async function load() {
    try {
      setLinks(await api('/links'))
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function shorten(e) {
    e.preventDefault()
    try {
      setError('')
      const link = await api('/links', { method: 'POST', body: { url } })
      setLinks((prev) => [link, ...prev])
      setUrl('')
    } catch (err) {
      setError(err.message)
    }
  }

  // PASO CLAVE 1: el enlace corto se arma con el origen actual (http://localhost:5173),
  // así pasa por el proxy de Vite hacia FastAPI. En producción sería tu dominio.
  const shortUrl = (code) => `${window.location.origin}/api/r/${code}`

  // PASO CLAVE 2: Clipboard API. Solo funciona en contextos seguros (https o localhost).
  async function copy(code) {
    await navigator.clipboard.writeText(shortUrl(code))
  }

  return (
    <main className="app">
      <h1>Acortador de URLs</h1>

      <form onSubmit={shorten} className="row">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://ejemplo.com/una/url/muy/larga"
        />
        <button>Acortar</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="row">
        <h3 className="grow">Tus enlaces</h3>
        <button className="secondary" onClick={load}>
          Actualizar clics
        </button>
      </div>

      <ul className="list">
        {links.map((l) => (
          <li key={l.code} className="card">
            {/* PASO CLAVE 3: target="_blank" + rel="noreferrer" abre en otra pestaña de forma segura. */}
            <a href={shortUrl(l.code)} target="_blank" rel="noreferrer">
              {shortUrl(l.code)}
            </a>
            <p className="muted break">→ {l.url}</p>
            <div className="row">
              <span>{l.clicks} clics</span>
              <button className="secondary" onClick={() => copy(l.code)}>
                Copiar
              </button>
            </div>
          </li>
        ))}
        {links.length === 0 && <li className="muted">Aún no hay enlaces.</li>}
      </ul>
    </main>
  )
}
