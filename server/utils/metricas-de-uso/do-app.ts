import { configuracaoDaAreaCoberta } from '#shared/utils/area-coberta/configuracao'
import { bancoDoApp } from '../banco/do-app'
import { registrosDeVagaDoApp } from '../registros-de-vaga/do-app'
import { criarMetricasFicticias } from './ficticias'
import { criarMetricasDeUso } from '.'

/** Métricas de uso do app, no banco do app, com os totais do fechamento da noite. */
export const metricasDeUsoDoApp = criarMetricasDeUso({ banco: bancoDoApp, registrosDeVaga: registrosDeVagaDoApp })

/** Métricas fictícias da demonstração, na área coberta do app (ADR 0012). */
export const metricasFicticias = criarMetricasFicticias(configuracaoDaAreaCoberta)
