/**
 * Observações reais para a equipe, da mais nova para a mais antiga, com a
 * fonte que o app está usando para a chance. Protegidas pela chave da equipe
 * (`NUXT_CHAVE_DA_EQUIPE`, em `Authorization: Bearer <chave>`).
 */
export default defineEventHandler(async (event): Promise<RespostaDasObservacoes> => {
  exigirSegredo(event, process.env.NUXT_CHAVE_DA_EQUIPE)
  return { fonte: fonteDeObservacoes(), observacoes: await observacoesReaisDoApp.listar() }
})
