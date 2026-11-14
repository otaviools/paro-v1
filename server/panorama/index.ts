import { areaCoberta as areaCobertaDoApp } from '../area-coberta'
import type { AreaCoberta, FaixaHoraria, Ponto } from '../area-coberta'
import { estimar, estimativaDe } from '../chance'
import type { ConfiguracaoDaChance, Estimativa } from '../chance'
import { configuracaoDaChance } from '../chance/configuracao'
import type { Observacoes } from '../observacoes'
import { observacoesDoApp } from '../observacoes/fonte'
import type { RegistrosDeVaga } from '../registros-de-vaga'
import { registrosDeVagaDoApp } from '../registros-de-vaga/do-app'

export interface RuaNoPanorama {
  rua: { id: string, nome: string }
  estimativa: Estimativa
  /**
   * Registros de vaga abertos da noite com saída prevista nesta rua coberta e
   * faixa horária. À parte da chance, que vem só das observações (ADR 0009).
   */
  saidasPrevistas: number
  /** Distância a pé do meio do trecho até o destino, em metros. */
  distanciaAoDestino: number
}

/** Rua coberta com chance (nunca Sem dado), que pode ser a melhor chance. */
export interface MelhorChance extends RuaNoPanorama {
  estimativa: Extract<Estimativa, { tipo: 'chance' }>
}

export interface Panorama {
  /** Faixa horária mostrada; null quando "agora" está fora da área coberta. */
  faixaHoraria: FaixaHoraria | null
  /** Ruas cobertas por chance; vazia quando `faixaHoraria` é null. */
  ruas: RuaNoPanorama[]
  /**
   * Rua coberta de maior chance na faixa horária; em empate, a mais perto do
   * destino. Ruas Sem dado não concorrem: null quando todas estão Sem dado.
   */
  melhorChance: MelhorChance | null
  /** Verdadeiro enquanto a chance vier de observações fictícias (ADR 0012). */
  demonstracao: boolean
}

/** Estimativa de uma rua coberta numa faixa horária da noite. */
export interface FaixaHorariaDaRua {
  faixaHoraria: FaixaHoraria
  estimativa: Estimativa
}

/** Uma rua coberta em todas as faixas horárias da noite (Detalhe da rua). */
export interface RuaAoLongoDaNoite {
  rua: { id: string, nome: string }
  /** Distância a pé do meio do trecho até o destino, em metros. */
  distanciaAoDestino: number
  /** Ponto da rua coberta: o meio do trecho, destino de "Como chegar" (ADRs 0020 e 0024). */
  meioDoTrecho: Ponto
  /** Estimativa de cada faixa horária das 17h às 23h, em ordem. */
  faixasHorarias: FaixaHorariaDaRua[]
  /**
   * Saídas previstas da noite na rua, só nas faixas horárias que têm alguma,
   * em ordem. À parte da chance (ADR 0009).
   */
  saidasPrevistas: { faixaHoraria: FaixaHoraria, quantidade: number }[]
  /**
   * Faixa horária de maior chance da rua; em empate, a mais cedo. Faixas
   * horárias Sem dado não concorrem: null quando a rua está Sem dado a noite toda.
   */
  melhorFaixaHoraria: FaixaHoraria | null
  /** Verdadeiro enquanto a chance vier de observações fictícias (ADR 0012). */
  demonstracao: boolean
}

export interface DependenciasDoPanorama {
  areaCoberta: AreaCoberta
  observacoes: Observacoes
  /** De onde vêm as saídas previstas da noite. */
  registrosDeVaga: Pick<RegistrosDeVaga, 'saidasPrevistas'>
  /** Parâmetros da Chance; por padrão, os da configuração do app. */
  chance?: ConfiguracaoDaChance
}

/** Faixa horária pedida pelo motorista: uma das faixas horárias ou "agora". */
export type FaixaHorariaPedida = FaixaHoraria | 'agora'

export class FaixaHorariaInvalida extends Error {
  constructor(faixaHoraria: string) {
    super(`"${faixaHoraria}" não é uma faixa horária da área coberta`)
  }
}

export class RuaNaoCoberta extends Error {
  constructor(idDaRua: string) {
    super(`"${idDaRua}" não é uma rua coberta`)
  }
}

/** -1 deixa Sem dado depois de qualquer chance, inclusive de 0%. */
function chanceParaOrdenar(estimativa: Estimativa): number {
  return estimativa.tipo === 'chance' ? estimativa.chance : -1
}

/** Maior chance primeiro; em empate, a mais perto do destino. */
function porChance(a: RuaNoPanorama, b: RuaNoPanorama): number {
  return chanceParaOrdenar(b.estimativa) - chanceParaOrdenar(a.estimativa)
    || a.distanciaAoDestino - b.distanciaAoDestino
}

