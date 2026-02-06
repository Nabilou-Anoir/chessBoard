import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'node',
    exclude: [
      'node_modules/**',
      'dist/**',
      '.git/**',
      '.idea/**',
      '.cache/**',
      'output/**',
      'temp/**',
      'tests/**'
    ]
  }
})
