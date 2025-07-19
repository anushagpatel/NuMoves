import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// vite.config.js
export default defineConfig({
  base: '/',
  plugins: [react()],
  alias: {
    'sockjs-client': 'sockjs-client/dist/sockjs.min.js',
  },
  build: {
    outDir: 'dist',
  },
  define: {
    global: 'window',
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  }
})

