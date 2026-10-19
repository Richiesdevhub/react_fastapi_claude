import { useEffect, useState } from 'react'
import { api } from './api.js'

const EMPTY = { title: '', content: '' }

export default function App() {
  const [notes, setNotes] = useState([])
  const [query, setQuery] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null) // null = creando, número = editando
  const [error, setError] = useState('')

  // PASO CLAVE 1: buscar cada vez que cambia "query".
  // El "flag" ignore evita una condición de carrera: si el usuario escribe rápido,
  // una respuesta lenta y vieja podría llegar después de la nueva y pisarla.
  // La función de limpieza se ejecuta antes del siguiente efecto y marca esa respuesta como obsoleta.
  useEffect(() => {
    let ignore = false
    api(`/notes?q=${encodeURIComponent(query)}`)
      .then((data) => {
        if (!ignore) setNotes(data)
      })
      .catch((e) => {
        if (!ignore) setError(e.message)
      })
    return () => {
      ignore = true
    }
  }, [query])

  // Un solo manejador para todos los inputs: usa el atributo "name" del campo.
  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // PASO CLAVE 2: el mismo formulario sirve para crear (POST) y editar (PUT).
  async function save(e) {
    e.preventDefault()
    try {
      setError('')
      if (editingId === null) {
        const note = await api('/notes', { method: 'POST', body: form })
        setNotes((prev) => [note, ...prev])
      } else {
        const note = await api(`/notes/${editingId}`, { method: 'PUT', body: form })
        setNotes((prev) => prev.map((n) => (n.id === editingId ? note : n)))
      }
      cancel()
    } catch (err) {
      setError(err.message)
    }
  }

  function edit(note) {
    setEditingId(note.id)
    setForm({ title: note.title, content: note.content })
  }

  function cancel() {
    setEditingId(null)
    setForm(EMPTY)
  }

  async function remove(id) {
    try {
      await api(`/notes/${id}`, { method: 'DELETE' })
      setNotes((prev) => prev.filter((n) => n.id !== id))
      if (editingId === id) cancel()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="app">
      <h1>Notas</h1>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar..."
      />

      <form onSubmit={save} className="card stack">
        <input name="title" value={form.title} onChange={onChange} placeholder="Título" />
        <textarea
          name="content"
          value={form.content}
          onChange={onChange}
          placeholder="Contenido"
          rows={3}
        />
        <div className="row">
          <button>{editingId === null ? 'Guardar nota' : 'Actualizar nota'}</button>
          {editingId !== null && (
            <button type="button" className="secondary" onClick={cancel}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      {notes.map((n) => (
        <article key={n.id} className="card">
          <h3>{n.title}</h3>
          <p className="pre">{n.content}</p>
          <div className="row">
            <button className="secondary" onClick={() => edit(n)}>
              Editar
            </button>
            <button className="danger" onClick={() => remove(n.id)}>
              Borrar
            </button>
          </div>
        </article>
      ))}
      {notes.length === 0 && <p className="muted">No hay notas.</p>}
    </main>
  )
}
