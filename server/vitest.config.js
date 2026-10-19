import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      // Mirrors the "imports" field in package.json so vitest can resolve #src/*
      '#src': path.resolve(import.meta.dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: [
      '__tests__/**/*.test.{js,ts}',
      'tests/**/*.test.{js,ts}',
    ],
    // Run each test file in its own worker so DB_PATH env-var overrides
    // set before module imports don't bleed across test files.
    pool: 'forks',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
})

