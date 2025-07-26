import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// vite.config.ts
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    include: /\.(ts|tsx|js|jsx)$/,
    exclude: /node_modules/,
    loader: 'tsx',
  },
  optimizeDeps: {
    include: ['leaflet', 'sonner', 'lodash', 'i18next', 'recharts', '@tanstack/react-query'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      overlay: true,
    },
  },
  build: {
    // Optimize build for production
    minify: 'esbuild',
    sourcemap: process.env.NODE_ENV === 'production' ? false : 'inline',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['sonner', 'lucide-react'],
        },
      },
    },
  },
});