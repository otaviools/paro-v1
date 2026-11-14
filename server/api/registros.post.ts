import { RegistroInvalido } from '../registros-de-vaga'
import { registrosDeVagaDoApp } from '../registros-de-vaga/do-app'

/**
 * Registro de vaga: a rua coberta e a saída prevista, nos dois modos (manual ou
 * com localização ligada). Nunca recebe coordenadas: o ponto do carro fica só
 * no celular (ADR 0003). A chegada é a faixa horária de agora. Devolve o
 * código, que fica só no celular.
 */
export default defineEventHandler(async (event) => {
  const corpo = await readBody<{ ruaCoberta?: unknown, saidaPrevista?: unknown }>(event)
  if (typeof corpo?.ruaCoberta !== 'string' || typeof corpo.saidaPrevista !== 'string') {
    throw createError({ statusCode: 400, message: 'Informe a rua coberta e a saída prevista' })
  }
  try {
    return await registrosDeVagaDoApp.registrar(
      { ruaCoberta: corpo.ruaCoberta, chegada: 'agora', saidaPrevista: corpo.saidaPrevista },
      new Date(),
    )
  }
  catch (erro) {
    if (erro instanceof RegistroInvalido) throw createError({ statusCode: 400, message: erro.message })
    throw erro
  }
})
