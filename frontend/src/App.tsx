import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Shows from './pages/Shows/Shows'
import SeatSelection from './pages/SeatSelection/SeatSelection'
import BookingDetail from './pages/BookingDetail/BookingDetail'
import MyBookings from './pages/MyBookings/MyBookings'
import Admin from './pages/Admin/Admin'

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  if (isLoading) return <div className="spinner" style={{ marginTop: 100 }} />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'ADMIN') return <Navigate to="/" replace />
  return <>{children}</>
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Home />} />
            <Route path="/shows" element={<Shows />} />
            <Route path="/shows/:id" element={<SeatSelection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/booking/:id" element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

const NotFound: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '100px 24px' }}>
    <p style={{ fontSize: '4rem', marginBottom: 16 }}>🎬</p>
    <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Page Not Found</h1>
    <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>The page you're looking for doesn't exist.</p>
    <a href="/" className="btn btn-primary">Go Home</a>
  </div>
)

export default App
