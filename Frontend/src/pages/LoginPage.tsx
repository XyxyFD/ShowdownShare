import { FormEvent, useState } from 'react'
import { api, LoginResponse } from '../api/client'
import { useAuth } from '../state/auth'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { login, updateProfile } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await api.post<LoginResponse>('/auth/login', { username, password })
      const token = res.data.token
      const expiresIn = res.data.expiresIn
      // Set minimal auth state first; will be updated by /users/me
      login(token, expiresIn, username, 'USER', null, null)

      // Fetch the authenticated user's profile and update context
      try {
        const me = await api.get('/users/me')
        const data = me.data as { username: string; role: 'USER' | 'ADMIN'; enabled: boolean; blocked: boolean }
        updateProfile(data.username, data.role, data.enabled, data.blocked)
      } catch (e) {
        // If /me fails, we keep minimal state; navigation still proceeds
      }
      navigate('/upload')
    } catch (err: any) {
      // Spezifische Fehlermeldungen für verschiedene Szenarien
      const errorMessage = err?.response?.data?.error || err?.response?.data
      
      if (errorMessage === 'Account not verified. Please verify your account.') {
        setError('Account is deactivated. Please contact an administrator.')
      } else if (errorMessage === 'User not found') {
        setError('Incorrect Username or Password')
      } else {
        // Für alle anderen Fehler (falsches Passwort, etc.) generische Nachricht
        setError('Incorrect Username or Password')
      }
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 360, display: 'grid', gap: 8 }}>
      <h2>Login</h2>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  )
}


