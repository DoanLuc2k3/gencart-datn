import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React MUST be in a single chunk and load first
          'react-vendor': [
            'react', 
            'react-dom', 
            'react-router-dom',
            'react/jsx-runtime'
          ],
          // Ant Design core (includes icons to avoid createContext issue)
          'antd-core': ['antd', '@ant-design/icons'],
          // Axios separate
          'axios': ['axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    target: 'esnext',
    sourcemap: false,
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'antd', 'axios'],
  },
})
