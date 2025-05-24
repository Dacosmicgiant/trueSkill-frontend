import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    // Ensure compatibility with Vercel
    outDir: 'dist',
    rollupOptions: {
      // Reduce chunk size for better loading
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-checkbox', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', 
               '@radix-ui/react-form', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          charts: ['chart.js', 'react-chartjs-2'],
        }
      }
    }
  },
  // Fix potential issues with Vercel's Node.js environment
  ssr: {
    noExternal: ['@radix-ui/*']
  }
})