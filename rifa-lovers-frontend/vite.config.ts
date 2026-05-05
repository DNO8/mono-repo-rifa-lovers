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
      // Only process files with JSX — skip pure .ts files (types, utils, constants)
      include: /src\/.*\.(tsx|jsx)$/,
    }),
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
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Manual code splitting for better caching and smaller initial chunks
        manualChunks: (id: string) => {
          // Core React (react + react-dom only)
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react'
          }
          // Router
          if (id.includes('react-router')) {
            return 'vendor-router'
          }
          // State management & data fetching
          if (id.includes('zustand') || id.includes('@tanstack/react-query') || id.includes('axios')) {
            return 'vendor-state'
          }
          // UI Components (Radix primitives)
          if (id.includes('@radix-ui/')) {
            return 'vendor-ui'
          }
          // 3D libraries — split for granular caching
          if (id.includes('three') && !id.includes('@react-three')) {
            return 'vendor-three-core'
          }
          if (id.includes('@react-three/fiber')) {
            return 'vendor-r3f'
          }
          if (id.includes('@react-three/drei')) {
            return 'vendor-drei'
          }
          if (id.includes('gsap') || id.includes('@gsap/react')) {
            return 'vendor-anim'
          }
          // Icons
          if (id.includes('lucide-react')) {
            return 'vendor-icons'
          }
          // Notifications
          if (id.includes('react-toastify')) {
            return 'vendor-toast'
          }
          // ReCAPTCHA (only used on register page)
          if (id.includes('react-google-recaptcha')) {
            return 'vendor-recaptcha'
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
