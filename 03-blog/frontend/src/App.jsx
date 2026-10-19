import { useEffect, useState } from 'react'
import { api } from './api.js'

const fmt = (iso) => new Date(iso).toLocaleString('es')

export default function App() {
  const [posts, setPosts] = useState([])
  const [selected, setSelected] = useState(null) // el post abierto (con comentarios) o null
  const [error, setError] = useState('')

  async function loadPosts() {
    try {
      setPosts(await api('/posts'))
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  // PASO CLAVE 1: "navegación" sin librerías de rutas.
  // Si hay un post seleccionado mostramos su detalle; si no, la lista.
  // Al volver, recargamos la lista para actualizar el contador de comentarios.
  async function open(id) {
    try {
      setSelected(await api(`/posts/${id}`))
    } catch (e) {
      setError(e.message)
    }
  }

  function back() {
    setSelected(null)
    loadPosts()
  }

  return (
    <main className="app">
      <h1>Mini blog</h1>
      {error && <p className="error">{error}</p>}
      {selected ? (
        <PostView post={selected} onBack={back} onChange={setSelected} />
      ) : (
        <PostList posts={posts} onOpen={open} onCreated={loadPosts} />
      )}
    </main>
  )
}

function PostList({ posts, onOpen, onCreated }) {
  const [form, setForm] = useState({ title: '', body: '' })
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    try {
      setError('')
      await api('/posts', { method: 'POST', body: form })
      setForm({ title: '', body: '' })
      onCreated()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <form onSubmit={submit} className="card stack">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Título"
        />
        <textarea
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          placeholder="Escribe tu publicación..."
          rows={3}
        />
        <button>Publicar</button>
        {error && <p className="error">{error}</p>}
      </form>

      {posts.map((p) => (
        <article key={p.id} className="card">
          <h3>{p.title}</h3>
          <p className="muted">
            {fmt(p.created_at)} · {p.comment_count} comentarios
          </p>
          <button className="secondary" onClick={() => onOpen(p.id)}>
            Leer
          </button>
        </article>
      ))}
      {posts.length === 0 && <p className="muted">Todavía no hay publicaciones.</p>}
    </>
  )
}

function PostView({ post, onBack, onChange }) {
  const [form, setForm] = useState({ author: '', text: '' })
  const [error, setError] = useState('')

  // PASO CLAVE 2: tras crear el comentario, lo agregamos al post que ya tenemos
  // en memoria (no hace falta volver a pedir todo el post al servidor).
  async function submit(e) {
    e.preventDefault()
    try {
      setError('')
      const comment = await api(`/posts/${post.id}/comments`, { method: 'POST', body: form })
      onChange({ ...post, comments: [...post.comments, comment] })
      setForm({ ...form, text: '' }) // conservamos el autor para el siguiente comentario
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <button className="secondary" onClick={onBack}>
        ← Volver
      </button>
      <article className="card">
        <h2>{post.title}</h2>
        <p className="muted">{fmt(post.created_at)}</p>
        <p className="pre">{post.body}</p>
      </article>

      <h3>Comentarios ({post.comments.length})</h3>
      {post.comments.map((c) => (
        <div key={c.id} className="card">
          <strong>{c.author}</strong> <span className="muted">{fmt(c.created_at)}</span>
          <p className="pre">{c.text}</p>
        </div>
      ))}

      <form onSubmit={submit} className="card stack">
        <input
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          placeholder="Tu nombre"
        />
        <input
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
          placeholder="Escribe un comentario"
        />
        <button>Comentar</button>
        {error && <p className="error">{error}</p>}
      </form>
    </>
  )
}
