import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../state/auth'

export default function UploadPage() {
  const { username: storedUsername } = useAuth()
  const [zip, setZip] = useState<File | null>(null)
  const [username, setUsername] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Do NOT prefill the poker username from the account username
  useEffect(() => {
    // intentionally left blank: username should be entered manually if encryption is desired
  }, [storedUsername])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    if (!zip) {
      setError('Please select a .zip file to upload')
      setIsLoading(false)
      return
    }
    
    const form = new FormData()
    form.append('zip', zip)
    form.append('username', username)
    
    try {
      const res = await api.post('/files/uploadZip', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      
      const message = typeof res.data === 'string' ? res.data : 'Upload successful!'
      // Redirect to home page with success message
      navigate(`/?message=${encodeURIComponent(message)}`)
    } catch (err: any) {
      setError(err?.response?.data || 'Upload failed')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="container mt-5" style={{ maxWidth: 520 }}>
      <div className="card shadow-sm p-4">
        <h2 className="mb-3">Upload Hand History Zip</h2>
        <div className="mb-3 text-secondary small">
          If you want encryption, please enter the username you used in your poker account. If your hand histories consist of different sites and usernames, upload those separately since only one username can be encrypted per upload.
        </div>
        <div className="mb-3">
          <label className="form-label">Poker account username (optional for encryption)</label>
          <input
            className="form-control"
            placeholder="Enter your poker username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input type="file" accept=".zip" className="form-control" onChange={e => setZip(e.target.files?.[0] ?? null)} />
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>
    </form>
  )
}


