import { mkdirSync } from 'node:fs'
import { aplicarMigracoes } from '.'
import type { Banco } from '.'
import { migracoes } from './migracoes'

/** Pasta do PGLite local, fora do Git (.gitignore). */
const PASTA_DO_PGLITE = '.data/pglite'

/**
 * Postgres hospedado (Supabase), via o pacote `postgres`. As migrações rodam
 * numa conexão reservada, porque abrem e fecham transação em chamadas
 * separadas. `prepare: false` porque o pooler do Supabase, em modo de
 * transação, não aceita prepared statements.
 */
async function conectarAoPostgres(url: string): Promise<Banco> {
  const { default: postgres } = await import('postgres')
  const sql = postgres(url, { prepare: false, onnotice: () => {} })

  type Cliente = Pick<typeof sql, 'unsafe'>
  const adaptar = (cliente: Cliente): Banco => ({
    async query<T>(texto: string, parametros: unknown[] = []) {
      const rows = await cliente.unsafe(texto, parametros as never[])
      return { rows: [...rows] as T[] }
    },
    // Sem parâmetros, o `postgres` usa o protocolo simples, que aceita vários comandos.
    exec: (texto: string) => cliente.unsafe(texto),
  })

  const reservada = await sql.reserve()
  try {
    await aplicarMigracoes(adaptar(reservada), migracoes)
  }
  finally {
    reservada.release()
  }
  return adaptar(sql)
}

/** PGLite persistido em `.data/`, para rodar o app sem Postgres. */
async function conectarAoPGLite(): Promise<Banco> {
  const { PGlite } = await import('@electric-sql/pglite')
  mkdirSync(PASTA_DO_PGLITE, { recursive: true })
  const banco = new PGlite(PASTA_DO_PGLITE)
  await aplicarMigracoes(banco, migracoes)
  return banco
}

let conexao: Promise<Banco> | undefined

/**
 * Conecta ao banco do app e aplica as migrações, uma vez só. Com
 * `DATABASE_URL`, usa o Postgres dessa URL; sem ela, o PGLite em `.data/`.
 */
export function prepararBancoDoApp(): Promise<Banco> {
  conexao ??= (process.env.DATABASE_URL ? conectarAoPostgres(process.env.DATABASE_URL) : conectarAoPGLite())
    .catch((erro) => {
      // Uma falha (banco fora do ar, por exemplo) não fica guardada: a próxima chamada tenta de novo.
      conexao = undefined
      throw erro
    })
  return conexao
}

/**
 * Banco do app. Só conecta na primeira consulta, já com as migrações
 * aplicadas; importar este arquivo não abre conexão.
 */
export const bancoDoApp: Banco = {
  async query<T>(texto: string, parametros?: unknown[]) {
    return (await prepararBancoDoApp()).query<T>(texto, parametros)
  },
  async exec(texto: string) {
    return (await prepararBancoDoApp()).exec(texto)
  },
}
