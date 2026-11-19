/**
 * Saudação do topo do Início no celular: "Boa noite, Ímã de Vaga". A parte
 * do horário segue o relógio do aparelho; o nome engraçado é sorteado de uma
 * lista de apelidos de quem busca vaga, sem gênero, para servir a qualquer
 * pessoa.
 */

/** "Bom dia" das 5h às 11h59, "Boa tarde" do meio-dia às 17h59 e "Boa noite" no resto. */
export function saudacaoDoHorario(hora: number): 'Bom dia' | 'Boa tarde' | 'Boa noite' {
  if (hora >= 5 && hora < 12) return 'Bom dia'
  if (hora >= 12 && hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

/**
 * Limite de caracteres de um apelido: com ele, "Boa tarde, <apelido>" cabe numa
 * linha do título (24 px, negrito) num celular de 320 px de largura, que tem
 * 280 px de área útil. O mais largo da lista ocupa 263 px.
 */
export const LIMITE_DO_APELIDO = 14

/** Apelidos curtos de quem procura vaga, sem gênero; nenhum quebra a linha do título. */
export const NOMES_ENGRACADOS = [
  'Ímã de Vaga',
  'Ímã de Baliza',
  'Ás da Baliza',
  'Ás da Ré',
  'Ás do Volante',
  'Craque da Ré',
  'Lenda da Ré',
  'Fera da Ré',
  'Fera da Vaga',
  'Mito da Vaga',
  'Mito da Baliza',
  'Radar de Vaga',
  'Radar da Rua',
  'Sonar de Vaga',
  'Farol de Vaga',
  'Turbo da Vaga',
] as const

/** Sorteia um apelido; `aleatorio` devolve um número em [0, 1), como o Math.random. */
export function sortearNomeEngracado(aleatorio: () => number = Math.random): string {
  const indice = Math.min(Math.floor(aleatorio() * NOMES_ENGRACADOS.length), NOMES_ENGRACADOS.length - 1)
  return NOMES_ENGRACADOS[indice]!
}
