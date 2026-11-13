import { CódigoRecusado } from '../../registros-de-vaga'
import { registrosDeVagaDoApp } from '../../registros-de-vaga/do-app'

/** "Saí": encerra o registro do código. O código vai no corpo, nunca na URL. */
export default defineEventHandler(async (event) => {
  const corpo = await readBody<{ código?: unknown }>(event)
  if (typeof corpo?.código !== 'string') throw createError({ statusCode: 400, message: 'Informe o código' })
  try {
    await registrosDeVagaDoApp.encerrar(corpo.código, new Date())
    return { encerrado: true }
  }
  catch (erro) {
    if (erro instanceof CódigoRecusado) throw createError({ statusCode: 404, message: erro.message })
    throw erro
  }
})
