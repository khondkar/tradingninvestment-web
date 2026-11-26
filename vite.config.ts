import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: { manifest: true, rolldownOptions: { input: { index: 'index.html', siteSearch: 'src/site-search-entry.tsx' } } },
})
