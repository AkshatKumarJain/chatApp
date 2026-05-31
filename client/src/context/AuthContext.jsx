import { useState } from 'react'
import { AuthContext } from './authStore'

const AUTH_STORAGE_KEY = 'quickchat-auth'

const defaultUser = {
  _id: 'current-user',
  fullName: 'Demo User',
  email: 'demo@quickchat.dev',
  bio: 'Available to chat',
  profilePic: '',
}

const readStoredAuth = () => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const saveStoredAuth = (auth) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => readStoredAuth())

  const login = async ({ email }) => {
    const nextAuth = {
      token: 'mock-token-replace-with-jwt',
      user: {
        ...defaultUser,
        email,
        fullName: email.split('@')[0] || defaultUser.fullName,
      },
    }

    saveStoredAuth(nextAuth)
    setAuth(nextAuth)
    return nextAuth
  }

  const register = async ({ fullName, email, bio }) => {
    const nextAuth = {
      token: 'mock-token-replace-with-jwt',
      user: {
        ...defaultUser,
        fullName,
        email,
        bio: bio || defaultUser.bio,
      },
    }

    saveStoredAuth(nextAuth)
    setAuth(nextAuth)
    return nextAuth
  }

  const updateProfile = async (profile) => {
    const nextAuth = {
      ...(auth || { token: 'mock-token-replace-with-jwt' }),
      user: {
        ...(auth?.user || defaultUser),
        ...profile,
      },
    }

    saveStoredAuth(nextAuth)
    setAuth(nextAuth)
    return nextAuth.user
  }

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setAuth(null)
  }

  const value = {
    token: auth?.token || null,
    user: auth?.user || null,
    isAuthenticated: Boolean(auth?.token),
    login,
    register,
    updateProfile,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
