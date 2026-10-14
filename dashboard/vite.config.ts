import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    // URL path the app is served from: "/" for a main site, e.g. "/dashboard/" for a sub-site.
    // Set VITE_BASE_PATH in .env.<mode> (must start and end with "/").
    base: env.VITE_BASE_PATH || '/',
    plugins: [react()],
  }
})
