import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)))

const sharedAlias = {
  '@shared': resolve(projectRoot, 'src/shared')
}

export default defineConfig({
  main: {
    resolve: {
      alias: sharedAlias
    },
    build: {
      rollupOptions: {
        external: ['better-sqlite3']
      }
    }
  },
  preload: {
    resolve: {
      alias: sharedAlias
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve(projectRoot, 'src/renderer/src'),
        ...sharedAlias
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
