import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron/simple'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: [
                'electron',
                /^node:/,
                'path', 'fs', 'https', 'http', 'os', 'crypto', 'url',
                'stream', 'util', 'events', 'net', 'tls', 'child_process',
                'dotenv', 'axios', 'iconv-lite',
                '@srsembek/kaspi-smart-pos-sdk',
                '@srsembek/kaspi-smart-pos-sdk/dist/errors',
                '@srsembek/kaspi-smart-pos-sdk/dist/constants',
                'serialport',
              ],
              output: { format: 'cjs' },
            },
          },
        },
      },
      preload: {
        input: 'electron/preload.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['electron', /^node:/],
              output: { format: 'cjs', entryFileNames: '[name].cjs' },
            },
          },
        },
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    allowedHosts: true,
    port: 3000,
  },
})
