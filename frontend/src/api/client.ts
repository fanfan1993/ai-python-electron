// Use Vite's same-origin /api proxy in development. This avoids localhost vs
// 127.0.0.1 IPv4/IPv6 and CORS mismatches in embedded browsers.
const desktopApiUrl = window.location.protocol === 'morrow:' ? 'http://127.0.0.1:8000' : ''
const API_URL = (import.meta.env.VITE_API_URL ?? desktopApiUrl).trim().replace(/\/$/, '')

export async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail || `请求失败 (${response.status})`)
  }
  return response.json() as Promise<T>
}

export const api = {
  register: (data: { email: string; name: string; password: string }) => request<{ access_token: string; user: { id: number; email: string; name: string } }>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) => request<{ access_token: string; user: { id: number; email: string; name: string } }>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  chat: (message: string, history: { role: string; content: string }[], token: string) => request<{ reply: string; sources: string[]; intent: string }>('/api/chat', { method: 'POST', body: JSON.stringify({ message, history }) }, token),
  book: (data: { dish_id: string; dish_name: string; meal_date: string; meal_slot: string }, token: string) => request('/api/bookings', { method: 'POST', body: JSON.stringify(data) }, token),
  mood: (data: { mood: string; energy: number; note: string }, token: string) => request('/api/moods', { method: 'POST', body: JSON.stringify(data) }, token),
  weather: (city: string) => request<import('../types.weather').Weather>(`/api/weather?city=${encodeURIComponent(city)}`),
}
