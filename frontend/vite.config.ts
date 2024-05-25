import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
    tsconfigPaths(),
    svgr(),
  ],
  resolve: {
    alias: {
      '~/': `${process.cwd()}/src/`,
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
})
