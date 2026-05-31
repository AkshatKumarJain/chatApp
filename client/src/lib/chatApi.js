const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000'

export const endpoints = {
  login: `${API_URL}/auth/login`,
  register: `${API_URL}/auth/register`,
  me: `${API_URL}/auth/me`,
  users: `${API_URL}/users`,
  messages: (userId) => `${API_URL}/messages/${userId}`,
  socket: WS_URL,
}

export const createSocketUrl = (token) => {
  const url = new URL(WS_URL)

  if (token) {
    url.searchParams.set('token', token)
  }

  return url.toString()
}
