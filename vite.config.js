import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'DHT11 Realtime Monitor',
        short_name: 'DHT11',
        theme_color: '#0C2B1C',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '192x192',
            type: 'image/x-icon'
          }
        ]
      }
    })
  ],
})
