import { createHash, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

/** Compara pelo hash, em tempo constante, para não vazar o segredo pelo tempo de resposta. */
function mesmoSegredo(recebido: string, esperado: string): boolean {
  const hash = (texto: string) => createHash('sha256').update(texto).digest()
  return timingSafeEqual(hash(recebido), hash(esperado))
}

/**
 * Exige `Authorization: Bearer <segredo>`. Sem o segredo configurado no
 * ambiente, ou com outro valor, a rota recusa com 401.
 */
export function exigirSegredo(event: H3Event, segredo: string | undefined): void {
  const autorização = getHeader(event, 'authorization') ?? ''
  if (!segredo || !mesmoSegredo(autorização, `Bearer ${segredo}`)) {
    throw createError({ statusCode: 401, message: 'Não autorizado' })
  }
}
