/** Muda a saída prevista do registro do código. O código vai no corpo, nunca na URL. */
export default defineEventHandler(async (event) => {
  const corpo = await readBody<{ codigo?: unknown, saidaPrevista?: unknown }>(event)
  if (typeof corpo?.codigo !== 'string' || typeof corpo.saidaPrevista !== 'string') {
    throw createError({ statusCode: 400, message: 'Informe o código e a saída prevista' })
  }
  try {
    await registrosDeVagaDoApp.alterarSaida(corpo.codigo, corpo.saidaPrevista, new Date())
    return { saidaPrevista: corpo.saidaPrevista }
  }
  catch (erro) {
    if (erro instanceof CodigoRecusado) throw createError({ statusCode: 404, message: erro.message })
    if (erro instanceof RegistroInvalido) throw createError({ statusCode: 400, message: erro.message })
    throw erro
  }
})
