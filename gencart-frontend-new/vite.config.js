import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:8000/api'
  
  return {
    plugins: [
      react(),
      visualizer({
        open: false,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      })
    ],
    define: {
      // Replace hardcoded localhost URLs at build time
      '"http://localhost:8000/api"': JSON.stringify(apiUrl),
      "'http://localhost:8000/api'": JSON.stringify(apiUrl),
      '"http://localhost:8000"': JSON.stringify(apiUrl.replace('/api', '')),
      "'http://localhost:8000'": JSON.stringify(apiUrl.replace('/api', '')),
    },
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
  }
})
