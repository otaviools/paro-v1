import { bancoDoApp } from '../banco/do-app'
import { registrosDeVagaDoApp } from '../registros-de-vaga/do-app'
import { criarMetricasDeUso } from '.'

/** Métricas de uso do app, no banco do app, com os totais do fechamento da noite. */
export const metricasDeUsoDoApp = criarMetricasDeUso({ banco: bancoDoApp, registrosDeVaga: registrosDeVagaDoApp })
