export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

async function handle(res: Response) {
  if (!res.ok) {
    const data = await res.json().catch(() => ({ detail: res.statusText }))
    const message =
      (typeof data === 'string' && data) ||
      data.detail ||
      data.message ||
      data.error ||
      res.statusText ||
      'error'
    throw new Error(message)
  }
  return res.json()
}

async function request(path: string, init?: RequestInit) {
  try {
    const res = await fetch(path, {
      credentials: 'include',
      ...(init || {}),
    })
    return await handle(res)
  } catch (error) {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) {
      // 오프라인 상태일 때 공통 메시지
      throw new Error('오프라인 상태입니다. 네트워크 연결 후 다시 시도해 주세요.')
    }
    throw error
  }
}

export const api = {
  async get(path: string) {
    return request(`${API_BASE}${path}`)
  },
  async post(path: string, body?: any) {
    return request(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    })
  },
  async put(path: string, body?: any) {
    return request(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    })
  },
}
