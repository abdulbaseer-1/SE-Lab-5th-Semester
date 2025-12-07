
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import path from 'path'

// Load frontend .env manually
dotenv.config({ path: path.resolve(__dirname, '.env') })

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 💡 ADD THIS BLOCK
  server: {
    proxy: {
      // All requests starting with '/api' (e.g., /api/playwright/scan-accessibility)
      '/api': {
        // Will be forwarded to your backend server (e.g., Express running on port 3000)
        target: process.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false, // Use true if your backend is HTTPS
        // optional: rewrite: (path) => path.replace(/^\/api/, ''), // Not needed if your backend also uses /api
      },
    },
  },
})