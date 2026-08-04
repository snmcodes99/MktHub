import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// command = 'serve' (dev) | 'build' (prod)
export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // server block is only used by `vite dev` — completely ignored by `vite build`
  // Extra safety: only inject Docker-friendly settings during dev
  server: command === 'serve' ? {
    port: 5173,
    host: true,        // bind to 0.0.0.0 so Docker exposes it to host
    strictPort: true,
    watch: {
      usePolling: true, // Windows Docker volume hot-reload fix
    },
  } : {},
}))
