import { areaCoberta } from '../area-coberta'

/**
 * A noite e a faixa horária de agora (faixa horária null fora da área
 * coberta). O celular usa a noite para saber se o código do registro ainda
 * vale e a faixa horária para oferecer a saída prevista.
 */
export default defineEventHandler(() => {
  const agora = new Date()
  return { noite: areaCoberta.noiteDe(agora), faixaHorária: areaCoberta.faixaHorária(agora) }
})
