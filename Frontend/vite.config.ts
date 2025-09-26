// Frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // dev proxy to Spring Boot (default 8080)
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/files': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Proxy nur für API-Endpunkte, nicht für /admin selbst!
      '/admin/users': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/admin/files': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
