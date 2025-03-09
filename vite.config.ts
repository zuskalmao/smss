import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      // Provide polyfills for Node.js builtins
      buffer: 'buffer',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
    },
  },
  define: {
    // Polyfill for Buffer
    global: 'globalThis',
  },
  build: {
    // Improve asset handling
    assetsInlineLimit: 4096,
    sourcemap: true,
    // Ensure static assets are properly copied
    copyPublicDir: true,
    // Reduce chunking to prevent missing files
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['framer-motion'],
          solana: ['@solana/web3.js', '@solana/wallet-adapter-react'],
        },
        // Ensure more predictable chunk sizes and names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  // Prevent resource timeout
  server: {
    fs: {
      strict: false,
    },
    hmr: {
      timeout: 120000,
    },
  }
})
