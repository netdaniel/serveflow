import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Crucial for cPanel: Ensures assets use relative paths
  base: './', 
  build: {
    // This ensures your assets go into an 'assets' folder inside 'dist'
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  }
})
