/**
 * Melhor chegada para a primeira aula do dia (`?primeiraAula=19:00`, ADR 0035).
 * Só repassa para o Panorama da noite, com o instante atual. Recebe só o
 * horário da aula, nada mais da grade horária.
 */
export default defineEventHandler(async (event): Promise<RespostaDaMelhorChegada> => {
  const { primeiraAula } = getQuery<EntradaNaoValidada<ConsultaDaMelhorChegada>>(event)
  try {
    return await panoramaDaNoite.melhorChegada(typeof primeiraAula === 'string' ? primeiraAula : '', new Date())
  }
  catch (erro) {
    if (erro instanceof HorarioInvalido) throw createError({ statusCode: 400, message: erro.message })
    throw erro
  }
})
