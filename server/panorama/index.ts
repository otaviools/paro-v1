import { areaCoberta as areaCobertaDoApp } from '../area-coberta'
import type { AreaCoberta, FaixaHorária, Ponto } from '../area-coberta'
import { estimar, estimativaDe } from '../chance'
import type { ConfiguracaoDaChance, Estimativa } from '../chance'
import { configuracaoDaChance } from '../chance/configuracao'
import type { Observações } from '../observacoes'
import { observaçõesDoApp } from '../observacoes/fonte'

export interface RuaNoPanorama {
  rua: { id: string, nome: string }
  estimativa: Estimativa
  /** Distância a pé do meio do trecho até o destino, em metros. */
  distânciaAoDestino: number
}

/** Rua coberta com chance (nunca Sem dado), que pode ser a melhor chance. */
export interface MelhorChance extends RuaNoPanorama {
  estimativa: Extract<Estimativa, { tipo: 'chance' }>
}

export interface Panorama {
  /** Faixa horária mostrada; null quando "agora" está fora da área coberta. */
  faixaHorária: FaixaHorária | null
  /** Ruas cobertas por chance; vazia quando `faixaHorária` é null. */
  ruas: RuaNoPanorama[]
  /**
   * Rua coberta de maior chance na faixa horária; em empate, a mais perto do
   * destino. Ruas Sem dado não concorrem: null quando todas estão Sem dado.
   */
  melhorChance: MelhorChance | null
  /** Verdadeiro enquanto a chance vier de observações fictícias (ADR 0012). */
  demonstração: boolean
}

/** Estimativa de uma rua coberta numa faixa horária da noite. */
export interface FaixaHoráriaDaRua {
  faixaHorária: FaixaHorária
  estimativa: Estimativa
}

/** Uma rua coberta em todas as faixas horárias da noite (Detalhe da rua). */
export interface RuaAoLongoDaNoite {
  rua: { id: string, nome: string }
  /** Distância a pé do meio do trecho até o destino, em metros. */
  distânciaAoDestino: number
  /** Ponto da rua coberta: o meio do trecho, destino de "Como chegar" (ADRs 0020 e 0024). */
  meioDoTrecho: Ponto
  /** Estimativa de cada faixa horária das 17h às 23h, em ordem. */
  faixasHorárias: FaixaHoráriaDaRua[]
  /** Faixa horária de maior chance da rua; faixas Sem dado não concorrem. */
  melhorFaixa: FaixaHorária | null
  /** Verdadeiro enquanto a chance vier de observações fictícias (ADR 0012). */
  demonstração: boolean
}

export interface DependênciasDoPanorama {
  areaCoberta: AreaCoberta
  observações: Observações
  /** Parâmetros da Chance; por padrão, os da configuração do app. */
  chance?: ConfiguracaoDaChance
}

/** Faixa horária pedida pelo motorista: uma das faixas horárias ou "agora". */
export type FaixaHoráriaPedida = FaixaHorária | 'agora'

export class FaixaHoráriaInválida extends Error {
  constructor(faixaHorária: string) {
    super(`"${faixaHorária}" não é uma faixa horária da área coberta`)
  }
}

export class RuaNãoCoberta extends Error {
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
    || a.distânciaAoDestino - b.distânciaAoDestino
}

function temChance(rua: RuaNoPanorama): rua is MelhorChance {
  return rua.estimativa.tipo === 'chance'
}

export function criarPanorama({ areaCoberta, observações, chance = configuracaoDaChance }: DependênciasDoPanorama) {
  /** Estimativas do semestre da noite de `agora`; vazias fora de qualquer semestre. */
  async function estimativasDaNoite(agora: Date): Promise<Map<string, Estimativa>> {
    const semestre = areaCoberta.semestreDe(areaCoberta.noiteDe(agora))
    return semestre
      ? estimar(await observações.doSemestre(semestre), semestre, areaCoberta, chance)
      : new Map()
  }

  return {
    /**
     * Como está cada rua coberta na faixa horária, na noite de `agora`.
     * Em "agora", usa a faixa horária do instante; fora da área coberta
     * (antes das 17h ou a partir das 23h) não há faixa horária nem ruas.
     */
    async panorama(pedida: FaixaHoráriaPedida, agora: Date): Promise<Panorama> {
      const demonstração = observações.éDemonstração()
      const faixaHorária = pedida === 'agora' ? areaCoberta.faixaHorária(agora) : pedida
      if (faixaHorária === null) return { faixaHorária, ruas: [], melhorChance: null, demonstração }
      if (!areaCoberta.faixasHorárias().includes(faixaHorária)) throw new FaixaHoráriaInválida(faixaHorária)

      const estimativas = await estimativasDaNoite(agora)

      const ruas: RuaNoPanorama[] = areaCoberta.ruasCobertas().map((rua) => ({
        rua: { id: rua.id, nome: rua.nome },
        estimativa: estimativaDe(estimativas, rua.id, faixaHorária),
        distânciaAoDestino: areaCoberta.distânciaAoDestino(rua.id),
      })).sort(porChance)

      // As ruas já estão na ordem da melhor chance; Sem dado fica no fim e não concorre.
      return { faixaHorária, ruas, melhorChance: ruas.find(temChance) ?? null, demonstração }
    },

    /** Como está uma rua coberta em cada faixa horária da noite de `agora`. */
    async ruaAoLongoDaNoite(idDaRua: string, agora: Date): Promise<RuaAoLongoDaNoite> {
      const rua = areaCoberta.ruasCobertas().find((r) => r.id === idDaRua)
      if (!rua) throw new RuaNãoCoberta(idDaRua)
      const estimativas = await estimativasDaNoite(agora)
      const faixasHorárias = areaCoberta.faixasHorárias().map((faixaHorária) => ({
        faixaHorária,
        estimativa: estimativaDe(estimativas, idDaRua, faixaHorária),
      }))
      const melhor = faixasHorárias.reduce<FaixaHoráriaDaRua | null>((atual, faixa) =>
        faixa.estimativa.tipo === 'chance' && (atual === null || chanceParaOrdenar(faixa.estimativa) > chanceParaOrdenar(atual.estimativa))
          ? faixa
          : atual, null)
      return {
        rua: { id: rua.id, nome: rua.nome },
        distânciaAoDestino: areaCoberta.distânciaAoDestino(rua.id),
        meioDoTrecho: rua.trecho.meio,
        faixasHorárias,
        melhorFaixa: melhor?.faixaHorária ?? null,
        demonstração: observações.éDemonstração(),
      }
    },
  }
}

/** Panorama da noite do app, com a área coberta e a fonte de observações ativa. */
export const panoramaDaNoite = criarPanorama({ areaCoberta: areaCobertaDoApp, observações: observaçõesDoApp })
