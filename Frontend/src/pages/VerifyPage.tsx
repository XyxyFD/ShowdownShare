import { FormEvent, useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function VerifyPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // E-Mail aus URL-Parametern laden
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  // Fokus auf das erste Eingabefeld setzen
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus()
    }
  }, [])

  const handleCodeChange = (index: number, value: string) => {
    // Nur Zahlen erlauben
    if (!/^\d*$/.test(value)) return

    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Automatisch zum nächsten Feld springen
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Zurück zum vorherigen Feld bei Backspace
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading(true)

    const code = verificationCode.join('')
    if (code.length !== 6) {
      setError('Please enter the 6-digit verification code')
      setIsLoading(false)
      return
    }

    try {
      await api.post('/auth/verify', { email, verificationCode: code })
      setMessage('Account successfully verified! You can now log in.')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: any) {
      // Backend gibt spezifische Fehlermeldungen zurück
      const errorMessage = err?.response?.data || 'Verification failed'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const resendCode = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }
    
    try {
      await api.post('/auth/resend-verification', { email })
      setMessage('Verification code has been resent')
    } catch (err: any) {
      // Backend gibt spezifische Fehlermeldungen zurück
      const errorMessage = err?.response?.data || 'Failed to resend verification code'
      setError(errorMessage)
    }
  }

  return (
    <div style={{ 
      maxWidth: 400, 
      margin: '0 auto', 
      padding: '20px',
      textAlign: 'center'
    }}>
      <h2 style={{ marginBottom: '24px', color: '#333' }}>Konto verifizieren</h2>
      
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', textAlign: 'left', fontWeight: '500' }}>
            E-Mail-Adresse
          </label>
          <input
            type="email"
            placeholder="ihre.email@beispiel.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '12px', textAlign: 'left', fontWeight: '500' }}>
            Verifikationscode
          </label>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            Geben Sie den 6-stelligen Code aus Ihrer E-Mail ein
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            justifyContent: 'center',
            marginBottom: '8px'
          }}>
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength={1}
                value={digit}
                onChange={e => handleCodeChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                style={{
                  width: '50px',
                  height: '50px',
                  textAlign: 'center',
                  fontSize: '20px',
                  fontWeight: '600',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = '#007bff'}
                onBlur={e => e.target.style.borderColor = '#ddd'}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || verificationCode.join('').length !== 6}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            opacity: (isLoading || verificationCode.join('').length !== 6) ? 0.6 : 1
          }}
        >
          {isLoading ? 'Verifiziere...' : 'Konto verifizieren'}
        </button>

        <button
          type="button"
          onClick={resendCode}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#007bff',
            border: '1px solid #007bff',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Code erneut senden
        </button>

        {message && (
          <div style={{ 
            color: 'green', 
            backgroundColor: '#d4edda', 
            padding: '12px', 
            borderRadius: '6px',
            border: '1px solid #c3e6cb'
          }}>
            {message}
          </div>
        )}
        
        {error && (
          <div style={{ 
            color: '#721c24', 
            backgroundColor: '#f8d7da', 
            padding: '12px', 
            borderRadius: '6px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}
      </form>
    </div>
  )
}


