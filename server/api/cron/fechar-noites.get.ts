import { areaCoberta } from '../../area-coberta'
import { metricasDeUsoDoApp } from '../../metricas-de-uso/do-app'
import { registrosDeVagaDoApp } from '../../registros-de-vaga/do-app'
import { exigirSegredo } from '../../utils/segredo'

/**
 * Rotina diária (Vercel Cron, agendada em `nitro.vercel.config` no
 * `nuxt.config.ts`), protegida por `CRON_SECRET`; a Vercel manda
 * `Authorization: Bearer <CRON_SECRET>` (ADR 0021):
 * 1. fecha as noites anteriores à noite de agora que ainda têm registros de vaga;
 * 2. consolida as sessões em totais por semana e apaga as com mais de 60 dias.
 */
export default defineEventHandler(async (event) => {
  exigirSegredo(event, process.env.CRON_SECRET)
  const agora = new Date()
  const noitesFechadas = await registrosDeVagaDoApp.fecharNoitesAnteriores(agora)
  const { semanasConsolidadas, sessoesApagadas } = await metricasDeUsoDoApp.consolidar(areaCoberta.noiteDe(agora))
  return { noitesFechadas, semanasConsolidadas, sessoesApagadas }
})
