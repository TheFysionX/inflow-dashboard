import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor'
          }

          if (id.includes('node_modules/framer-motion')) {
            return 'motion'
          }

          if (id.includes('node_modules/recharts')) {
            return 'charts'
          }

          if (
            id.includes('/src/data/workbookSeed.js') ||
            id.includes('/src/data/demoData.js') ||
            id.includes('/src/data/overviewSupplement.js')
          ) {
            return 'demo-data'
          }

          if (id.includes('/src/data/selectors.js')) {
            return 'dashboard-models'
          }

          return undefined
        },
      },
    },
  },
})
