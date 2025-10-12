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
        manualChunks(id) {
          // React vendor
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          
          // Ant Design core
          if (id.includes('node_modules/antd') && !id.includes('@ant-design/plots') && !id.includes('@ant-design/icons')) {
            return 'antd-core';
          }
          
          // Ant Design icons
          if (id.includes('node_modules/@ant-design/icons')) {
            return 'antd-icons';
          }
          
          // DON'T bundle @ant-design/plots - let it be lazy loaded
          // if (id.includes('node_modules/@ant-design/plots')) {
          //   return 'antd-plots';
          // }
          
          // Axios
          if (id.includes('node_modules/axios')) {
            return 'axios';
          }
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
