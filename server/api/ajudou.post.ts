/**
 * Resposta a "A previsão ajudou hoje?": só sim ou não. Sem identificador; a
 * data é a de agora, no servidor.
 */
export default defineEventHandler(async (event): Promise<SemConteudo> => {
  const corpo = await readBody<EntradaNaoValidada<CorpoDoAjudou>>(event)
  if (typeof corpo?.ajudou !== 'boolean') {
    throw createError({ statusCode: 400, message: 'Responda sim ou não' })
  }
  await metricasDeUsoDoApp.responderAjudou(corpo.ajudou, areaCoberta.noiteDe(new Date()))
  setResponseStatus(event, 204)
  return null
})
