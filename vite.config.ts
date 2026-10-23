import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works from any GitHub Pages project URL.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
  },
})
