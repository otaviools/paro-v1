import { MÁXIMO_DA_SUGESTÃO, MÍNIMO_DA_SUGESTÃO } from '#shared/sugestao-de-rua'
import { areaCoberta } from '../area-coberta'
import { bancoDoApp } from '../banco/do-app'

/**
 * Sugestão de rua (ADR 0013): grava só o texto e a data, sem identificador.
 * Não altera a área coberta nem o mapa; a equipe lê e apaga (ADR 0021).
 */
export default defineEventHandler(async (event) => {
  const corpo = await readBody<{ texto?: unknown }>(event)
  const texto = typeof corpo?.texto === 'string' ? corpo.texto.trim() : ''
  if (texto.length < MÍNIMO_DA_SUGESTÃO || texto.length > MÁXIMO_DA_SUGESTÃO) {
    throw createError({
      statusCode: 400,
      message: `Escreva a rua ou o trecho em ${MÍNIMO_DA_SUGESTÃO} a ${MÁXIMO_DA_SUGESTÃO} caracteres`,
    })
  }
  await bancoDoApp.query(
    'insert into sugestoes_de_rua (texto, data) values ($1, $2)',
    [texto, areaCoberta.noiteDe(new Date())],
  )
  setResponseStatus(event, 204)
  return null
})
