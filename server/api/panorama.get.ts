import { FaixaHorariaInvalida, panoramaDaNoite } from '../panorama'

/**
 * Panorama da noite numa faixa horária (`?faixaHoraria=agora`, `19:00`, `21:00`...).
 * Só repassa para o Panorama da noite, com o instante atual.
 */
export default defineEventHandler(async (event) => {
  const { faixaHoraria } = getQuery(event)
  try {
    return await panoramaDaNoite.panorama(typeof faixaHoraria === 'string' ? faixaHoraria : 'agora', new Date())
  }
  catch (erro) {
    if (erro instanceof FaixaHorariaInvalida) throw createError({ statusCode: 400, message: erro.message })
    throw erro
  }
})
