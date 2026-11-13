import { RegistroInválido } from '../registros-de-vaga'
import { registrosDeVagaDoApp } from '../registros-de-vaga/do-app'

/**
 * Registro de vaga: a rua coberta e a saída prevista, nos dois modos (manual ou
 * com localização ligada). Nunca recebe coordenadas: o ponto do carro fica só
 * no celular (ADR 0003). A chegada é a faixa horária de agora. Devolve o
 * código, que fica só no celular.
 */
export default defineEventHandler(async (event) => {
  const corpo = await readBody<{ ruaCoberta?: unknown, saídaPrevista?: unknown }>(event)
  if (typeof corpo?.ruaCoberta !== 'string' || typeof corpo.saídaPrevista !== 'string') {
    throw createError({ statusCode: 400, message: 'Informe a rua coberta e a saída prevista' })
  }
  try {
    return await registrosDeVagaDoApp.registrar(
      { ruaCoberta: corpo.ruaCoberta, chegada: 'agora', saídaPrevista: corpo.saídaPrevista },
      new Date(),
    )
  }
  catch (erro) {
    if (erro instanceof RegistroInválido) throw createError({ statusCode: 400, message: erro.message })
    throw erro
  }
})
