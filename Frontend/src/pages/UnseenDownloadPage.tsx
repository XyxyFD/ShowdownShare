// Frontend/src/pages/UnseenDownloadPage.tsx
import { api } from '../api/client'
import { useAuth } from '../state/auth'
import { useEffect, useState } from 'react'

export default function UnseenDownloadPage() {
  const { username } = useAuth()
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCount = async () => {
    if (!username) return
    try {
      setError(null)
      const res = await api.get('/files/unseen/count', { params: { username } })
      // Erwartetes Format: { count: number }
      setCount(typeof res.data?.count === 'number' ? res.data.count : 0)
    } catch (e: any) {
      setError(e?.response?.data || 'Failed to load unseen count')
    }
  }

  useEffect(() => {
    fetchCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  const download = async () => {
    if (!username) return
    setLoading(true)
    setError(null)
    try {
      // Korrekt: Download als ZIP von /files/unseen.zip
      const res = await api.get('/files/unseen.zip', {
        responseType: 'blob',
        validateStatus: () => true, // wir prüfen selbst
      })

      if (res.status >= 200 && res.status < 300 && res.data) {
        // Blob speichern
        const blob = new Blob([res.data], { type: 'application/zip' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'unseen-files.zip'
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      } else {
        setError('Failed to prepare download')
      }
    } catch (e: any) {
      setError(e?.response?.data || 'Download failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-sm p-4" style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 className="mb-3">Download unseen files</h2>
        <div className="mb-3">
          {error && <div className="alert alert-danger">{String(error)}</div>}
          {count !== null ? (
            <div>Unseen files: <strong>{count}</strong></div>
          ) : (
            <div>Loading unseen count...</div>
          )}
        </div>
        <button onClick={download} className="btn btn-primary w-100 mb-2" disabled={loading}>
          {loading ? 'Preparing...' : 'Download unseen.zip'}
        </button>
        <small className="text-muted">Downloads all files you have not yet downloaded as a ZIP.</small>
      </div>
    </div>
  )
}
