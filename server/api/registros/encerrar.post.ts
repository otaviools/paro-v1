/** "Saí": encerra o registro do código. O código vai no corpo, nunca na URL. */
export default defineEventHandler(async (event) => {
  const corpo = await readBody<{ codigo?: unknown }>(event)
  if (typeof corpo?.codigo !== 'string') throw createError({ statusCode: 400, message: 'Informe o código' })
  try {
    await registrosDeVagaDoApp.encerrar(corpo.codigo, new Date())
    return { encerrado: true }
  }
  catch (erro) {
    if (erro instanceof CodigoRecusado) throw createError({ statusCode: 404, message: erro.message })
    throw erro
  }
})
