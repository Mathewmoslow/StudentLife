import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Remove base path for Vercel deployment (root level)
  // base: '/StudentLife/', // Only needed for GitHub Pages
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  }
})