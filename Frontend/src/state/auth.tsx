// Frontend/src/state/auth.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'

type Role = 'USER' | 'ADMIN'

type AuthContextType = {
  token: string | null
  expiresAt: number | null
  username: string | null
  role: Role | null
  enabled: boolean | null
  blocked: boolean | null
  login: (token: string, expiresInMs: number, username: string, role: Role, enabled?: boolean | null, blocked?: boolean | null) => void
  logout: () => void
  updateProfile: (username: string, role: Role, enabled: boolean | null, blocked: boolean | null) => void
  meLoaded: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [blocked, setBlocked] = useState<boolean | null>(null)
  const [meLoaded, setMeLoaded] = useState<boolean>(false)

  // Initial aus localStorage laden
  useEffect(() => {
    const stored = localStorage.getItem('auth')
    if (stored) {
      const parsed = JSON.parse(stored)
      setToken(parsed.token ?? null)
      setExpiresAt(parsed.expiresAt ?? null)
      setUsername(parsed.username ?? null)
      setRole(parsed.role ?? null)
      setEnabled(typeof parsed.enabled === 'boolean' ? parsed.enabled : null)
      setBlocked(typeof parsed.blocked === 'boolean' ? parsed.blocked : null)
    }
    setMeLoaded(false)
  }, [])

  // /users/me laden, sobald wir ein Token haben
  useEffect(() => {
    const loadMe = async () => {
      if (!token) { setMeLoaded(false); return }
      try {
        const res = await api.get('/users/me')
        const me = res.data as { username: string; role: Role; enabled: boolean; blocked: boolean }
        updateProfile(me.username, me.role, me.enabled, me.blocked)
        setMeLoaded(true)
      } catch {
        // 👉 WICHTIG: defensiv sein – bei Fehler NICHT an altem blocked=false hängen bleiben
        setBlocked(null)
        const stored = localStorage.getItem('auth')
        const base = stored ? JSON.parse(stored) : {}
        localStorage.setItem('auth', JSON.stringify({ ...base, blocked: null }))
        setMeLoaded(true)
      }
    }
    loadMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Token-Expiration (optional)
  useEffect(() => {
    if (token && expiresAt) {
      const id = setInterval(() => {
        if (Date.now() > expiresAt) logout()
      }, 5_000)
      return () => clearInterval(id)
    }
  }, [token, expiresAt])

  const login = (t: string, expiresInMs: number, u: string, r: Role, e?: boolean | null, b?: boolean | null) => {
    const exp = Date.now() + expiresInMs
    setToken(t)
    setExpiresAt(exp)
    setUsername(u)
    setRole(r)
    setEnabled(typeof e === 'boolean' ? e : null)
    setBlocked(typeof b === 'boolean' ? b : null)
    localStorage.setItem('auth', JSON.stringify({ token: t, expiresAt: exp, username: u, role: r, enabled: e ?? null, blocked: b ?? null }))
  }

  const logout = () => {
    setToken(null)
    setExpiresAt(null)
    setUsername(null)
    setRole(null)
    setEnabled(null)
    setBlocked(null)
    localStorage.removeItem('auth')
  }

  const updateProfile = (u: string, r: Role, e: boolean | null, b: boolean | null) => {
    setUsername(u)
    setRole(r)
    setEnabled(typeof e === 'boolean' ? e : null)
    setBlocked(typeof b === 'boolean' ? b : null)
    const stored = localStorage.getItem('auth')
    const base = stored ? JSON.parse(stored) : {}
    localStorage.setItem('auth', JSON.stringify({
      ...base,
      username: u,
      role: r,
      enabled: typeof e === 'boolean' ? e : null,
      blocked: typeof b === 'boolean' ? b : null
    }))
  }

  const value = useMemo(() => ({
    token, expiresAt, username, role, enabled, blocked, login, logout, updateProfile, meLoaded
  }), [token, expiresAt, username, role, enabled, blocked, meLoaded])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
