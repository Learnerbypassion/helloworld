import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  base: '/dhanvantari/',
  server: {
    host: true, // bind to 0.0.0.0 so phones on the LAN can reach the dev server
  },
})
