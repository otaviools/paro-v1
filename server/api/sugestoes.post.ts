import { MAXIMO_DA_SUGESTAO, MINIMO_DA_SUGESTAO } from '#shared/sugestao-de-rua'

/**
 * Sugestão de rua (ADR 0013): grava só o texto e a data, sem identificador.
 * Não altera a área coberta nem o mapa; a equipe lê e apaga (ADR 0021).
 */
export default defineEventHandler(async (event) => {
  const corpo = await readBody<{ texto?: unknown }>(event)
  const texto = typeof corpo?.texto === 'string' ? corpo.texto.trim() : ''
  if (texto.length < MINIMO_DA_SUGESTAO || texto.length > MAXIMO_DA_SUGESTAO) {
    throw createError({
      statusCode: 400,
      message: `Escreva a rua ou o trecho em ${MINIMO_DA_SUGESTAO} a ${MAXIMO_DA_SUGESTAO} caracteres`,
    })
  }
  await bancoDoApp.query(
    'insert into sugestoes_de_rua (texto, data) values ($1, $2)',
    [texto, areaCoberta.noiteDe(new Date())],
  )
  setResponseStatus(event, 204)
  return null
})
