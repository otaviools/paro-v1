import { describe, expect, it } from 'vitest'
import { aplicarMigracoes } from '.'
import { criarBancoDeTeste } from '../../testes/banco-de-teste'

const migracoes = [
  { nome: '0001_cria_exemplo', sql: 'create table exemplo (valor int not null);' },
  { nome: '0002_insere_exemplo', sql: 'insert into exemplo (valor) values (42);' },
]

describe('Banco', () => {
  it('aplica as migrações em ordem num banco de teste em memória', async () => {
    const banco = await criarBancoDeTeste(migracoes)

    const { rows } = await banco.query<{ valor: number }>('select valor from exemplo')

    expect(rows).toEqual([{ valor: 42 }])
  })

  it('não reaplica migrações já aplicadas', async () => {
    const banco = await criarBancoDeTeste(migracoes)

    const aplicadas = await aplicarMigracoes(banco, migracoes)
    const { rows } = await banco.query('select valor from exemplo')

    expect(aplicadas).toEqual([])
    expect(rows).toHaveLength(1)
  })

  it('aplica só as migrações novas', async () => {
    const banco = await criarBancoDeTeste(migracoes)
    const nova = { nome: '0003_insere_outro', sql: 'insert into exemplo (valor) values (7);' }

    const aplicadas = await aplicarMigracoes(banco, [...migracoes, nova])

    expect(aplicadas).toEqual(['0003_insere_outro'])
  })
})
