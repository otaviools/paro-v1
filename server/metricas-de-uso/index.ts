import type { Data } from '../area-coberta'
import type { Banco } from '../banco'
import type { RegistrosDeVaga, TotalDeRegistros } from '../registros-de-vaga'

/** Recorrência de uma semana (de segunda a domingo). */
export interface RecorrênciaDaSemana {
  /** Segunda-feira da semana. */
  semana: Data
  /** Motoristas distintos na semana, pelo identificador mensal. */
  motoristas: number
  /** Desses, quantos voltaram na semana seguinte. */
  voltaramNaSemanaSeguinte: number
}

/** Respostas a "A previsão ajudou hoje?" numa data. */
export interface RespostasDoDia {
  data: Data
  sim: number
  não: number
}

/** Total de registros de vaga de uma noite fechada, gravado pelo fechamento da noite. */
export interface RegistrosDaNoite {
  noite: Data
  total: number
  porRuaEFaixaHorária: TotalDeRegistros[]
}

export interface Relatório {
  recorrência: RecorrênciaDaSemana[]
  ajudou: RespostasDoDia[]
  registrosPorNoite: RegistrosDaNoite[]
}

/** O que uma consolidação fez. */
export interface Consolidação {
  semanasConsolidadas: Data[]
  sessõesApagadas: number
}

/** Sessões com identificador mensal ficam no servidor por 60 dias (ADR 0021). */
const DIAS_DE_RETENÇÃO_DAS_SESSÕES = 60

/**
 * Formato do identificador mensal que Dados do celular sorteia: 16 bytes
 * aleatórios em hexadecimal. Qualquer outra coisa é recusada, para que o
 * servidor nunca guarde texto livre no lugar dele (ADR 0004).
 */
const FORMATO_DO_ID_MENSAL = /^[0-9a-f]{32}$/

/** O identificador mensal não está no formato sorteado pelo celular. */
export class IdMensalInválido extends Error {
  constructor() {
    super('O identificador de sessão precisa ser o número sorteado pelo celular')
  }
}

/** Maior período de um relatório, para a consulta não varrer anos de noites. */
const MÁXIMO_DE_DIAS_DO_RELATÓRIO = 366

/** Período de relatório invertido, fora do formato "AAAA-MM-DD" ou longo demais. */
export class PeríodoInválido extends Error {
  constructor() {
    super(`Informe de e ate no formato AAAA-MM-DD, com ate depois de de e no máximo ${MÁXIMO_DE_DIAS_DO_RELATÓRIO} dias`)
  }
}

const DIA_EM_MS = 24 * 60 * 60 * 1000

