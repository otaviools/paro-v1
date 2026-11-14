// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // ADR 0026: todo nome no código fica sem acento e sem cedilha.
    // Confere só identificadores do script. Textos entre aspas, comentários,
    // templates Vue, classes CSS, colunas SQL e nomes de arquivo ficam para a revisão.
    'id-match': ['error', '^[\\x00-\\x7F]+$', { properties: true, classFields: true }],
  },
}, {
  // ADR 0032: o celular nunca importa nada de `server/`. O que os dois lados
  // usam fica em `shared/`.
  files: ['app/**'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['~~/server', '~~/server/**', '@@/server', '@@/server/**', '**/server', '**/server/**'],
        message: 'O app não importa de server/. Use shared/ (ADR 0032).',
      }],
    }],
  },
})
