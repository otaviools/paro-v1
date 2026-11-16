/**
 * Registra uma observação feita em campo pela equipe (ADR 0011): rua coberta,
 * faixa horária, data, total de vagas e vagas ocupadas. A mesma rua, faixa
 * horária e data substitui a anterior (correção). Protegida pela chave da
 * equipe (`NUXT_CHAVE_DA_EQUIPE`, em `Authorization: Bearer <chave>`).
 */
export default defineEventHandler(async (event): Promise<ObservacaoRegistrada> => {
  exigirSegredo(event, process.env.NUXT_CHAVE_DA_EQUIPE)
  const corpo = await readBody<EntradaNaoValidada<CorpoDaObservacao>>(event)
  try {
    return await observacoesReaisDoApp.registrar(corpo as Partial<CorpoDaObservacao>, new Date())
  }
  catch (erro) {
    if (erro instanceof ObservacaoInvalida) throw createError({ statusCode: 400, message: erro.message })
    throw erro
  }
})
