import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    
    // Frontend-Validierung: Passwörter müssen übereinstimmen
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    try {
      await api.post('/auth/signup', { email, username, password, password_2x: confirmPassword })
      // Automatische Umleitung zur Verifikationsseite mit der E-Mail
      navigate(`/verify?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      // Backend gibt Fehlermeldungen in einem Map-Format zurück
      const errorMessage = err?.response?.data?.error || err?.response?.data || 'Signup failed'
      setError(errorMessage)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <form onSubmit={onSubmit} style={{ maxWidth: 360, width: '100%', display: 'grid', gap: 8 }}>
        <h2 style={{ textAlign: 'center' }}>Signup</h2>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <input placeholder="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        <button type="submit">Create Account</button>
        {message && <div style={{ color: 'green' }}>{message}</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
    </div>
  )
}


