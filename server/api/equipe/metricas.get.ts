/**
 * Métricas de uso para a equipe, em JSON, protegidas pela chave da equipe
 * (`NUXT_CHAVE_DA_EQUIPE`, enviada em `Authorization: Bearer <chave>`).
 * `?de=AAAA-MM-DD&ate=AAAA-MM-DD`, até 366 dias.
 */
export default defineEventHandler(async (event): Promise<RespostaDasMetricas> => {
  exigirSegredo(event, process.env.NUXT_CHAVE_DA_EQUIPE)
  const { de, ate } = getQuery<EntradaNaoValidada<ConsultaDasMetricas>>(event)
  try {
    if (typeof de !== 'string' || typeof ate !== 'string') throw new PeriodoInvalido()
    return { de, ate, ...await metricasDeUsoDoApp.relatorio(de, ate) }
  }
  catch (erro) {
    if (erro instanceof PeriodoInvalido) throw createError({ statusCode: 400, message: erro.message })
    throw erro
  }
})
