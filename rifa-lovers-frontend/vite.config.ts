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
        manualChunks: {
          // Core React ecosystem
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // State management & data fetching
          'vendor-state': ['zustand', '@tanstack/react-query', 'axios'],
          // UI Components (Radix primitives)
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-accordion',
            '@radix-ui/react-slot',
          ],
          // 3D & Animation (heavy libraries, load only when needed)
          'vendor-3d': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-anim': ['gsap', '@gsap/react'],
          // Icons
          'vendor-icons': ['lucide-react'],
          // Utilities
          'vendor-utils': ['clsx', 'tailwind-merge', 'date-fns'],
        },
      },
    },
  },
})
