import { createHash, randomBytes } from 'node:crypto'
import type { AreaCoberta, Data, FaixaHorária } from '../area-coberta'
import type { Banco } from '../banco'

/** Faixa horária de chegada informada: uma faixa horária ou "agora". */
export type ChegadaInformada = FaixaHorária | 'agora'

export interface NovoRegistro {
  ruaCoberta: string
  chegada: ChegadaInformada
  saídaPrevista: FaixaHorária
}

/** O que o celular guarda depois de registrar (Dados do celular). */
export interface Registrado {
  /** Código aleatório de uso único; o servidor guarda só o hash (ADR 0014). */
  código: string
  noite: Data
  chegada: FaixaHorária
}

/** Quantos registros abertos indicam saída numa rua coberta e faixa horária. */
export interface SaídaPrevista {
  ruaCoberta: string
  faixaHorária: FaixaHorária
  quantidade: number
}

/**
 * Total de registros por noite (ADR 0021): quantos registros de vaga chegaram
 * numa rua coberta e faixa horária, numa noite fechada. Sem identificador nem código.
 */
export interface TotalDeRegistros {
  ruaCoberta: string
  /** Faixa horária de chegada dos registros. */
  faixaHorária: FaixaHorária
  quantidade: number
}

export interface DependênciasDosRegistrosDeVaga {
  banco: Banco
  areaCoberta: AreaCoberta
}

/**
 * O código não abre nenhum registro aberto desta noite: não existe, já foi
 * usado no "Saí" ou é de outra noite (ADR 0014).
 */
export class CódigoRecusado extends Error {
  constructor() {
    super('Este código não vale para nenhum registro de vaga aberto nesta noite')
  }
}

/**
 * Registro fora das regras: rua não coberta, faixa horária fora da área
 * coberta, saída antes da chegada ou numa faixa horária que já passou.
 */
export class RegistroInválido extends Error {}

function hashDe(código: string): string {
  return createHash('sha256').update(código).digest('hex')
}

