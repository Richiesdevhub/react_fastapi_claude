import { useState } from 'react'
import { api } from './api.js'

export default function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // PASO CLAVE 1: tres estados de una petición: cargando, error y datos.
  // "finally" garantiza que loading vuelva a false pase lo que pase.
  async function search(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // PASO CLAVE 2: encodeURIComponent protege caracteres especiales en la URL
      // (espacios, acentos, &, etc.). "San José" -> "San%20Jos%C3%A9".
      setWeather(await api(`/weather?city=${encodeURIComponent(city)}`))
    } catch (err) {
      setWeather(null)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app narrow">
      <h1>Clima</h1>
      <form onSubmit={search} className="row">
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ciudad" />
        <button disabled={loading}>{loading ? 'Buscando...' : 'Buscar'}</button>
      </form>

      {error && <p className="error">{error}</p>}

      {/* PASO CLAVE 3: renderizado condicional; solo se dibuja si hay datos. */}
      {weather && (
        <section className="card center">
          <h2>
            {weather.city}
            {weather.country && `, ${weather.country}`}
          </h2>
          <p className="big">{weather.temperature_c} °C</p>
          <p>{weather.description}</p>
          <p className="muted">Viento: {weather.wind_kmh} km/h</p>
        </section>
      )}
    </main>
  )
}
