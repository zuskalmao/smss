import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This provides polyfills needed for the browser
      buffer: 'buffer',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      // Explicitly map @trezor/env-utils to our mock
      '@trezor/env-utils': path.resolve(__dirname, './local_modules/trezor-env-utils-mock/lib/envUtils.js'),
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
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      // Explicitly handle external Node.js modules
      external: [
        'http', 'https', 'zlib', 'url', 'vm', 'crypto', 'fs', 'path', 'stream', 'os'
      ],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion'],
          solana: ['@solana/web3.js', '@solana/spl-token'],
        },
      },
    },
  }
})
