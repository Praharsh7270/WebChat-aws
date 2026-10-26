import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const frontendDir = fileURLToPath(new URL('.', import.meta.url))
const backendEnvDir = resolve(frontendDir, '../Backend')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, backendEnvDir, ['PORT', 'VITE_'])
  const backendTarget =
    env.VITE_BACKEND_URL || `http://127.0.0.1:${env.PORT || 3000}`

  return {
    envDir: backendEnvDir,
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/socket.io': {
          target: backendTarget,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  }
})
