import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Requests starting with /api are forwarded to the backend:
      // no hardcoded backend URL in the frontend and no CORS issues in development.
      '/api': 'http://localhost:3001', // TODO(backend): replace 3001 with the real backend port
    },
  },
})
