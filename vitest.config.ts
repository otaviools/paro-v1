import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['server/**/*.test.ts', 'app/dados-do-celular/**/*.test.ts'],
    // Cada teste com banco abre um PGLite novo, que pode levar alguns
    // segundos quando todos os arquivos rodam em paralelo.
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
})
