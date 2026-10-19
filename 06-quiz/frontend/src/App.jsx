import { useEffect, useState } from 'react'
import { api } from './api.js'

export default function App() {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({}) // { idPregunta: índiceOpción }
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/questions')
      .then(setQuestions)
      .catch((e) => setError(e.message))
  }, [])

  // PASO CLAVE 1: guardar la respuesta elegida en un objeto indexado por id de pregunta.
  function choose(questionId, optionIndex) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  }

  // PASO CLAVE 2: se envía el objeto completo y el servidor devuelve el puntaje.
  async function submit() {
    try {
      setError('')
      setResult(await api('/submit', { method: 'POST', body: { answers } }))
    } catch (e) {
      setError(e.message)
    }
  }

  function restart() {
    setAnswers({})
    setResult(null)
  }

  // Busca el resultado de una pregunta concreta (si ya se calificó).
  const resultOf = (id) => result?.details.find((d) => d.id === id)

  return (
    <main className="app">
      <h1>Quiz de programación</h1>
      {error && <p className="error">{error}</p>}

      {questions.map((q) => {
        const r = resultOf(q.id)
        return (
          <fieldset key={q.id} className="card" disabled={result !== null}>
            <legend>{q.text}</legend>
            {q.options.map((opt, i) => (
              <label key={i} className="option">
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={answers[q.id] === i}
                  onChange={() => choose(q.id, i)}
                />{' '}
                {opt}
                {/* PASO CLAVE 3: tras calificar, marcamos la correcta y la elegida incorrecta. */}
                {r && r.correct_option === i && <span className="ok"> ✔ correcta</span>}
                {r && !r.correct && answers[q.id] === i && <span className="error"> ✘</span>}
              </label>
            ))}
          </fieldset>
        )
      })}

      {result ? (
        <section className="card center">
          <p className="big">
            {result.score} / {result.total}
          </p>
          <button onClick={restart}>Intentar de nuevo</button>
        </section>
      ) : (
        <button
          onClick={submit}
          disabled={questions.length === 0 || Object.keys(answers).length < questions.length}
        >
          Calificar
        </button>
      )}
    </main>
  )
}
