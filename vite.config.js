import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 46070,
    strictPort: true,
    allowedHosts: 'all',
    watch: {
      usePolling: true
    },
    hmr: {
      clientPort: 443,
      protocol: 'wss',
      host: 'calculadora.marcgrabel.cc'
    }
  }
})
