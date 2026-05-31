import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/ProtectedRoute'
import assets from './assets/assets'

const App = () => {
  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${assets.bgImage})` }}>
      <Routes>
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage mode="login" />} />
        <Route path="/register" element={<LoginPage mode="register" />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
