import { useEffect, useState } from 'react'
import { api } from './api.js'

export default function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  // PASO CLAVE 1: cargar datos al montar el componente.
  // El arreglo [] vacío significa "ejecutar solo una vez".
  useEffect(() => {
    api('/todos')
      .then(setTodos)
      .catch((e) => setError(e.message))
  }, [])

  // Ejecuta una acción y muestra el error del backend si falla.
  async function run(action) {
    try {
      setError('')
      await action()
    } catch (e) {
      setError(e.message)
    }
  }

  // PASO CLAVE 2: POST al backend y actualizar el estado con la respuesta.
  // Usamos la forma funcional setTodos(prev => ...) para no depender de un valor viejo.
  function addTodo(e) {
    e.preventDefault() // evita que el formulario recargue la página
    run(async () => {
      const todo = await api('/todos', { method: 'POST', body: { title } })
      setTodos((prev) => [...prev, todo])
      setTitle('')
    })
  }

  // PASO CLAVE 3: PATCH y reemplazar solo el elemento modificado.
  function toggle(id) {
    run(async () => {
      const updated = await api(`/todos/${id}`, { method: 'PATCH' })
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))
    })
  }

  function remove(id) {
    run(async () => {
      await api(`/todos/${id}`, { method: 'DELETE' })
      setTodos((prev) => prev.filter((t) => t.id !== id))
    })
  }

  return (
    <main className="app">
      <h1>Lista de tareas</h1>

      <form onSubmit={addTodo} className="row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿Qué hay que hacer?"
        />
        <button>Agregar</button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="list">
        {todos.map((t) => (
          <li key={t.id} className="row">
            <label className="grow">
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
              <span className={t.done ? 'done' : ''}> {t.title}</span>
            </label>
            <button className="danger" onClick={() => remove(t.id)}>
              Borrar
            </button>
          </li>
        ))}
        {todos.length === 0 && <li className="muted">No hay tareas todavía.</li>}
      </ul>
    </main>
  )
}
