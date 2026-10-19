import { useState } from 'react'
import { api } from './api.js'

const KEYS = [
  'C', '(', ')', '/',
  '7', '8', '9', '*',
  '4', '5', '6', '-',
  '1', '2', '3', '+',
  '0', '.', '⌫', '=',
]

export default function App() {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  // PASO CLAVE 1: el frontend NO calcula nada; solo arma el texto y lo envía.
  // La lógica y las validaciones viven en el backend (única fuente de verdad).
  async function calculate() {
    if (!expression) return
    try {
      setError('')
      const data = await api('/calculate', { method: 'POST', body: { expression } })
      setResult(String(data.result))
      setExpression(String(data.result)) // permite seguir operando con el resultado
    } catch (e) {
      setError(e.message)
    }
  }

  // PASO CLAVE 2: un solo manejador para todas las teclas, según su valor.
  function press(key) {
    setError('')
    if (key === 'C') {
      setExpression('')
      setResult('')
    } else if (key === '⌫') {
      setExpression((prev) => prev.slice(0, -1))
    } else if (key === '=') {
      calculate()
    } else {
      setExpression((prev) => prev + key)
    }
  }

  return (
    <main className="app narrow">
      <h1>Calculadora</h1>
      <div className="display">
        <div className="muted">{result && `= ${result}`}</div>
        <div className="big">{expression || '0'}</div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="keys">
        {KEYS.map((k) => (
          <button key={k} className={k === '=' ? '' : 'secondary'} onClick={() => press(k)}>
            {k}
          </button>
        ))}
      </div>
    </main>
  )
}
