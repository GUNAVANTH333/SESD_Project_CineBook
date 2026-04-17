import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Navbar.css'

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">CINEBOOK</span>
        </Link>

        <div className="navbar-links">
          <Link to="/movies" className="nav-link">Movies</Link>
          <Link to="/shows" className="nav-link">Shows</Link>
          {isAuthenticated && <Link to="/bookings" className="nav-link">My Bookings</Link>}
          {user?.role === 'ADMIN' && <Link to="/admin" className="nav-link nav-link-admin">Admin</Link>}
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu" onClick={() => setMenuOpen(!menuOpen)}>
              <div className="user-avatar">{user?.name.charAt(0).toUpperCase()}</div>
              <span className="user-name">{user?.name.split(' ')[0]}</span>
              <span className="chevron">▾</span>
              {menuOpen && (
                <div className="dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user?.name}</p>
                    <p className="dropdown-email">{user?.email}</p>
                    {user?.role === 'ADMIN' && <span className="badge badge-accent">Admin</span>}
                  </div>
                  <div className="divider" style={{ margin: '8px 0' }} />
                  <Link to="/bookings" className="dropdown-item" onClick={() => setMenuOpen(false)}>My Bookings</Link>
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost" style={{ padding: '9px 18px', fontSize: '0.875rem' }}>Sign In</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '9px 18px', fontSize: '0.875rem' }}>Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