function temChance(rua: RuaNoPanorama): rua is MelhorChance {
  return rua.estimativa.tipo === 'chance'
}

export function criarPanorama({ areaCoberta, observacoes, registrosDeVaga, chance = configuracaoDaChance }: DependenciasDoPanorama) {
  /** Estimativas do semestre da noite de `agora`; vazias fora de qualquer semestre. */
  async function estimativasDaNoite(agora: Date): Promise<Map<string, Estimativa>> {
    const semestre = areaCoberta.semestreDe(areaCoberta.noiteDe(agora))
    return semestre
      ? estimar(await observacoes.doSemestre(semestre), semestre, areaCoberta, chance)
      : new Map()
  }

  /** Estimativas do semestre e saídas previstas da noite de `agora`. */
  async function daNoite(agora: Date) {
    const [estimativas, saidasPrevistas] = await Promise.all([
      estimativasDaNoite(agora),
      registrosDeVaga.saidasPrevistas(areaCoberta.noiteDe(agora)),
    ])
    return { estimativas, saidasPrevistas }
  }

  return {
    /**
     * Como está cada rua coberta na faixa horária, na noite de `agora`.
     * Em "agora", usa a faixa horária do instante; fora da área coberta
     * (antes das 17h ou a partir das 23h) não há faixa horária nem ruas.
     */
    async panorama(pedida: FaixaHorariaPedida, agora: Date): Promise<Panorama> {
      const demonstracao = observacoes.eDemonstracao()
      const faixaHoraria = pedida === 'agora' ? areaCoberta.faixaHoraria(agora) : pedida
      if (faixaHoraria === null) return { faixaHoraria, ruas: [], melhorChance: null, demonstracao }
      if (!areaCoberta.faixasHorarias().includes(faixaHoraria)) throw new FaixaHorariaInvalida(faixaHoraria)

      const { estimativas, saidasPrevistas } = await daNoite(agora)

      const ruas: RuaNoPanorama[] = areaCoberta.ruasCobertas().map(rua => ({
        rua: { id: rua.id, nome: rua.nome },
        estimativa: estimativaDe(estimativas, rua.id, faixaHoraria),
        saidasPrevistas: saidasPrevistas
          .find(s => s.ruaCoberta === rua.id && s.faixaHoraria === faixaHoraria)?.quantidade ?? 0,
        distanciaAoDestino: areaCoberta.distanciaAoDestino(rua.id),
      })).sort(porChance)

      // As ruas já estão na ordem da melhor chance; Sem dado fica no fim e não concorre.
      return { faixaHoraria, ruas, melhorChance: ruas.find(temChance) ?? null, demonstracao }
    },

    /** Como está uma rua coberta em cada faixa horária da noite de `agora`. */
    async ruaAoLongoDaNoite(idDaRua: string, agora: Date): Promise<RuaAoLongoDaNoite> {
      const rua = areaCoberta.ruasCobertas().find(r => r.id === idDaRua)
      if (!rua) throw new RuaNaoCoberta(idDaRua)
      const { estimativas, saidasPrevistas } = await daNoite(agora)
      const faixasHorarias = areaCoberta.faixasHorarias().map(faixaHoraria => ({
        faixaHoraria,
        estimativa: estimativaDe(estimativas, idDaRua, faixaHoraria),
      }))
      // Só faixas horárias com chance concorrem; o ">" estrito mantém a mais cedo no empate.
      let melhor: { faixaHoraria: FaixaHoraria, chance: number } | null = null
      for (const { faixaHoraria, estimativa } of faixasHorarias) {
        if (estimativa.tipo === 'chance' && (melhor === null || estimativa.chance > melhor.chance)) {
          melhor = { faixaHoraria, chance: estimativa.chance }
        }
      }
      return {
        rua: { id: rua.id, nome: rua.nome },
        distanciaAoDestino: areaCoberta.distanciaAoDestino(rua.id),
        meioDoTrecho: rua.trecho.meio,
        faixasHorarias,
        melhorFaixaHoraria: melhor?.faixaHoraria ?? null,
        saidasPrevistas: saidasPrevistas
          .filter(s => s.ruaCoberta === idDaRua)
          .map(({ faixaHoraria, quantidade }) => ({ faixaHoraria, quantidade }))
          .sort((a, b) => a.faixaHoraria.localeCompare(b.faixaHoraria)),
        demonstracao: observacoes.eDemonstracao(),
      }
    },
  }
}

/** Panorama da noite do app, com a área coberta, a fonte de observações ativa e o banco do app. */
export const panoramaDaNoite = criarPanorama({
  areaCoberta: areaCobertaDoApp,
  observacoes: observacoesDoApp,
  registrosDeVaga: registrosDeVagaDoApp,
})
