import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    root: __dirname,
    environment: 'node',
    include: ['src/__tests__/integration/**/*.test.ts'],
    globalSetup: ['src/__tests__/integration/globalSetup.ts'],
    testTimeout: 30000,
    hookTimeout: 60000,
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: 1,
      },
    },
  },
})
