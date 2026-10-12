import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/oqm/**/*.test.js'],
    setupFiles: ['./tests/oqm/setup.js'],
    fileParallelism: false,
    isolate: true,
  },
});
