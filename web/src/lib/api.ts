export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handle(res: Response) {
  if (!res.ok) throw new Error((await res.json().catch(() => ({ detail: res.statusText }))).detail || 'error')
  return res.json()
}

async function request(path: string, init?: RequestInit) {
  try {
    const res = await fetch(path, init)
    return await handle(res)
  } catch (error) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('오프라인 상태입니다. 네트워크 연결 후 다시 시도해주세요.')
    }
    throw error
  }
}

export const api = {
  async get(path: string) {
    return request(`${API_BASE}${path}`, { headers: { ...authHeaders() } })
  },
  async post(path: string, body?: any) {
    return request(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body || {}),
    })
  },
}
