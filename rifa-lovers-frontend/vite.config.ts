import { defineConfig } from 'vite'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — reactCompilerPreset export missing from .d.ts in some plugin versions
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({
      presets: [reactCompilerPreset()],
      // Exclude node_modules from Babel processing to speed up build
      exclude: /node_modules/,
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: ['.tunnelmole.net'],
    hmr: {
      clientPort: 443,
    },
  },
  build: {
    // Increase chunk size warning limit (optional, reduces noise)
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Manual code splitting for better caching and smaller initial chunks
        manualChunks: (id: string) => {
          // Core React ecosystem
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'vendor-react'
          }
          // State management & data fetching
          if (id.includes('zustand') || id.includes('@tanstack/react-query') || id.includes('axios')) {
            return 'vendor-state'
          }
          // UI Components (Radix primitives)
          if (id.includes('@radix-ui/')) {
            return 'vendor-ui'
          }
          // 3D & Animation (heavy libraries, load only when needed)
          if (id.includes('three') || id.includes('@react-three/fiber') || id.includes('@react-three/drei')) {
            return 'vendor-3d'
          }
          if (id.includes('gsap') || id.includes('@gsap/react')) {
            return 'vendor-anim'
          }
          // Icons
          if (id.includes('lucide-react')) {
            return 'vendor-icons'
          }
          // Utilities
          if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('date-fns')) {
            return 'vendor-utils'
          }
        },
      },
    },
  },
})
