import { createHash, timingSafeEqual } from 'node:crypto'
import { registrosDeVagaDoApp } from '../../registros-de-vaga/do-app'

/** Compara pelo hash, em tempo constante, para não vazar o segredo pelo tempo de resposta. */
function mesmoSegredo(recebido: string, esperado: string): boolean {
  const hash = (texto: string) => createHash('sha256').update(texto).digest()
  return timingSafeEqual(hash(recebido), hash(esperado))
}

/**
 * Fechamento diário (Vercel Cron, agendado em `nitro.vercel.config` no
 * `nuxt.config.ts`): fecha as noites anteriores à noite de agora que ainda
 * têm registros de vaga (ADR 0021). A Vercel manda
 * `Authorization: Bearer <CRON_SECRET>`; sem o segredo configurado, ou com
 * outro valor, a rota recusa.
 */
export default defineEventHandler(async (event) => {
  const segredo = process.env.CRON_SECRET
  const autorização = getHeader(event, 'authorization') ?? ''
  if (!segredo || !mesmoSegredo(autorização, `Bearer ${segredo}`)) {
    throw createError({ statusCode: 401, message: 'Não autorizado' })
  }
  const noitesFechadas = await registrosDeVagaDoApp.fecharNoitesAnteriores(new Date())
  return { noitesFechadas }
})
