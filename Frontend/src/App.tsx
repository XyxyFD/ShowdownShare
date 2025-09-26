// Frontend/src/App.tsx
import { Route, Routes, Navigate, Link, useSearchParams } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import VerifyPage from './pages/VerifyPage'
import UploadPage from './pages/UploadPage'
import UnseenDownloadPage from './pages/UnseenDownloadPage'
import DownloadLockedPage from './pages/DownloadLockedPage'
import AdminPage from './pages/AdminPage'
import { useAuth } from './state/auth'
import AboutPage from './pages/AboutPage'

function HomePage() {
  const [searchParams] = useSearchParams()
  const message = searchParams.get('message')
  const error = searchParams.get('error')

  return (
    <div className="container mt-5">
      <div className="card shadow-sm p-4">
        <h1 className="mb-3">Welcome to ShowDownShare</h1>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <p>
          <b>ShowDownShare</b> is a platform where poker players can anonymously share and download hand histories. The goal is to make mass data analysis accessible to everyone, not just professionals with access to huge databases.
        </p>
        <ul>
          <li>Upload and share your hand histories</li>
          <li>After approval, download hand histories from others</li>
          <li>For hobby players, coaches, developers</li>
          <li>Every upload is reviewed</li>
        </ul>
        <p className="mt-3">
          <b>How it works:</b>
        </p>
        <ol>
          <li>Register for free</li>
          <li>Upload your own hand histories as a ZIP file</li>
          <li>After approval, you can download the collected hand histories of others</li>
        </ol>
        <p className="text-muted mt-3" style={{fontSize:15}}>
          For more information, see the <Link to="/about">About page</Link>.
          If you have any questions or problems, feel free to write an email to showdownshare.service@gmail.com
        </p>
      </div>
    </div>
  )
}

function NavBar() {
  const { token, logout, role, username, blocked, meLoaded } = useAuth()
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">ShowDownShare</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/about">About</Link>
            </li>
            {!token && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/signup">Signup</Link></li>
              </>
            )}
            {token && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/upload">Upload</Link></li>
                {/* Download-Link je nach Blocked-Status */}
                {meLoaded && blocked === false && <li className="nav-item"><Link className="nav-link" to="/download-unseen">Download</Link></li>}
                {meLoaded && blocked === true && <li className="nav-item"><Link className="nav-link" to="/download-unseen">Download locked</Link></li>}
                {role === 'ADMIN' && <li className="nav-item"><Link className="nav-link" to="/admin">Admin</Link></li>}
              </>
            )}
          </ul>
          {token && (
            <span className="navbar-text me-3">Hi {username}</span>
          )}
          {token && (
            <button className="btn btn-danger btn-sm" onClick={logout}>Logout</button>
          )}
        </div>
      </div>
    </nav>
  )
}

function Protected({ children }: { children: JSX.Element }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

function PublicOnly({ children }: { children: JSX.Element }) {
  const { token } = useAuth()
  if (token) return <Navigate to="/" replace />
  return children
}

// Gate-Komponente für die Download-Seite
function DownloadGate() {
  const { blocked, meLoaded } = useAuth()
  if (!meLoaded) return <div style={{ padding: 12 }}>Checking permissions...</div>
  if (blocked === false) return <UnseenDownloadPage />
  return <DownloadLockedPage />
}

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <NavBar />
      <div style={{ minHeight: 'calc(100vh - 60px)' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/login"
            element={
              <PublicOnly>
                <LoginPage />
              </PublicOnly>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnly>
                <SignupPage />
              </PublicOnly>
            }
          />
          <Route path="/verify" element={<VerifyPage />} />

          <Route
            path="/upload"
            element={
              <Protected>
                <UploadPage />
              </Protected>
            }
          />
          <Route
            path="/download-unseen"
            element={
              <Protected>
                <DownloadGate />
              </Protected>
            }
          />
          <Route
            path="/admin"
            element={
              <Protected>
                <AdminPage />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
