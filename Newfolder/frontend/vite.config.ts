import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    viteStaticCopy({
      targets: [
        { src: 'public/_redirects', dest: '.' },
        { src: 'public/static.json', dest: '.' }
      ]
    })
  ],
  build: {
    outDir: 'dist',
    copyPublicDir: true
  },
  base: '/'
})