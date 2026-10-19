import { useEffect, useState } from 'react'
import { api } from './api.js'

const MODES = {
  focus: { label: 'Enfoque', seconds: 25 * 60, next: 'break' },
  break: { label: 'Descanso', seconds: 5 * 60, next: 'focus' },
}
const FAST_SECONDS = 5 // "modo rápido" para probar sin esperar 25 minutos

const clock = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export default function App() {
  const [mode, setMode] = useState('focus')
  const [fast, setFast] = useState(false)
  const total = fast ? FAST_SECONDS : MODES[mode].seconds
  const [secondsLeft, setSecondsLeft] = useState(total)
  const [running, setRunning] = useState(false)
  const [history, setHistory] = useState({ focus_today: 0, recent: [] })
  const [error, setError] = useState('')

  async function loadHistory() {
    try {
      setHistory(await api('/sessions'))
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  // PASO CLAVE 1: el temporizador es un efecto con setInterval.
  // La función que devolvemos (cleanup) lo detiene cuando "running" cambia o el
  // componente se desmonta. Sin ella, se acumularían intervalos y el reloj iría más rápido.
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [running])

  // PASO CLAVE 2: reaccionar al llegar a 0. Guardamos la sesión en el backend,
  // cambiamos de modo y reiniciamos el reloj.
  useEffect(() => {
    if (secondsLeft > 0) return
    setRunning(false)
    const nextMode = MODES[mode].next
    api('/sessions', { method: 'POST', body: { kind: mode, seconds: total } })
      .then(loadHistory)
      .catch((e) => setError(e.message))
    setMode(nextMode)
    setSecondsLeft(fast ? FAST_SECONDS : MODES[nextMode].seconds)
  }, [secondsLeft, mode, fast, total])

  function reset(newMode = mode, newFast = fast) {
    setRunning(false)
    setMode(newMode)
    setSecondsLeft(newFast ? FAST_SECONDS : MODES[newMode].seconds)
  }

  return (
    <main className="app narrow">
      <h1>Pomodoro</h1>

      <section className="card center">
        <p className="muted">{MODES[mode].label}</p>
        <p className="big">{clock(secondsLeft)}</p>
        <div className="row center-row">
          <button onClick={() => setRunning((r) => !r)}>{running ? 'Pausar' : 'Iniciar'}</button>
          <button className="secondary" onClick={() => reset()}>
            Reiniciar
          </button>
        </div>
        <label className="muted">
          <input
            type="checkbox"
            checked={fast}
            disabled={running}
            onChange={(e) => {
              setFast(e.target.checked)
              reset(mode, e.target.checked)
            }}
          />{' '}
          Modo rápido ({FAST_SECONDS} s) para probar
        </label>
      </section>

      {error && <p className="error">{error}</p>}

      <h3>Sesiones de enfoque hoy: {history.focus_today}</h3>
      <ul className="list">
        {history.recent.map((s) => (
          <li key={s.id} className="row">
            <span className="grow">{MODES[s.kind].label}</span>
            <span className="muted">
              {clock(s.seconds)} · {new Date(s.finished_at).toLocaleTimeString('es')}
            </span>
          </li>
        ))}
        {history.recent.length === 0 && <li className="muted">Aún no hay sesiones.</li>}
      </ul>
    </main>
  )
}
