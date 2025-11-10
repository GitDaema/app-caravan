export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handle(res: Response) {
  if (!res.ok) throw new Error((await res.json().catch(() => ({ detail: res.statusText }))).detail || 'error')
  return res.json()
}

export const api = {
  async get(path: string) {
    const res = await fetch(`${API_BASE}${path}`, { headers: { ...authHeaders() } })
    return handle(res)
  },
  async post(path: string, body?: any) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body || {}),
    })
    return handle(res)
  },
}