export function criarRegistrosDeVaga({ banco, areaCoberta }: DependênciasDosRegistrosDeVaga) {
  function exigirFaixaHorária(faixaHorária: FaixaHorária | null, nome: string): asserts faixaHorária is FaixaHorária {
    if (faixaHorária === null || !areaCoberta.faixasHorárias().includes(faixaHorária)) {
      throw new RegistroInválido(`A ${nome} precisa ser uma faixa horária da área coberta, das 17h às 23h`)
    }
  }

  /**
   * A saída prevista é uma faixa horária da área coberta, não é antes da
   * chegada e não é uma faixa horária que já passou em `agora`.
   * "HH:MM" em ordem de texto é a ordem do horário.
   */
  function exigirSaídaPrevistaVálida(chegada: FaixaHorária, saídaPrevista: FaixaHorária, agora: Date) {
    exigirFaixaHorária(saídaPrevista, 'saída prevista')
    if (saídaPrevista < chegada) throw new RegistroInválido('A saída prevista não pode ser antes da chegada')
    const faixaDeAgora = areaCoberta.faixaHorária(agora)
    if (faixaDeAgora !== null && saídaPrevista < faixaDeAgora) {
      throw new RegistroInválido('A saída prevista não pode ser numa faixa horária que já passou')
    }
  }

  /**
   * Fecha a noite (ADR 0021): grava o total de registros por rua coberta e
   * faixa horária de chegada, encerrados incluídos, e apaga os registros
   * dessa noite. Os códigos deles deixam de valer.
   *
   * Conta pela chegada porque ela é quando o registro foi feito (a rota usa
   * a faixa horária de agora) e não muda depois; a saída prevista muda com
   * "alterar saída" e perde o sentido no "Saí". Assim o total mede quantos
   * registros houve em cada faixa horária, para a meta de 20 por noite.
   *
   * Um comando só, para que totais e exclusão aconteçam juntos. Fechar de
   * novo não duplica nada: os registros já contados foram apagados, e um
   * registro que chegue depois soma ao total que já existe.
   */
  async function fecharNoite(noite: Data): Promise<void> {
    await banco.query(
      `with apagados as (
         delete from registros_de_vaga where noite = $1
         returning rua_coberta, chegada
       )
       insert into totais_de_registros (noite, rua_coberta, faixa_horaria, quantidade)
       select $1, rua_coberta, chegada, count(*)::int from apagados
       group by rua_coberta, chegada
       on conflict (noite, rua_coberta, faixa_horaria)
       do update set quantidade = totais_de_registros.quantidade + excluded.quantidade`,
      [noite],
    )
  }

  return {
    /** Recebe um registro de vaga na noite de `agora` e devolve o código dele. */
    async registrar({ ruaCoberta, chegada, saídaPrevista }: NovoRegistro, agora: Date): Promise<Registrado> {
      if (!areaCoberta.ruasCobertas().some(r => r.id === ruaCoberta)) {
        throw new RegistroInválido(`"${ruaCoberta}" não é uma rua coberta`)
      }
      const chegadaDoRegistro = chegada === 'agora' ? areaCoberta.faixaHorária(agora) : chegada
      exigirFaixaHorária(chegadaDoRegistro, 'chegada')
      exigirSaídaPrevistaVálida(chegadaDoRegistro, saídaPrevista, agora)

      const noite = areaCoberta.noiteDe(agora)
      const código = randomBytes(16).toString('base64url')
      await banco.query(
        `insert into registros_de_vaga (hash_do_codigo, noite, rua_coberta, chegada, saida_prevista)
         values ($1, $2, $3, $4, $5)`,
        [hashDe(código), noite, ruaCoberta, chegadaDoRegistro, saídaPrevista],
      )
      return { código, noite, chegada: chegadaDoRegistro }
    },

    /** Muda a faixa horária de saída prevista do registro do código. */
    async alterarSaída(código: string, saídaPrevista: FaixaHorária, agora: Date): Promise<void> {
      const hash = hashDe(código)
      const { rows: [registro] } = await banco.query<{ chegada: string }>(
        `select chegada from registros_de_vaga
         where hash_do_codigo = $1 and noite = $2 and not encerrado`,
        [hash, areaCoberta.noiteDe(agora)],
      )
      if (!registro) throw new CódigoRecusado()
      exigirSaídaPrevistaVálida(registro.chegada, saídaPrevista, agora)
      await banco.query('update registros_de_vaga set saida_prevista = $2 where hash_do_codigo = $1', [hash, saídaPrevista])
    },

    /** "Saí": encerra o registro do código, que deixa de contar nas saídas previstas. */
    async encerrar(código: string, agora: Date): Promise<void> {
      const { rows } = await banco.query(
        `update registros_de_vaga set encerrado = true
         where hash_do_codigo = $1 and noite = $2 and not encerrado
         returning 1`,
        [hashDe(código), areaCoberta.noiteDe(agora)],
      )
      if (rows.length === 0) throw new CódigoRecusado()
    },

    /** Saídas previstas da noite, por rua coberta e faixa horária, sem os registros encerrados. */
    async saídasPrevistas(noite: Data): Promise<SaídaPrevista[]> {
      const { rows } = await banco.query<{ rua_coberta: string, saida_prevista: string, quantidade: number }>(
        `select rua_coberta, saida_prevista, count(*)::int as quantidade
         from registros_de_vaga
         where noite = $1 and not encerrado
         group by rua_coberta, saida_prevista
         order by rua_coberta, saida_prevista`,
        [noite],
      )
      return rows.map(r => ({ ruaCoberta: r.rua_coberta, faixaHorária: r.saida_prevista, quantidade: r.quantidade }))
    },

    fecharNoite,

    /**
     * Fecha todas as noites anteriores à noite de `agora` que ainda têm
     * registros. A noite de `agora` continua aberta. Devolve as noites fechadas.
     */
    async fecharNoitesAnteriores(agora: Date): Promise<Data[]> {
      const { rows } = await banco.query<{ noite: string }>(
        `select distinct to_char(noite, 'YYYY-MM-DD') as noite from registros_de_vaga
         where noite < $1 order by noite`,
        [areaCoberta.noiteDe(agora)],
      )
      for (const { noite } of rows) await fecharNoite(noite)
      return rows.map(r => r.noite)
    },

    /** Total de registros de uma noite fechada, por rua coberta e faixa horária de chegada. */
    async totaisDaNoite(noite: Data): Promise<TotalDeRegistros[]> {
      const { rows } = await banco.query<{ rua_coberta: string, faixa_horaria: string, quantidade: number }>(
        `select rua_coberta, faixa_horaria, quantidade from totais_de_registros
         where noite = $1 order by rua_coberta, faixa_horaria`,
        [noite],
      )
      return rows.map(r => ({ ruaCoberta: r.rua_coberta, faixaHorária: r.faixa_horaria, quantidade: r.quantidade }))
    },
  }
}

export type RegistrosDeVaga = ReturnType<typeof criarRegistrosDeVaga>
