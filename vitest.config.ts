import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['server/**/*.test.ts', 'app/dados-do-celular/**/*.test.ts'],
  },
})
