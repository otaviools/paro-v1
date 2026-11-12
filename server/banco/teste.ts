import { PGlite } from '@electric-sql/pglite'
import { aplicarMigracoes } from '.'
import type { Banco, Migracao } from '.'
import { migracoes as migracoesDoApp } from './migracoes'

/**
 * Banco Postgres em memória (PGLite) para os testes do servidor, já com as
 * migrações aplicadas. Cada chamada devolve um banco novo e isolado.
 */
export async function criarBancoDeTeste(migracoes: Migracao[] = migracoesDoApp): Promise<Banco> {
  const banco = new PGlite()
  await aplicarMigracoes(banco, migracoes)
  return banco
}
