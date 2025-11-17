export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

async function handle(res: Response) {
  if (!res.ok) throw new Error((await res.json().catch(() => ({ detail: res.statusText }))).detail || 'error')
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
      // 통합 오프라인 메시지 (배너/버튼과 톤 맞춤)
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
}
