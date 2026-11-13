import { areaCoberta } from '../../area-coberta'
import { metricasDeUsoDoApp } from '../../metricas-de-uso/do-app'
import { exigirSegredo } from '../../utils/segredo'

const FORMATO_DE_DATA = /^\d{4}-\d{2}-\d{2}$/
/** Limite do período consultado, para a consulta não varrer anos de noites. */
const MÁXIMO_DE_DIAS = 366
const DIA_EM_MS = 24 * 60 * 60 * 1000

/**
 * Métricas de uso para a equipe, em JSON, protegidas pela chave da equipe
 * (`NUXT_CHAVE_DA_EQUIPE`, enviada em `Authorization: Bearer <chave>`).
 * `?de=AAAA-MM-DD&ate=AAAA-MM-DD`; sem período, os últimos 60 dias até hoje.
 */
export default defineEventHandler(async (event) => {
  exigirSegredo(event, process.env.NUXT_CHAVE_DA_EQUIPE)

  const consulta = getQuery(event)
  const hoje = areaCoberta.noiteDe(new Date())
  const ate = typeof consulta.ate === 'string' ? consulta.ate : hoje
  const de = typeof consulta.de === 'string'
    ? consulta.de
    : new Date(Date.parse(`${ate}T00:00:00Z`) - 60 * DIA_EM_MS).toISOString().slice(0, 10)

  const dias = (Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / DIA_EM_MS
  if (!FORMATO_DE_DATA.test(de) || !FORMATO_DE_DATA.test(ate) || Number.isNaN(dias) || dias < 0 || dias > MÁXIMO_DE_DIAS) {
    throw createError({ statusCode: 400, message: `Informe de e ate no formato AAAA-MM-DD, com até ${MÁXIMO_DE_DIAS} dias` })
  }
  return { de, ate, ...await metricasDeUsoDoApp.relatório(de, ate) }
})
