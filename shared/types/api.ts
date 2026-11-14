/**
 * Peças comuns dos contratos da API (ADR 0032). Os contratos de cada rota
 * ficam no arquivo do recurso, nesta pasta.
 */

/** Resposta de uma rota que devolve 204, sem corpo. */
export type SemConteudo = null

/**
 * Corpo ou query como chegam na rota, antes da validação: as mesmas chaves do
 * contrato, cada uma com valor desconhecido. A rota confere cada valor antes
 * de usar. Renomear uma chave no contrato quebra a rota no typecheck.
 */
export type EntradaNaoValidada<T> = { [Chave in keyof T]?: unknown }
