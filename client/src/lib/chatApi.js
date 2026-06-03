import axios from 'axios'

export const AUTH_STORAGE_KEY = 'quickchat-auth'

const trimUrl = (url) => url?.replace(/\/+$/, '')

export const BACKEND_URL = trimUrl(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000')
export const API_URL = trimUrl(import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`)
export const SOCKET_URL = trimUrl(import.meta.env.VITE_WS_URL || BACKEND_URL)

export const api = axios.create({
  baseURL: API_URL,
})

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.token = token
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete api.defaults.headers.common.token
  delete api.defaults.headers.common.Authorization
}

api.interceptors.request.use((config) => {
  config.headers = config.headers || {}

  if (config.headers?.token) {
    return config
  }

  try {
    const stored = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null')

    if (stored?.token) {
      config.headers.token = stored.token
      config.headers.Authorization = `Bearer ${stored.token}`
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return config
})

export const endpoints = {
  login: '/auth/login',
  signup: '/auth/signup',
  register: '/auth/signup',
  check: '/auth/check',
  updateProfile: '/auth/update-profile',
  users: '/messages/users',
  messages: (userId) => `/messages/${userId}`,
  sendMessage: (userId) => `/messages/send/${userId}`,
  markMessage: (messageId) => `/messages/mark/${messageId}`,
}
