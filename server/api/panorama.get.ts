import { FaixaHoráriaInválida, panoramaDaNoite } from '../panorama'

/**
 * Panorama da noite numa faixa horária ("agora" ou "19:00", "21:00"...).
 * Só repassa para o Panorama da noite, com o instante atual.
 */
export default defineEventHandler(async (event) => {
  const { faixa } = getQuery(event)
  try {
    return await panoramaDaNoite.panorama(typeof faixa === 'string' ? faixa : 'agora', new Date())
  }
  catch (erro) {
    if (erro instanceof FaixaHoráriaInválida) throw createError({ statusCode: 400, message: erro.message })
    throw erro
  }
})
