import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'theme.js', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        id: '/',
        start_url: '/',
        scope: '/',
        name: 'CaDeT: Career Development Tracker',
        short_name: 'CaDeT',
        description: 'Personal career development operating system',
        theme_color: '#0d1321', // hsl(222, 47%, 6%)
        background_color: '#0d1321',
        display: 'standalone',
        icons: [
          { src: '/icons/cadet-v2-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          {
            src: '/icons/cadet-v2-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/cadet-v2-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': import.meta.dirname + '/src',
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})
