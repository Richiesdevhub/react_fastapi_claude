// Pequeño ayudante para hablar con el backend.
// Todas las rutas empiezan por /api (Vite las reenvía a FastAPI, ver vite.config.js).
//
// Uso:  api('/todos')                                        -> GET
//       api('/todos', { method: 'POST', body: { title } })   -> POST con JSON
export async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    // fetch no convierte objetos a JSON por sí solo: lo hacemos aquí.
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  // fetch NO lanza error con respuestas 4xx/5xx; hay que comprobar res.ok a mano.
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    // FastAPI responde { detail: "texto" } con HTTPException y
    // { detail: [{ msg: ... }, ...] } con errores de validación (422).
    const detail = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail
    throw new Error(detail || `Error ${res.status}`)
  }

  // 204 No Content no trae cuerpo: no hay nada que parsear.
  return res.status === 204 ? null : res.json()
}
