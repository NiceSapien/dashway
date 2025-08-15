import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/logs': {
        target: 'http://localhost:4444',
        changeOrigin: true,
      }
    },
    allowedHosts: [
      'localhost',
      '.pythagora.ai',
      '.github.dev',
      '.app.github.dev',
      'https://bug-free-yodel-wjqj6vrrp5c5jj5-5173.app.github.dev/',
      'bug-free-yodel-wjqj6vrrp5c5jj5-5173.app.github.dev',
      'bug-free-yodel-wjqj6vrrp5c5jj5-3000.app.github.dev'
    ],
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**', '**/public/**', '**/log/**']
    }
  },
})
