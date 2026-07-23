import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:  {
    historyApiFallback: true,
    // Forward API calls to `vercel dev` (npm run dev:api) so serverless
    // functions work under the normal Vite dev server on 5173.
    proxy: { '/api': 'http://localhost:3000' },
  },
  preview: { historyApiFallback: true },
})
