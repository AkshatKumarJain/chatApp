import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { api, AUTH_STORAGE_KEY, endpoints, setAuthToken, SOCKET_URL } from '../lib/chatApi'
import { AuthContext } from './authStore'

const readStoredAuth = () => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

const saveStoredAuth = (auth) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
  setAuthToken(auth.token)
}

const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  setAuthToken(null)
}

const parseAuthResponse = (response) => {
  const body = response.data || {}
  const user = body.user || body.data

  if (!body.token || !user) {
    throw new Error(body.message || 'Invalid authentication response')
  }

  return {
    token: body.token,
    user,
  }
}

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const storedAuth = readStoredAuth()
    setAuthToken(storedAuth?.token)
    return storedAuth
  })
  const [isCheckingAuth, setIsCheckingAuth] = useState(Boolean(auth?.token))
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    const verifyStoredToken = async () => {
      const storedAuth = readStoredAuth()

      if (!storedAuth?.token) {
        setIsCheckingAuth(false)
        return
      }

      try {
        setAuthToken(storedAuth.token)
        const response = await api.get(endpoints.check)
        const nextAuth = {
          ...storedAuth,
          user: response.data.user || storedAuth.user,
        }

        saveStoredAuth(nextAuth)
        setAuth(nextAuth)
      } catch {
        clearStoredAuth()
        setAuth(null)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    verifyStoredToken()
  }, [])

  useEffect(() => {
    if (!auth?.user?._id) {
      return
    }

    const socketInstance = io(SOCKET_URL, {
      query: {
        userId: auth.user._id,
      },
    })
    const handleConnect = () => setSocket(socketInstance)
    const handleDisconnect = () => {
      setSocket(null)
      setOnlineUsers([])
    }

    socketInstance.on('connect', handleConnect)
    socketInstance.on('disconnect', handleDisconnect)
    socketInstance.on('getOnlineUsers', setOnlineUsers)

    return () => {
      socketInstance.off('connect', handleConnect)
      socketInstance.off('disconnect', handleDisconnect)
      socketInstance.off('getOnlineUsers', setOnlineUsers)
      socketInstance.disconnect()
    }
  }, [auth?.user?._id])

  const login = async ({ email, password }) => {
    const response = await api.post(endpoints.login, { email, password })
    const nextAuth = parseAuthResponse(response)

    saveStoredAuth(nextAuth)
    setAuth(nextAuth)
    return nextAuth
  }

  const register = async ({ fullName, email, password, bio }) => {
    const response = await api.post(endpoints.signup, { fullName, email, password, bio })
    const nextAuth = parseAuthResponse(response)

    saveStoredAuth(nextAuth)
    setAuth(nextAuth)
    return nextAuth
  }

  const updateProfile = async (profile) => {
    if (!auth?.token) {
      throw new Error('You must be logged in to update your profile')
    }

    const response = await api.put(endpoints.updateProfile, profile)
    const updatedUser = response.data.user || response.data.data
    const nextAuth = {
      ...auth,
      user: updatedUser,
    }

    saveStoredAuth(nextAuth)
    setAuth(nextAuth)
    return updatedUser
  }

  const logout = () => {
    socket?.disconnect()
    clearStoredAuth()
    setSocket(null)
    setOnlineUsers([])
    setAuth(null)
  }

  const value = {
    token: auth?.token || null,
    user: auth?.user || null,
    socket,
    onlineUsers,
    isCheckingAuth,
    isAuthenticated: Boolean(auth?.token && auth?.user),
    login,
    register,
    updateProfile,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
