import type { Migracao } from '.'

/**
 * Migrações do banco do app, em ordem. Cada ticket que cria tabelas acrescenta
 * a sua aqui (observações, registros de vaga, totais por noite, sessões...).
 */
export const migracoes: Migracao[] = []
