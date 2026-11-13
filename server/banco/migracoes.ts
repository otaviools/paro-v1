import type { Migracao } from '.'

/**
 * Migrações do banco do app, em ordem. Cada ticket que cria tabelas acrescenta
 * a sua aqui (observações, registros de vaga, totais por noite, sessões...).
 */
export const migracoes: Migracao[] = [
  {
    // Registro de vaga (ADRs 0003, 0004 e 0014): só a rua coberta, as faixas
    // horárias de chegada e de saída prevista, a noite, o hash do código e se
    // foi encerrado. Sem coordenadas, sem identificador de pessoa e sem o
    // código em claro, que fica só no celular.
    nome: '0001_registros_de_vaga',
    sql: `
      create table registros_de_vaga (
        hash_do_codigo text primary key,
        noite date not null,
        rua_coberta text not null,
        chegada text not null,
        saida_prevista text not null,
        encerrado boolean not null default false
      );
      create index registros_de_vaga_noite on registros_de_vaga (noite);
    `,
  },
  {
    // Total de registros por noite (ADR 0021): o que fica de uma noite fechada.
    // Só a noite, a rua coberta, a faixa horária de chegada e a quantidade.
    // Sem identificador e sem código. A chave impede total duplicado.
    nome: '0002_totais_de_registros',
    sql: `
      create table totais_de_registros (
        noite date not null,
        rua_coberta text not null,
        faixa_horaria text not null,
        quantidade integer not null,
        primary key (noite, rua_coberta, faixa_horaria)
      );
    `,
  },
]
