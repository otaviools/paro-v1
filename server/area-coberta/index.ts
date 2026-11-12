import { configuracaoDaAreaCoberta } from './configuracao'

export interface Ponto {
  lat: number
  lon: number
}

export interface RuaCoberta {
  id: string
  nome: string
  /** Trecho delimitado da rua (ADR 0024). */
  trecho: { de: string, ate: string, meio: Ponto }
  /** Distância a pé do meio do trecho até o destino (ADR 0024). */
  distanciaAoDestinoMetros: number
}

export interface ConfiguracaoDaAreaCoberta {
  /** Verdadeiro enquanto os valores não vierem do protocolo de campo. */
  provisoria: boolean
  fusoHorario: string
  destino: { nome: string, ponto: Ponto }
  ruasCobertas: RuaCoberta[]
  calendarioLetivo: SemestreLetivo[]
}

/** Data local no formato "AAAA-MM-DD". */
export type Data = string

export interface Periodo {
  de: Data
  ate: Data
}

export interface SemestreLetivo extends Periodo {
  id: string
  /** Dias da semana com aula: 0 = domingo, 1 = segunda, ..., 6 = sábado. */
  diasDeAula: number[]
  provas: Periodo[]
  feriados: Data[]
  ferias: Periodo[]
}

function dentroDe(periodo: Periodo, data: Data): boolean {
  return periodo.de <= data && data <= periodo.ate
}

/** Início de uma faixa horária de 30 minutos, no formato "HH:MM" (ex.: "19:30"). */
export type FaixaHorária = string

/** Área coberta das 17h às 23h, em faixas horárias de 30 minutos (ADR 0001). */
const INICIO_EM_MINUTOS = 17 * 60
const FIM_EM_MINUTOS = 23 * 60
const DURACAO_DA_FAIXA = 30

function horaLocal(instante: Date, fusoHorario: string) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: fusoHorario,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instante)
  const parte = (tipo: string) => partes.find((p) => p.type === tipo)!.value
  return {
    data: `${parte('year')}-${parte('month')}-${parte('day')}`,
    minutos: Number(parte('hour')) * 60 + Number(parte('minute')),
  }
}

function formatarMinutos(minutos: number): string {
  const h = String(Math.floor(minutos / 60)).padStart(2, '0')
  const m = String(minutos % 60).padStart(2, '0')
  return `${h}:${m}`
}

function diaDaSemana(data: Data): number {
  return new Date(`${data}T12:00:00Z`).getUTCDay()
}

export function criarAreaCoberta(configuracao: ConfiguracaoDaAreaCoberta) {
  function ruaCoberta(id: string): RuaCoberta {
    const rua = configuracao.ruasCobertas.find((r) => r.id === id)
    if (!rua) throw new Error(`"${id}" não é uma rua coberta`)
    return rua
  }

  function semestreLetivo(data: Data): SemestreLetivo | undefined {
    return configuracao.calendarioLetivo.find((s) => dentroDe(s, data))
  }

  return {
    ruasCobertas(): RuaCoberta[] {
      return configuracao.ruasCobertas
    },

    distânciaAoDestino(idDaRua: string): number {
      return ruaCoberta(idDaRua).distanciaAoDestinoMetros
    },

    /** Todas as faixas horárias da área coberta, em ordem. */
    faixasHorárias(): FaixaHorária[] {
      const faixas: FaixaHorária[] = []
      for (let m = INICIO_EM_MINUTOS; m < FIM_EM_MINUTOS; m += DURACAO_DA_FAIXA) {
        faixas.push(formatarMinutos(m))
      }
      return faixas
    },

    /** Faixa horária do instante, ou null fora da área coberta. */
    faixaHorária(instante: Date): FaixaHorária | null {
      const { minutos } = horaLocal(instante, configuracao.fusoHorario)
      if (minutos < INICIO_EM_MINUTOS || minutos >= FIM_EM_MINUTOS) return null
      return formatarMinutos(minutos - (minutos % DURACAO_DA_FAIXA))
    },

    /** Dia de aula dentro do semestre, fora de provas, feriados e férias (ADR 0008). */
    éDiaLetivoNormal(data: Data): boolean {
      const semestre = semestreLetivo(data)
      if (!semestre) return false
      return semestre.diasDeAula.includes(diaDaSemana(data))
        && !semestre.feriados.includes(data)
        && !semestre.provas.some((p) => dentroDe(p, data))
        && !semestre.ferias.some((p) => dentroDe(p, data))
    },

    /** Semestre letivo da data, ou null fora de qualquer semestre. */
    semestreDe(data: Data): string | null {
      return semestreLetivo(data)?.id ?? null
    },

    /** Noite do instante: a data local, no formato "AAAA-MM-DD". */
    noiteDe(instante: Date): Data {
      return horaLocal(instante, configuracao.fusoHorario).data
    },
  }
}

export type AreaCoberta = ReturnType<typeof criarAreaCoberta>

/** Área coberta do app, carregada da configuração versionada. */
export const areaCoberta: AreaCoberta = criarAreaCoberta(configuracaoDaAreaCoberta)
