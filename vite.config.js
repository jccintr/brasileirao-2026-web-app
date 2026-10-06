import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // Só no `npm run dev`: o servidor do Vite chama a football-data.org no lugar do navegador,
      // evitando o bloqueio de CORS. Use VITE_API_BASE_URL=/football-api/v4 no .env.
      proxy: {
        '/football-api': {
          target: 'https://api.football-data.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/football-api/, ''),
          headers: { 'X-Auth-Token': env.VITE_FOOTBALL_DATA_TOKEN ?? '' },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.js',
    },
  }
})