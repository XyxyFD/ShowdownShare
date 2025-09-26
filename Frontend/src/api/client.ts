// Frontend/src/api/client.ts
import axios from 'axios'

export const api = axios.create({
  // Nutzt .env (VITE_API_URL) oder fällt auf lokalen Spring Boot zurück
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080',
})

// Token automatisch anhängen
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth')
  if (stored) {
    const { token } = JSON.parse(stored)
    if (token) {
      config.headers = config.headers ?? {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
  }
  return config
})

export type LoginResponse = { token: string; expiresIn: number }
