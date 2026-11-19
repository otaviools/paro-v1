import type { FaixaHoraria } from '#shared/types/area-coberta'
import type { Estimativa } from '#shared/types/chance'
import type { FaixaHorariaPedida, MelhorChance, MelhorChegada, Panorama, RuaAoLongoDaNoite, RuaNoPanorama } from '#shared/types/panorama'
import { areaCoberta as areaCobertaDoApp } from '#shared/utils/area-coberta'
import type { AreaCoberta } from '#shared/utils/area-coberta'
import { estimar, estimativaDe } from '../chance'
import type { ConfiguracaoDaChance } from '../chance/configuracao'
import { configuracaoDaChance } from '../chance/configuracao'
import type { Observacoes } from '../observacoes'
import { observacoesDoApp } from '../observacoes/fonte'
import type { RegistrosDeVaga } from '../registros-de-vaga'
import { registrosDeVagaDoApp } from '../registros-de-vaga/do-app'

export interface DependenciasDoPanorama {
  areaCoberta: AreaCoberta
  observacoes: Observacoes
  /** De onde vêm as saídas previstas da noite. */
  registrosDeVaga: Pick<RegistrosDeVaga, 'saidasPrevistas'>
  /** Parâmetros da Chance; por padrão, os da configuração do app. */
  chance?: ConfiguracaoDaChance
}

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

export class HorarioInvalido extends Error {
  constructor(horario: string) {
    super(`"${horario}" não é um horário HH:MM`)
  }
}

/** Velocidade a pé usada para ver se ainda dá tempo de chegar à aula (ADR 0035). */
const METROS_POR_MINUTO_A_PE = 80

function emMinutos(horario: string): number {
  const [h, m] = horario.split(':').map(Number) as [number, number]
  return h * 60 + m
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

    /**
     * Melhor chegada (ADR 0035): entre as faixas horárias e ruas cobertas
     * que ainda dão tempo de andar até a `primeiraAula` (do início da faixa
     * horária, a 80 m por minuto), a de maior chance na noite de `agora`. No
     * empate, a faixa horária mais tarde e depois a rua mais perto. Sem dado
     * não concorre: null quando nenhuma tem chance a tempo.
     */
    async melhorChegada(primeiraAula: string, agora: Date): Promise<MelhorChegada | null> {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(primeiraAula)) throw new HorarioInvalido(primeiraAula)
      const estimativas = await estimativasDaNoite(agora)
      const limite = emMinutos(primeiraAula)
      let melhor: (MelhorChegada & { distancia: number }) | null = null
      for (const faixaHoraria of areaCoberta.faixasHorarias()) {
        for (const rua of areaCoberta.ruasCobertas()) {
          const distancia = areaCoberta.distanciaAoDestino(rua.id)
          if (emMinutos(faixaHoraria) + Math.ceil(distancia / METROS_POR_MINUTO_A_PE) > limite) continue
          const estimativa = estimativaDe(estimativas, rua.id, faixaHoraria)
          if (estimativa.tipo !== 'chance') continue
          // As faixas horárias vêm em ordem: no empate, a mais tarde e, na mesma, a rua mais perto.
          const melhora = melhor === null || estimativa.chance > melhor.estimativa.chance
            || (estimativa.chance === melhor.estimativa.chance
              && (faixaHoraria > melhor.faixaHoraria || distancia < melhor.distancia))
          if (melhora) melhor = { faixaHoraria, rua: { id: rua.id, nome: rua.nome }, estimativa, distancia }
        }
      }
      if (melhor === null) return null
      const { distancia: _distancia, ...melhorChegada } = melhor
      return melhorChegada
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
