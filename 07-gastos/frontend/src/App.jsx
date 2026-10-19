import { useEffect, useState } from 'react'
import { api } from './api.js'

const CATEGORIES = ['comida', 'transporte', 'casa', 'ocio', 'otros']
const EMPTY = { description: '', amount: '', category: 'comida' }
const money = (n) => n.toLocaleString('es', { style: 'currency', currency: 'USD' })

export default function App() {
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState({ total: 0, by_category: {} })
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  // PASO CLAVE 1: dos peticiones independientes en paralelo con Promise.all.
  // Tras cada cambio volvemos a pedir ambos datos para que lista y resumen
  // siempre coincidan con lo que dice el servidor.
  async function load() {
    try {
      const [list, sum] = await Promise.all([api('/expenses'), api('/summary')])
      setExpenses(list)
      setSummary(sum)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function add(e) {
    e.preventDefault()
    try {
      setError('')
      // PASO CLAVE 2: el <input> siempre entrega texto; convertimos a número antes de enviar.
      await api('/expenses', {
        method: 'POST',
        body: { ...form, amount: Number(form.amount) },
      })
      setForm(EMPTY)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function remove(id) {
    try {
      await api(`/expenses/${id}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <main className="app">
      <h1>Control de gastos</h1>

      <section className="card">
        <p className="big">{money(summary.total)}</p>
        <ul className="plain">
          {Object.entries(summary.by_category).map(([cat, total]) => (
            <li key={cat}>
              {cat}: {money(total)}
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={add} className="card stack">
        <input
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Descripción"
        />
        <input
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          value={form.amount}
          onChange={onChange}
          placeholder="Monto"
        />
        <select name="category" value={form.category} onChange={onChange}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button>Agregar gasto</button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="list">
        {expenses.map((x) => (
          <li key={x.id} className="row">
            <span className="grow">
              {x.description} <span className="muted">({x.category}, {x.date})</span>
            </span>
            <strong>{money(x.amount)}</strong>
            <button className="danger" onClick={() => remove(x.id)}>
              ✕
            </button>
          </li>
        ))}
        {expenses.length === 0 && <li className="muted">Sin gastos registrados.</li>}
      </ul>
    </main>
  )
}
