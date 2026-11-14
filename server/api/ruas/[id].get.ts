/**
 * Uma rua coberta ao longo da noite (Detalhe da rua). Só repassa para o
 * Panorama da noite, com o instante atual.
 */
export default defineEventHandler(async (event): Promise<RuaAoLongoDaNoite> => {
  const id = getRouterParam(event, 'id') ?? ''
  try {
    return await panoramaDaNoite.ruaAoLongoDaNoite(id, new Date())
  }
  catch (erro) {
    if (erro instanceof RuaNaoCoberta) throw createError({ statusCode: 404, message: erro.message })
    throw erro
  }
})
