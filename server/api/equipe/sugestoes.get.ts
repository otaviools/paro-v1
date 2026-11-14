/**
 * Sugestões de rua para a equipe, da mais antiga para a mais nova, protegidas
 * pela chave da equipe (`NUXT_CHAVE_DA_EQUIPE`, em `Authorization: Bearer <chave>`).
 */
export default defineEventHandler(async (event): Promise<RespostaDasSugestoes> => {
  exigirSegredo(event, process.env.NUXT_CHAVE_DA_EQUIPE)
  const { rows } = await bancoDoApp.query<SugestaoDeRua>(
    'select id, texto, data::text as data from sugestoes_de_rua order by data, id',
  )
  return rows
})
