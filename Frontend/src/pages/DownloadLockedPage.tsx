// Frontend/src/pages/DownloadLockedPage.tsx
import { Link } from 'react-router-dom'

export default function DownloadLockedPage() {
  return (
    <div className="container mt-5">
      <div className="card shadow-sm p-4" style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 className="mb-3">Downloads are locked</h2>
        <p>
          You currently cannot download hand histories because your account does not have download access yet.
          To unlock downloads, please contribute by uploading your own hand histories first
          (ideally a few thousand hands). Once your uploads are reviewed and accepted by an admin, your
          download access will be enabled.
        </p>
        <p>
          You can upload your poker hand history files here: <Link to="/upload">Upload</Link>
        </p>
        <p className="text-muted">
          If you believe this is a mistake or need assistance, please contact an administrator.
        </p>
      </div>
    </div>
  )
}
