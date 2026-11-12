/**
 * O que os módulos do servidor precisam de um Postgres. O PGLite (nos testes)
 * e o cliente do Postgres hospedado (em produção) satisfazem esta interface.
 */
export interface Banco {
  query<T = Record<string, unknown>>(sql: string, parametros?: unknown[]): Promise<{ rows: T[] }>
  exec(sql: string): Promise<unknown>
}

export interface Migracao {
  /** Nome único, com prefixo numérico que define a ordem (ex.: "0001_observacoes"). */
  nome: string
  sql: string
}

/** Aplica, em ordem, as migrações ainda não aplicadas. Devolve os nomes aplicados. */
export async function aplicarMigracoes(banco: Banco, migracoes: Migracao[]): Promise<string[]> {
  await banco.exec(`
    create table if not exists migracoes_aplicadas (
      nome text primary key,
      aplicada_em timestamptz not null default now()
    );
  `)
  const { rows } = await banco.query<{ nome: string }>('select nome from migracoes_aplicadas')
  const jaAplicadas = new Set(rows.map((r) => r.nome))

  const aplicadas: string[] = []
  for (const migracao of [...migracoes].sort((a, b) => a.nome.localeCompare(b.nome))) {
    if (jaAplicadas.has(migracao.nome)) continue
    await banco.exec('begin')
    try {
      await banco.exec(migracao.sql)
      await banco.query('insert into migracoes_aplicadas (nome) values ($1)', [migracao.nome])
      await banco.exec('commit')
    }
    catch (erro) {
      await banco.exec('rollback')
      throw erro
    }
    aplicadas.push(migracao.nome)
  }
  return aplicadas
}
