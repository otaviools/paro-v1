import { areaCoberta } from '../area-coberta'
import { IdMensalInválido } from '../metricas-de-uso'
import { metricasDeUsoDoApp } from '../metricas-de-uso/do-app'

/**
 * Visita ao app, com o identificador mensal sorteado no celular (ADR 0004).
 * Só o identificador; a data é a de agora, no servidor.
 */
export default defineEventHandler(async (event) => {
  const corpo = await readBody<{ idMensal?: unknown }>(event)
  if (typeof corpo?.idMensal !== 'string') {
    throw createError({ statusCode: 400, message: 'Informe o identificador de sessão' })
  }
  try {
    await metricasDeUsoDoApp.registrarSessão(corpo.idMensal, areaCoberta.noiteDe(new Date()))
  }
  catch (erro) {
    if (erro instanceof IdMensalInválido) throw createError({ statusCode: 400, message: erro.message })
    throw erro
  }
  setResponseStatus(event, 204)
  return null
})
