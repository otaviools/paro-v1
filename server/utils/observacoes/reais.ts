import type { Data } from '#shared/types/area-coberta'
import type { CorpoDaObservacao, ObservacaoRegistrada } from '#shared/types/observacoes'
import type { AreaCoberta } from '#shared/utils/area-coberta'
import type { Banco } from '../banco'
import type { Observacao, Observacoes } from '.'

/** Maior número de vagas aceito numa rua coberta, para pegar erro de digitação. */
export const MAXIMO_DE_VAGAS = 500

/** A observação recebida não é válida; a mensagem diz o que corrigir. */
export class ObservacaoInvalida extends Error {}

interface Linha {
  id: number
  data: Data
  rua_coberta: string
  faixa_horaria: string
  total_de_vagas: number
  vagas_ocupadas: number
}

const SELECAO = `select id, data::text as data, rua_coberta, faixa_horaria, total_de_vagas, vagas_ocupadas
  from observacoes`

function registradaDe(linha: Linha): ObservacaoRegistrada {
  return {
    id: linha.id,
    data: linha.data,
    ruaCoberta: linha.rua_coberta,
    faixaHoraria: linha.faixa_horaria,
    totalDeVagas: linha.total_de_vagas,
    vagasOcupadas: linha.vagas_ocupadas,
  }
}

/** "AAAA-MM-DD" de uma data que existe no calendário. */
function eDataValida(data: unknown): data is Data {
  if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return false
  const dia = new Date(`${data}T12:00:00Z`)
  return !Number.isNaN(dia.getTime()) && dia.toISOString().slice(0, 10) === data
}

const eInteiro = (valor: unknown): valor is number => Number.isInteger(valor)

/**
 * Observações reais, feitas em campo pela equipe e guardadas no banco do app
 * (ADRs 0011 e 0012). Além da leitura que a Chance usa (`doSemestre`), a
 * equipe registra, lista e apaga observações pela tela da equipe. Nunca se
 * mistura com as observações fictícias: cada fonte entrega só a sua.
 */
export function criarObservacoesReais({ banco, areaCoberta }: { banco: Banco, areaCoberta: AreaCoberta }) {
  function validar(corpo: Partial<CorpoDaObservacao> | null | undefined, agora: Date): CorpoDaObservacao {
    const { data, ruaCoberta, faixaHoraria, totalDeVagas, vagasOcupadas } = corpo ?? {}
    if (!eDataValida(data)) throw new ObservacaoInvalida('Informe a data da observação')
    if (data > areaCoberta.noiteDe(agora)) throw new ObservacaoInvalida('A data não pode ser futura')
    if (!areaCoberta.ruasCobertas().some(r => r.id === ruaCoberta)) {
      throw new ObservacaoInvalida('Escolha uma das ruas cobertas')
    }
    if (typeof faixaHoraria !== 'string' || !areaCoberta.faixasHorarias().includes(faixaHoraria)) {
      throw new ObservacaoInvalida('Escolha uma das faixas horárias da área coberta')
    }
    if (!eInteiro(totalDeVagas) || totalDeVagas < 1 || totalDeVagas > MAXIMO_DE_VAGAS) {
      throw new ObservacaoInvalida(`O total de vagas vai de 1 a ${MAXIMO_DE_VAGAS}`)
    }
    if (!eInteiro(vagasOcupadas) || vagasOcupadas < 0 || vagasOcupadas > totalDeVagas) {
      throw new ObservacaoInvalida('As vagas ocupadas vão de 0 até o total de vagas')
    }
    return { data, ruaCoberta: ruaCoberta as string, faixaHoraria, totalDeVagas, vagasOcupadas }
  }

  const observacoes = {
    /** Observações reais do semestre letivo, para a Chance. */
    async doSemestre(semestre: string): Promise<Observacao[]> {
      const { rows } = await banco.query<Linha>(`${SELECAO} order by data`)
      return rows
        .filter(l => areaCoberta.semestreDe(l.data) === semestre)
        .map(({ data, rua_coberta, faixa_horaria, total_de_vagas, vagas_ocupadas }) => ({
          data,
          ruaCoberta: rua_coberta,
          faixaHoraria: faixa_horaria,
          totalDeVagas: total_de_vagas,
          vagasOcupadas: vagas_ocupadas,
        }))
    },

    eDemonstracao(): boolean {
      return false
    },

    /**
     * Registra a contagem de uma rua coberta numa faixa horária e data. Se já
     * existe uma para a mesma rua, faixa horária e data, substitui (correção).
     */
    async registrar(corpo: Partial<CorpoDaObservacao> | null | undefined, agora: Date): Promise<ObservacaoRegistrada> {
      const o = validar(corpo, agora)
      const { rows: [linha] } = await banco.query<Linha>(
        `insert into observacoes (data, rua_coberta, faixa_horaria, total_de_vagas, vagas_ocupadas)
         values ($1, $2, $3, $4, $5)
         on conflict (data, rua_coberta, faixa_horaria)
         do update set total_de_vagas = excluded.total_de_vagas, vagas_ocupadas = excluded.vagas_ocupadas
         returning id, data::text as data, rua_coberta, faixa_horaria, total_de_vagas, vagas_ocupadas`,
        [o.data, o.ruaCoberta, o.faixaHoraria, o.totalDeVagas, o.vagasOcupadas],
      )
      return registradaDe(linha!)
    },

    /** Todas as observações, da mais nova para a mais antiga. */
    async listar(): Promise<ObservacaoRegistrada[]> {
      const { rows } = await banco.query<Linha>(`${SELECAO} order by data desc, faixa_horaria, rua_coberta`)
      return rows.map(registradaDe)
    },

    /** Apaga uma observação lançada por engano. Apagar uma que não existe não faz nada. */
    async apagar(id: number): Promise<void> {
      await banco.query('delete from observacoes where id = $1', [id])
    },
  } satisfies Observacoes & Record<string, unknown>

  return observacoes
}

export type ObservacoesReais = ReturnType<typeof criarObservacoesReais>
