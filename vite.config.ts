import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This provides polyfills needed for the browser
      buffer: 'buffer',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
    },
  },
  define: {
    // This is needed for the Buffer polyfill
    'process.env': {},
    global: 'window',
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
  },
})
