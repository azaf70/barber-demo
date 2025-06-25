import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ui': path.resolve(__dirname, './src/shared/components/ui'),
      '@components': path.resolve(__dirname, './src/shared/components'),
      '@utils': path.resolve(__dirname, './src/shared/utils'),
      '@services': path.resolve(__dirname, './src/shared/services'),
      '@features': path.resolve(__dirname, './src/features'),
      '@features/customers': path.resolve(__dirname, './src/features/customers'),
      '@features/barbers': path.resolve(__dirname, './src/features/barbers'),
      '@features/admin': path.resolve(__dirname, './src/features/admin'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@shared/types': path.resolve(__dirname, '../shared/types'),
      '@shared/schemas': path.resolve(__dirname, '../shared/schemas'),
      '@shared/constants': path.resolve(__dirname, '../shared/constants')
    }
  }
})
