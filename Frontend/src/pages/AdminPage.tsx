import { useEffect, useState } from 'react'
import { api } from '../api/client'

type FileMetaDto = {
  id: number
  filename: string
  ownerUsername: string
  status: string
  uploadDate: string
}

type UserDto = {
  id: number
  username: string
  email: string
  role: string
  enabled: boolean
  blocked: boolean
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'files' | 'users'>('files')
  
  // Files state
  const [statusFilter, setStatusFilter] = useState<string>('PENDING')
  const [rows, setRows] = useState<FileMetaDto[]>([])
  
  // Users state
  const [users, setUsers] = useState<UserDto[]>([])
  const [userSearch, setUserSearch] = useState<string>('')
  const [userFilter, setUserFilter] = useState<string>('all')
  const [userFiles, setUserFiles] = useState<FileMetaDto[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const normalizeToArray = (data: any): FileMetaDto[] => {
    if (Array.isArray(data)) return data as FileMetaDto[]
    if (data && Array.isArray(data.content)) return data.content as FileMetaDto[]
    return []
  }

  const loadFiles = async () => {
    setError(null)
    setIsLoading(true)
    try {
      const res = await api.get(`/admin/files${statusFilter ? `?status=${statusFilter}` : ''}`)
      setRows(normalizeToArray(res.data))
    } catch (err: any) {
      setError(err?.response?.data || 'Failed to load files')
      setRows([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    setError(null)
    setIsLoading(true)
    try {
      const res = await api.get<UserDto[]>('/admin/users')
      setUsers(res.data)
    } catch (err: any) {
      setError(err?.response?.data || 'Failed to load users')
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserFiles = async (username: string) => {
    setError(null)
    setIsLoading(true)
    try {
      const res = await api.get(`/admin/users/files?username=${username}`)
      setUserFiles(normalizeToArray(res.data))
      setSelectedUser(username)
    } catch (err: any) {
      setError(err?.response?.data || 'Failed to load user files')
      setUserFiles([])
    } finally {
      setIsLoading(false)
    }
  }

  const downloadFile = async (fileId: number) => {
    try {
      const res = await api.get(`/files/download/${fileId}`)
      const downloadUrl = res.data
      
      // Create download link and trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err: any) {
      setError(err?.response?.data || 'Failed to download file')
    }
  }

  useEffect(() => {
    if (activeTab === 'files') {
      loadFiles()
    } else if (activeTab === 'users') {
      loadUsers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, activeTab])

  const changeStatus = async (id: number, to: 'APPROVED' | 'REJECT') => {
    try {
      await api.post(`/admin/files/${id}/approve?status=${to}`)
      await loadFiles()
    } catch (err: any) {
      setError(err?.response?.data || 'Failed to update')
    }
  }

  const deleteFile = async (id: number) => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return
    }
    try {
      await api.delete(`/files/delete/${id}`)
      // Optimistic update
      setRows(prev => prev.filter(row => row.id !== id))
      // Ensure consistency with backend
      await loadFiles()
    } catch (err: any) {
      setError(err?.response?.data || 'Failed to delete')
      await loadFiles()
    }
  }

  const activateUser = async (userId: number) => {
    try {
      await api.post(`/admin/users/enable?id=${userId}`)
      await loadUsers()
    } catch (err: any) {
      setError(err?.response?.data || 'Failed to activate user')
    }
  }

  const deactivateUser = async (userId: number) => {
    try {
      await api.post(`/admin/users/disable?id=${userId}`)
      await loadUsers()
    } catch (err: any) {
      setError(err?.response?.data || 'Failed to deactivate user')
    }
  }

  const blockUser = async (userId: number) => {
    try {
      await api.post(`/admin/users/block?id=${userId}`)
      await loadUsers()
    } catch (err: any) {
      setError(err?.response?.data || 'Failed to block user')
    }
  }

  const unblockUser = async (userId: number) => {
    try {
      await api.post(`/admin/users/unblock?id=${userId}`)
      await loadUsers()
    } catch (err: any) {
      setError(err?.response?.data || 'Failed to unblock user')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearch.toLowerCase())
    
    if (userFilter === 'all') return matchesSearch
    if (userFilter === 'enabled') return matchesSearch && user.enabled
    if (userFilter === 'disabled') return matchesSearch && !user.enabled
    if (userFilter === 'blocked') return matchesSearch && user.blocked
    if (userFilter === 'admin') return matchesSearch && user.role === 'ADMIN'
    
    return matchesSearch
  })

  return (
    <div>
      <h2>Admin Panel</h2>
      
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <button 
          onClick={() => setActiveTab('files')}
          style={{ 
            padding: '8px 16px', 
            border: 'none', 
            backgroundColor: activeTab === 'files' ? '#007bff' : 'transparent',
            color: activeTab === 'files' ? 'white' : 'black',
            cursor: 'pointer'
          }}
        >
          Files Management
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          style={{ 
            padding: '8px 16px', 
            border: 'none', 
            backgroundColor: activeTab === 'users' ? '#007bff' : 'transparent',
            color: activeTab === 'users' ? 'white' : 'black',
            cursor: 'pointer'
          }}
        >
          User Management
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '12px' }}>{error}</div>}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div>
          <h3>File Management</h3>
          <label>
            Status filter:
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">ALL</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </label>
          {isLoading ? (
            <div>Loading files...</div>
          ) : rows.length === 0 ? (
            <div>No files found.</div>
          ) : (
            <table cellPadding={6} style={{ borderCollapse: 'collapse', marginTop: 12 }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Filename</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.filename}</td>
                    <td>{r.ownerUsername}</td>
                    <td>{r.status}</td>
                    <td>{new Date(r.uploadDate).toLocaleString()}</td>
                    <td>
                      <button onClick={() => changeStatus(r.id, 'APPROVED')}>Approve</button>
                      <button onClick={() => changeStatus(r.id, 'REJECT')}>Reject</button>
                      <button onClick={() => downloadFile(r.id)} style={{ backgroundColor: '#28a745', color: 'white', marginLeft: '4px' }}>Download</button>
                      <button onClick={() => deleteFile(r.id)} style={{ backgroundColor: '#dc3545', color: 'white', marginLeft: '4px' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <h3>User Management</h3>
          
          {/* Search and Filter */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <select 
              value={userFilter} 
              onChange={e => setUserFilter(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="all">All Users</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
              <option value="blocked">Blocked</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {isLoading ? (
            <div>Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div>No users found.</div>
          ) : (
            <table cellPadding={6} style={{ borderCollapse: 'collapse', marginTop: 12 }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Blocked</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span style={{ 
                        color: user.enabled ? 'green' : 'red',
                        fontWeight: 'bold'
                      }}>
                        {user.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        color: user.blocked ? 'crimson' : 'green',
                        fontWeight: 'bold'
                      }}>
                        {user.blocked ? 'Blocked' : 'Unblocked'}
                      </span>
                    </td>
                    <td>
                      {user.enabled ? (
                        <button 
                          onClick={() => deactivateUser(user.id)}
                          style={{ 
                            backgroundColor: '#dc3545', 
                            color: 'white',
                            marginRight: '4px'
                          }}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button 
                          onClick={() => activateUser(user.id)}
                          style={{ 
                            backgroundColor: '#28a745', 
                            color: 'white',
                            marginRight: '4px'
                          }}
                        >
                          Activate
                        </button>
                      )}
                      {user.blocked ? (
                        <button
                          onClick={() => unblockUser(user.id)}
                          style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            marginRight: '4px'
                          }}
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => blockUser(user.id)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            marginRight: '4px'
                          }}
                        >
                          Block
                        </button>
                      )}
                      <button 
                        onClick={() => loadUserFiles(user.username)}
                        style={{ backgroundColor: '#007bff', color: 'white' }}
                      >
                        View Files
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* User Files View */}
          {selectedUser && (
            <div style={{ marginTop: '24px', borderTop: '1px solid #ddd', paddingTop: '16px' }}>
              <h4>Files uploaded by {selectedUser}</h4>
              <button 
                onClick={() => setSelectedUser(null)}
                style={{ marginBottom: '12px', padding: '4px 8px' }}
              >
                Close
              </button>
              {userFiles.length === 0 ? (
                <div>No files found for this user.</div>
              ) : (
                <table cellPadding={6} style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Filename</th>
                      <th>Status</th>
                      <th>Uploaded</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userFiles.map(file => (
                      <tr key={file.id}>
                        <td>{file.id}</td>
                        <td>{file.filename}</td>
                        <td>{file.status}</td>
                        <td>{new Date(file.uploadDate).toLocaleString()}</td>
                        <td>
                          <button 
                            onClick={() => downloadFile(file.id)} 
                            style={{ backgroundColor: '#28a745', color: 'white' }}
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}


