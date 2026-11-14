import { bancoDoApp } from '../../../banco/do-app'
import { exigirSegredo } from '../../../utils/segredo'

/** O id é um integer do Postgres: vai de 1 até este valor. */
const MAIOR_INTEGER = 2_147_483_647

/**
 * Apaga uma sugestão de rua depois de lida (ADR 0021), protegida pela chave
 * da equipe (`NUXT_CHAVE_DA_EQUIPE`, em `Authorization: Bearer <chave>`).
 * Apagar uma que já não existe também responde 204.
 */
export default defineEventHandler(async (event) => {
  exigirSegredo(event, process.env.NUXT_CHAVE_DA_EQUIPE)
  const parametro = getRouterParam(event, 'id') ?? ''
  const id = Number(parametro)
  if (!/^[1-9]\d{0,9}$/.test(parametro) || id > MAIOR_INTEGER) {
    throw createError({ statusCode: 400, message: 'Sugestão inválida' })
  }
  await bancoDoApp.query('delete from sugestoes_de_rua where id = $1', [id])
  setResponseStatus(event, 204)
  return null
})
