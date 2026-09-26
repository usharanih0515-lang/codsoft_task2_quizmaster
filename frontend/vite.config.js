import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/codsoft_task2_quizmaster/',
  plugins: [react()],
})
