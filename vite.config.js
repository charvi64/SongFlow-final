import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// vite.config.js
export default defineConfig({
  // remove or comment out the base:
  // base: '/some-path/',
  plugins: [react()],
});
