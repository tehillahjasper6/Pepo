const baseUrl = import.meta.env.VITE_API_URL || ''

async function request(path, opts = {}) {
  const url = baseUrl ? `${baseUrl}${path}` : path
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...opts,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const err = new Error(res.statusText || 'Request failed')
    err.status = res.status
    err.body = text
    throw err
  }
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return res.json()
  return res.text()
}

export const apiGet = (path) => request(path, { method: 'GET' })
export const apiPost = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) })

// Auth endpoints
export const login = (email, password) => apiPost('/api/auth/login', { email, password })
export const signup = (email, password, name) => apiPost('/api/auth/signup', { email, password, name })
export const logout = () => apiPost('/api/auth/logout', {})
export const checkAuth = () => apiGet('/api/auth/me')

// Items endpoints
export const getItems = (filters = {}) => apiGet(`/api/items?${new URLSearchParams(filters).toString()}`)
export const createItem = (item) => apiPost('/api/items', item)

export default { baseUrl, apiGet, apiPost, login, signup, logout, checkAuth, getItems, createItem }
