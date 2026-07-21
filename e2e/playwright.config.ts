import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  // Both are resolved against the repo root (the suite runs from there via
  // `pnpm test:e2e`), so pin them under e2e/ where .gitignore already covers
  // them — otherwise artifacts land in an untracked repo-root test-results/.
  outputDir: './test-results',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3100',
  },
  reporter: [['html', { outputFolder: './playwright-report', open: 'never' }], ['list']],
})
