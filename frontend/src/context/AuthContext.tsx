import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/services'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string, adminKey?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('accessToken')
    if (stored && token) {
      try { setUser(JSON.parse(stored)) } catch { localStorage.clear() }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data: res } = await authApi.login({ email, password })
    const { user, tokens } = res.data
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string, phone?: string, adminKey?: string) => {
    const { data: res } = await authApi.register({ name, email, password, phone, adminKey })
    const { user, tokens } = res.data
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
  }, [])

  const logout = useCallback(() => {
    localStorage.clear()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
