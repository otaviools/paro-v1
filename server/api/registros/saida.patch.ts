import { CódigoRecusado, RegistroInválido } from '../../registros-de-vaga'
import { registrosDeVagaDoApp } from '../../registros-de-vaga/do-app'

/** Muda a saída prevista do registro do código. O código vai no corpo, nunca na URL. */
export default defineEventHandler(async (event) => {
  const corpo = await readBody<{ código?: unknown, saídaPrevista?: unknown }>(event)
  if (typeof corpo?.código !== 'string' || typeof corpo.saídaPrevista !== 'string') {
    throw createError({ statusCode: 400, message: 'Informe o código e a saída prevista' })
  }
  try {
    await registrosDeVagaDoApp.alterarSaída(corpo.código, corpo.saídaPrevista, new Date())
    return { saídaPrevista: corpo.saídaPrevista }
  }
  catch (erro) {
    if (erro instanceof CódigoRecusado) throw createError({ statusCode: 404, message: erro.message })
    if (erro instanceof RegistroInválido) throw createError({ statusCode: 400, message: erro.message })
    throw erro
  }
})
