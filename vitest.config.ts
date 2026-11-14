import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // O Vitest roda sem o Nuxt: o alias `#shared` do Nuxt é repetido aqui.
  resolve: {
    alias: { '#shared': fileURLToPath(new URL('./shared', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['server/**/*.test.ts', 'shared/**/*.test.ts', 'app/dados-do-celular/**/*.test.ts'],
    // Cada teste com banco abre um PGLite novo, que pode levar alguns
    // segundos quando todos os arquivos rodam em paralelo.
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
})