/** Dias de `de` a `até`, ou NaN se uma das datas não está no formato "AAAA-MM-DD". */
function diasEntre(de: Data, até: Data): number {
  const formato = /^\d{4}-\d{2}-\d{2}$/
  if (!formato.test(de) || !formato.test(até)) return Number.NaN
  return (Date.parse(`${até}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / DIA_EM_MS
}

export interface DependênciasDasMétricasDeUso {
  banco: Banco
  /**
   * Só os totais que o fechamento da noite gravou. Métricas de uso nunca lê
   * os registros de vaga em si.
   */
  registrosDeVaga: Pick<RegistrosDeVaga, 'totaisDaNoite'>
}

/** Segunda-feira da semana de uma coluna `date`, em SQL (semana ISO). */
const segundaDe = (coluna: string) => `(${coluna} - (extract(isodow from ${coluna})::int - 1))`

/** As datas de `de` a `até`, inclusive, no formato "AAAA-MM-DD". */
function datasEntre(de: Data, até: Data): Data[] {
  const datas: Data[] = []
  for (let dia = new Date(`${de}T00:00:00Z`); dia <= new Date(`${até}T00:00:00Z`); dia.setUTCDate(dia.getUTCDate() + 1)) {
    datas.push(dia.toISOString().slice(0, 10))
  }
  return datas
}

export function criarMetricasDeUso({ banco, registrosDeVaga }: DependênciasDasMétricasDeUso) {
  return {
    /**
     * Guarda uma visita com o identificador mensal do celular (ADR 0004).
     * Uma por identificador e data: visitas repetidas no mesmo dia não somam.
     */
    async registrarSessão(idMensal: string, data: Data): Promise<void> {
      if (!FORMATO_DO_ID_MENSAL.test(idMensal)) throw new IdMensalInválido()
      await banco.query(
        'insert into sessoes (id_mensal, data) values ($1, $2) on conflict do nothing',
        [idMensal, data],
      )
    },

    /** Guarda uma resposta a "A previsão ajudou hoje?", sem identificador. */
    async responderAjudou(ajudou: boolean, data: Data): Promise<void> {
      await banco.query('insert into respostas_ajudou (data, ajudou) values ($1, $2)', [data, ajudou])
    },

    /**
     * Rotina diária (ADR 0021), com `data` = o dia de hoje:
     * - grava o total de cada semana assim que a semana seguinte termina,
     *   porque é aí que dá para saber quem voltou. Uma semana já
     *   consolidada não é refeita;
     * - apaga as sessões com mais de 60 dias, que a essa altura já viraram
     *   totais.
     * Um comando só, para que totais e exclusão aconteçam juntos. Rodar de
     * novo não duplica nada.
     */
    async consolidar(data: Data): Promise<Consolidação> {
      const { rows: [resultado] } = await banco.query<{ semanas: string[], apagadas: number }>(
        `with consolidadas as (
           insert into totais_de_sessoes (semana, motoristas, voltaram_na_semana_seguinte)
           select s.semana, count(distinct s.id_mensal)::int,
             (count(distinct s.id_mensal) filter (where exists (
               select 1 from sessoes p
               where p.id_mensal = s.id_mensal and ${segundaDe('p.data')} = s.semana + 7
             )))::int
           from (select id_mensal, ${segundaDe('data')} as semana from sessoes) s
           where s.semana + 14 <= $1::date
           group by s.semana
           on conflict (semana) do nothing
           returning semana
         ),
         apagadas as (
           delete from sessoes where data < $1::date - ${DIAS_DE_RETENÇÃO_DAS_SESSÕES}
           returning 1
         )
         select
           coalesce((select array_agg(to_char(semana, 'YYYY-MM-DD') order by semana) from consolidadas), '{}') as semanas,
           (select count(*)::int from apagadas) as apagadas`,
        [data],
      )
      return { semanasConsolidadas: resultado!.semanas, sessõesApagadas: resultado!.apagadas }
    },

    /**
     * Metas do plano (seção 12.6) entre `de` e `até`, inclusive: recorrência
     * das semanas já consolidadas, respostas de "A previsão ajudou hoje?" e
     * total de registros das noites já fechadas. Período de até 366 dias.
     */
    async relatório(de: Data, até: Data): Promise<Relatório> {
      const dias = diasEntre(de, até)
      if (!(dias >= 0 && dias <= MÁXIMO_DE_DIAS_DO_RELATÓRIO)) throw new PeríodoInválido()
      const { rows: respostas } = await banco.query<{ data: string, sim: number, nao: number }>(
        `select to_char(data, 'YYYY-MM-DD') as data,
           (count(*) filter (where ajudou))::int as sim,
           (count(*) filter (where not ajudou))::int as nao
         from respostas_ajudou where data between $1 and $2
         group by data order by data`,
        [de, até],
      )
      const { rows } = await banco.query<{ semana: string, motoristas: number, voltaram: number }>(
        `select to_char(semana, 'YYYY-MM-DD') as semana, motoristas, voltaram_na_semana_seguinte as voltaram
         from totais_de_sessoes where semana between $1 and $2 order by semana`,
        [de, até],
      )
      const registrosPorNoite: RegistrosDaNoite[] = []
      for (const noite of datasEntre(de, até)) {
        const totais = await registrosDeVaga.totaisDaNoite(noite)
        if (totais.length === 0) continue
        registrosPorNoite.push({ noite, total: totais.reduce((soma, t) => soma + t.quantidade, 0), porRuaEFaixaHorária: totais })
      }
      return {
        recorrência: rows.map(r => ({ semana: r.semana, motoristas: r.motoristas, voltaramNaSemanaSeguinte: r.voltaram })),
        ajudou: respostas.map(r => ({ data: r.data, sim: r.sim, não: r.nao })),
        registrosPorNoite,
      }
    },
  }
}

export type MetricasDeUso = ReturnType<typeof criarMetricasDeUso>
