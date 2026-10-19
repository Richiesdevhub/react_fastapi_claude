import { useEffect, useRef, useState } from 'react'

export default function App() {
  const [name, setName] = useState('')
  const [joined, setJoined] = useState(false)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [status, setStatus] = useState('desconectado')
  const socketRef = useRef(null) // guarda el WebSocket sin provocar re-renderizados
  const bottomRef = useRef(null)

  // PASO CLAVE 1: abrir la conexión como efecto que depende de "joined".
  useEffect(() => {
    if (!joined) return

    // ws:// en http y wss:// en https. Usamos window.location.host para pasar por el
    // proxy de Vite (/api -> FastAPI con soporte WebSocket).
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(
      `${protocol}://${window.location.host}/api/ws?name=${encodeURIComponent(name)}`,
    )
    socketRef.current = ws

    ws.onopen = () => setStatus('conectado')
    ws.onclose = () => setStatus('desconectado')
    // PASO CLAVE 2: cada mensaje del servidor llega como texto JSON.
    ws.onmessage = (event) => setMessages((prev) => [...prev, JSON.parse(event.data)])

    // PASO CLAVE 3: cerrar el socket al desmontar el componente o cuando cambian las
    // dependencias. Sin este cleanup las conexiones viejas quedarían abiertas y el
    // servidor seguiría enviándoles mensajes (fuga de recursos).
    return () => ws.close()
  }, [joined, name])

  // Desplazar el chat hacia el último mensaje.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send(e) {
    e.preventDefault()
    const ws = socketRef.current
    // readyState === 1 significa OPEN: solo enviamos si la conexión está lista.
    if (ws && ws.readyState === WebSocket.OPEN && text.trim()) {
      ws.send(text)
      setText('')
    }
  }

  function join(e) {
    e.preventDefault()
    if (name.trim()) setJoined(true)
  }

  if (!joined) {
    return (
      <main className="app narrow">
        <h1>Chat</h1>
        <form onSubmit={join} className="row">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
          <button>Entrar</button>
        </form>
        <p className="muted">Abre esta página en dos pestañas para ver el tiempo real.</p>
      </main>
    )
  }

  return (
    <main className="app">
      <h1>
        Chat <small className="muted">({status})</small>
      </h1>

      <div className="chat">
        {messages.map((m, i) =>
          m.type === 'system' ? (
            <p key={i} className="muted center">
              {m.text}
            </p>
          ) : (
            <p key={i} className={m.user === name.trim() ? 'mine' : ''}>
              <strong>{m.user}</strong>: {m.text}{' '}
              <span className="muted">{new Date(m.time).toLocaleTimeString('es')}</span>
            </p>
          ),
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="row">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Mensaje" />
        <button disabled={status !== 'conectado'}>Enviar</button>
      </form>
    </main>
  )
}
