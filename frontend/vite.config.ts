import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      buffer: 'buffer',
    },
  },
  define: {
    global: 'globalThis',
  },
  server: { port: 5173 },
  preview: { port: 5173 },
  optimizeDeps: {
    include: ['buffer'],
  },
})

