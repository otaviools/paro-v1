import { PeriodoInvalido } from '../../metricas-de-uso'
import { metricasDeUsoDoApp } from '../../metricas-de-uso/do-app'
import { exigirSegredo } from '../../utils/segredo'

/**
 * Métricas de uso para a equipe, em JSON, protegidas pela chave da equipe
 * (`NUXT_CHAVE_DA_EQUIPE`, enviada em `Authorization: Bearer <chave>`).
 * `?de=AAAA-MM-DD&ate=AAAA-MM-DD`, até 366 dias.
 */
export default defineEventHandler(async (event) => {
  exigirSegredo(event, process.env.NUXT_CHAVE_DA_EQUIPE)
  const { de, ate } = getQuery(event)
  try {
    if (typeof de !== 'string' || typeof ate !== 'string') throw new PeriodoInvalido()
    return { de, ate, ...await metricasDeUsoDoApp.relatorio(de, ate) }
  }
  catch (erro) {
    if (erro instanceof PeriodoInvalido) throw createError({ statusCode: 400, message: erro.message })
    throw erro
  }
})
