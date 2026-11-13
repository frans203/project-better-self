import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
    // PGlite sobe um Postgres inteiro em WASM: o primeiro boot leva alguns segundos.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
