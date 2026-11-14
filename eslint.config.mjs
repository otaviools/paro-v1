// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // ADR 0026: todo nome no código fica sem acento e sem cedilha.
    // Confere só identificadores do script. Textos entre aspas, comentários,
    // templates Vue, classes CSS, colunas SQL e nomes de arquivo ficam para a revisão.
    'id-match': ['error', '^[\\x00-\\x7F]+$', { properties: true, classFields: true }],
  },
})
