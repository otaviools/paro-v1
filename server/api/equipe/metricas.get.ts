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
    // Na demonstração (ADR 0012), as métricas também são fictícias, como as observações.
    const fonte = fonteDeObservacoes()
    const relatorio = fonte === 'reais' ? await metricasDeUsoDoApp.relatorio(de, ate) : metricasFicticias.relatorio(de, ate)
    return { de, ate, fonte, ...relatorio }
  }
  catch (erro) {
    if (erro instanceof PeriodoInvalido) throw createError({ statusCode: 400, message: erro.message })
    throw erro
  }
})
