import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: true
    },
    fs: {
      // Allow serving files from the project root
      allow: ['.']
    }
  },
  build: {
    // Ensure proper MIME types in production
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  }
})
