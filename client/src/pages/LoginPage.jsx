import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { useAuth } from '../context/useAuth'

const LoginPage = ({ mode = 'login' }) => {
  const isRegister = mode === 'register'
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login, register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (isRegister && !fullName.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.')
      return
    }

    setIsSubmitting(true)

    try {
      if (isRegister) {
        await register({ fullName, email, password, bio })
      } else {
        await login({ email, password })
      }

      navigate(redirectTo, { replace: true })
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-10 px-6 py-10 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      <img src={assets.logo_big} alt="QuickChat" className="w-[min(42vw,260px)]" />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md border border-gray-500/70 bg-white/10 text-white p-6 sm:p-8 flex flex-col gap-5 rounded-lg shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-medium text-2xl">{isRegister ? 'Create account' : 'Welcome back'}</h1>
            <p className="text-sm text-gray-300 mt-1">
              {isRegister ? 'Register to start chatting.' : 'Login to continue your conversations.'}
            </p>
          </div>
          {isRegister && (
            <Link to="/login" aria-label="Back to login">
              <img src={assets.arrow_icon} alt="" className="w-5 cursor-pointer rotate-180" />
            </Link>
          )}
        </div>

        {isRegister && (
          <input
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            type="text"
            className="p-3 bg-transparent border border-gray-500 rounded-md outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Full name"
            required
          />
        )}

        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          placeholder="Email address"
          required
          className="p-3 bg-transparent border border-gray-500 rounded-md outline-none focus:ring-2 focus:ring-violet-500"
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          placeholder="Password"
          required
          className="p-3 bg-transparent border border-gray-500 rounded-md outline-none focus:ring-2 focus:ring-violet-500"
        />

        {isRegister && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            rows={4}
            className="p-3 bg-transparent border border-gray-500 rounded-md outline-none resize-none focus:ring-2 focus:ring-violet-500"
            placeholder="Short bio"
          />
        )}

        {error && <p className="text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Login Now'}
        </button>

        <label className="flex items-start gap-2 text-xs text-gray-300">
          <input type="checkbox" required className="mt-1 accent-violet-500" />
          <span>I agree to keep conversations respectful and private.</span>
        </label>

        <p className="text-sm text-gray-300 text-center">
          {isRegister ? 'Already have an account?' : 'New to QuickChat?'}{' '}
          <Link to={isRegister ? '/login' : '/register'} className="text-violet-300 hover:text-white">
            {isRegister ? 'Login' : 'Register'}
          </Link>
        </p>
      </form>
      </div>
  )
}

export default LoginPage
