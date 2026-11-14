import { criarAreaCoberta } from '../area-coberta'
import type { ConfiguracaoDaAreaCoberta, Data, SemestreLetivo } from '../area-coberta'
import { configuracaoDaChance } from '../chance/configuracao'
import type { Observação, Observações } from '.'

/** Semente fixa: as mesmas observações fictícias a cada execução. */
const SEMENTE = 2026

/** Semanas do início do semestre em que há observações fictícias. */
const SEMANAS_OBSERVADAS = 14

type Perfil = 'Tranquilo' | 'Apertado' | 'Difícil' | 'Sem dado'

const PERFIS: Perfil[] = ['Tranquilo', 'Apertado', 'Difícil', 'Sem dado']

/** Gerador pseudoaleatório determinístico (mulberry32). */
function geradorDe(semente: number) {
  let estado = semente >>> 0
  const próximo = () => {
    estado = (estado + 0x6D2B79F5) >>> 0
    let t = estado
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  /** Inteiro entre `min` e `max`, inclusive. */
  const inteiro = (min: number, max: number) => min + Math.floor(próximo() * (max - min + 1))
  const embaralhar = <T>(lista: T[]): T[] => {
    const copia = [...lista]
    for (let i = copia.length - 1; i > 0; i--) {
      const j = inteiro(0, i)
      ;[copia[i], copia[j]] = [copia[j]!, copia[i]!]
    }
    return copia
  }
  return { inteiro, embaralhar }
}

function hashDe(texto: string): number {
  let h = 0
  for (const c of texto) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0
  return h
}

function somarDias(data: Data, dias: number): Data {
  const d = new Date(`${data}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

/**
 * Quantas noites, de `n`, a rua coberta não estava cheia em cada perfil. Os
 * valores caem dentro dos cortes padrão de 70% e 40% (ADR 0006).
 */
function noitesNãoCheias(perfil: Exclude<Perfil, 'Sem dado'>, n: number, sorteio: number): number {
  if (perfil === 'Tranquilo') return n - sorteio // n ou n - 1: 75% ou mais com n >= 4
  if (perfil === 'Apertado') return Math.round(n / 2) // de 50% a 60%
  return Math.floor(n / 4) // de 0% a 25%
}

/**
 * Adapter de observações fictícias (ADR 0012): observações inventadas, no
 * mesmo formato das reais, que passam pelo mesmo cálculo da Chance.
 *
 * Simula uma noite de observação por semana (ADR 0011) nas primeiras semanas
 * do semestre. Em cada faixa horária, as ruas cobertas recebem perfis em
 * rodízio (Tranquilo, Apertado, Difícil e Sem dado), para que toda faixa
 * horária mostre os quatro estados quando houver pelo menos quatro ruas.
 */
export function criarObservaçõesFictícias(configuracao: ConfiguracaoDaAreaCoberta, semente = SEMENTE): Observações {
  const area = criarAreaCoberta(configuracao)

  function gerar(semestre: SemestreLetivo): Observação[] {
    const sorte = geradorDe(semente ^ hashDe(semestre.id))

    // Uma noite de observação por semana, num dia letivo normal.
    const noites: Data[] = []
    for (let semana = 0; semana < SEMANAS_OBSERVADAS; semana++) {
      const dias = sorte.embaralhar([0, 1, 2, 3, 4, 5, 6]).map(d => somarDias(semestre.de, semana * 7 + d))
      const noite = dias.find(d => d <= semestre.ate && area.éDiaLetivoNormal(d))
      if (noite) noites.push(noite)
    }

    const vagasPorRua = new Map(configuracao.ruasCobertas.map(r => [r.id, sorte.inteiro(12, 30)]))
    const observações: Observação[] = []

    area.faixasHorárias().forEach((faixaHorária) => {
      const deslocamento = sorte.inteiro(0, PERFIS.length - 1)
      configuracao.ruasCobertas.forEach((rua, i) => {
        const perfil = PERFIS[(i + deslocamento) % PERFIS.length]!
        const quantas = perfil === 'Sem dado'
          ? sorte.inteiro(0, 3)
          : Math.min(noites.length, sorte.inteiro(6, 9))
        const datas = sorte.embaralhar(noites).slice(0, quantas).sort()
        const naoCheias = perfil === 'Sem dado' ? quantas : noitesNãoCheias(perfil, datas.length, sorte.inteiro(0, 1))
        const quaisNaoCheias = new Set(sorte.embaralhar(datas).slice(0, naoCheias))

        const totalDeVagas = vagasPorRua.get(rua.id)!
        // Menor número de vagas ocupadas com que a rua fica cheia (85%, ADR 0005).
        const mínimoCheia = Math.ceil((configuracaoDaChance.ocupaçãoDeRuaCheia * totalDeVagas) / 100)
        for (const data of datas) {
          const vagasOcupadas = quaisNaoCheias.has(data)
            ? sorte.inteiro(Math.floor(totalDeVagas * 0.3), mínimoCheia - 1)
            : sorte.inteiro(mínimoCheia, totalDeVagas)
          observações.push({ ruaCoberta: rua.id, faixaHorária, data, totalDeVagas, vagasOcupadas })
        }
      })
    })
    return observações
  }

  return {
    async doSemestre(idDoSemestre) {
      const semestre = configuracao.calendarioLetivo.find(s => s.id === idDoSemestre)
      return semestre ? gerar(semestre) : []
    },
    éDemonstração() {
      return true
    },
  }
}
