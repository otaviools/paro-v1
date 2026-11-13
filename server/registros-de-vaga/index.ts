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

/** Registro fora das regras: rua não coberta, faixa horária fora da área coberta ou saída antes da chegada. */
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

  /** "HH:MM" em ordem de texto é a ordem do horário. */
  function exigirSaídaDepoisDaChegada(chegada: FaixaHorária, saídaPrevista: FaixaHorária) {
    exigirFaixaHorária(saídaPrevista, 'saída prevista')
    if (saídaPrevista < chegada) throw new RegistroInválido('A saída prevista não pode ser antes da chegada')
  }

  return {
    /** Recebe um registro de vaga na noite de `agora` e devolve o código dele. */
    async registrar({ ruaCoberta, chegada, saídaPrevista }: NovoRegistro, agora: Date): Promise<Registrado> {
      if (!areaCoberta.ruasCobertas().some((r) => r.id === ruaCoberta)) {
        throw new RegistroInválido(`"${ruaCoberta}" não é uma rua coberta`)
      }
      const chegadaDoRegistro = chegada === 'agora' ? areaCoberta.faixaHorária(agora) : chegada
      exigirFaixaHorária(chegadaDoRegistro, 'chegada')
      exigirSaídaDepoisDaChegada(chegadaDoRegistro, saídaPrevista)

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
      exigirSaídaDepoisDaChegada(registro.chegada, saídaPrevista)
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
      return rows.map((r) => ({ ruaCoberta: r.rua_coberta, faixaHorária: r.saida_prevista, quantidade: r.quantidade }))
    },
  }
}

export type RegistrosDeVaga = ReturnType<typeof criarRegistrosDeVaga>
