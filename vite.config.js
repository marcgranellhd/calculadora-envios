import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 46070,
    strictPort: true,
    allowedHosts: [
      'calculadora.marcgrabel.cc',
      '.marcgrabel.cc'
    ],
    watch: {
      usePolling: true
    },
    hmr: {
      host: '0.0.0.0',
      port: 46070
    }
  }
})
