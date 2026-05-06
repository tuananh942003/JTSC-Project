import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Generate source maps for production debugging
    sourcemap: false,
    // Chunk size warning limit
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'tiptap-vendor': [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-underline',
            '@tiptap/extension-text-align',
            '@tiptap/extension-text-style',
            '@tiptap/extension-color',
            '@tiptap/extension-font-family',
            '@tiptap/extension-highlight',
            '@tiptap/extension-image',
            '@tiptap/extension-link',
            '@tiptap/extension-table',
            '@tiptap/extension-table-cell',
            '@tiptap/extension-table-header',
            '@tiptap/extension-table-row',
          ],
        },
      },
    },
  },
  server: {
    proxy: {
      '/chatbot-api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chatbot-api/, '/api'),
      },
    },
  },
})
