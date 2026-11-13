import { areaCoberta as areaCobertaDoApp } from '../area-coberta'
import type { AreaCoberta, FaixaHorária, Ponto } from '../area-coberta'
import { estimar, estimativaDe } from '../chance'
import type { ConfiguracaoDaChance, Estimativa } from '../chance'
import { configuracaoDaChance } from '../chance/configuracao'
import type { Observações } from '../observacoes'
import { observaçõesDoApp } from '../observacoes/fonte'
import type { RegistrosDeVaga } from '../registros-de-vaga'
import { registrosDeVagaDoApp } from '../registros-de-vaga/do-app'

export interface RuaNoPanorama {
  rua: { id: string, nome: string }
  estimativa: Estimativa
  /**
   * Registros de vaga abertos da noite com saída prevista nesta rua coberta e
   * faixa horária. À parte da chance, que vem só das observações (ADR 0009).
   */
  saídasPrevistas: number
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
  /**
   * Saídas previstas da noite na rua, só nas faixas horárias que têm alguma,
   * em ordem. À parte da chance (ADR 0009).
   */
  saídasPrevistas: { faixaHorária: FaixaHorária, quantidade: number }[]
  /**
   * Faixa horária de maior chance da rua; em empate, a mais cedo. Faixas
   * horárias Sem dado não concorrem: null quando a rua está Sem dado a noite toda.
   */
  melhorFaixaHorária: FaixaHorária | null
  /** Verdadeiro enquanto a chance vier de observações fictícias (ADR 0012). */
  demonstração: boolean
}

export interface DependênciasDoPanorama {
  areaCoberta: AreaCoberta
  observações: Observações
  /** De onde vêm as saídas previstas da noite. */
  registrosDeVaga: Pick<RegistrosDeVaga, 'saídasPrevistas'>
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

export function criarPanorama({ areaCoberta, observações, registrosDeVaga, chance = configuracaoDaChance }: DependênciasDoPanorama) {
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

      const [estimativas, saídasPrevistas] = await Promise.all([
        estimativasDaNoite(agora),
        registrosDeVaga.saídasPrevistas(areaCoberta.noiteDe(agora)),
      ])

      const ruas: RuaNoPanorama[] = areaCoberta.ruasCobertas().map((rua) => ({
        rua: { id: rua.id, nome: rua.nome },
        estimativa: estimativaDe(estimativas, rua.id, faixaHorária),
        saídasPrevistas: saídasPrevistas
          .find((s) => s.ruaCoberta === rua.id && s.faixaHorária === faixaHorária)?.quantidade ?? 0,
        distânciaAoDestino: areaCoberta.distânciaAoDestino(rua.id),
      })).sort(porChance)

      // As ruas já estão na ordem da melhor chance; Sem dado fica no fim e não concorre.
      return { faixaHorária, ruas, melhorChance: ruas.find(temChance) ?? null, demonstração }
    },

    /** Como está uma rua coberta em cada faixa horária da noite de `agora`. */
    async ruaAoLongoDaNoite(idDaRua: string, agora: Date): Promise<RuaAoLongoDaNoite> {
      const rua = areaCoberta.ruasCobertas().find((r) => r.id === idDaRua)
      if (!rua) throw new RuaNãoCoberta(idDaRua)
      const [estimativas, saídasPrevistas] = await Promise.all([
        estimativasDaNoite(agora),
        registrosDeVaga.saídasPrevistas(areaCoberta.noiteDe(agora)),
      ])
      const faixasHorárias = areaCoberta.faixasHorárias().map((faixaHorária) => ({
        faixaHorária,
        estimativa: estimativaDe(estimativas, idDaRua, faixaHorária),
      }))
      // Só faixas horárias com chance concorrem; o ">" estrito mantém a mais cedo no empate.
      let melhor: { faixaHorária: FaixaHorária, chance: number } | null = null
      for (const { faixaHorária, estimativa } of faixasHorárias) {
        if (estimativa.tipo === 'chance' && (melhor === null || estimativa.chance > melhor.chance)) {
          melhor = { faixaHorária, chance: estimativa.chance }
        }
      }
      return {
        rua: { id: rua.id, nome: rua.nome },
        distânciaAoDestino: areaCoberta.distânciaAoDestino(rua.id),
        meioDoTrecho: rua.trecho.meio,
        faixasHorárias,
        melhorFaixaHorária: melhor?.faixaHorária ?? null,
        saídasPrevistas: saídasPrevistas
          .filter((s) => s.ruaCoberta === idDaRua)
          .map(({ faixaHorária, quantidade }) => ({ faixaHorária, quantidade }))
          .sort((a, b) => a.faixaHorária.localeCompare(b.faixaHorária)),
        demonstração: observações.éDemonstração(),
      }
    },
  }
}

/** Panorama da noite do app, com a área coberta, a fonte de observações ativa e o banco do app. */
export const panoramaDaNoite = criarPanorama({
  areaCoberta: areaCobertaDoApp,
  observações: observaçõesDoApp,
  registrosDeVaga: registrosDeVagaDoApp,
})
