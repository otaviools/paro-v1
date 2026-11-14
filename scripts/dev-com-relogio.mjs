/**
 * Sobe o `nuxt dev` com o relógio falso (relogio-falso.mjs) carregado no
 * servidor, para testar o registro de vaga e o Panorama da noite fora do
 * horário da área coberta. A hora do app vem só do servidor (`/api/agora`),
 * então basta adiantar o relógio dele.
 *
 * Uso: npm run dev:relogio -- [hora] [opções do nuxt dev]
 *   npm run dev:relogio                  hoje às 20h de Brasília
 *   npm run dev:relogio -- 21:30         hoje às 21h30
 *   npm run dev:relogio -- 2026-11-20T18:00:00-03:00 --port 3102
 *
 * Usa a mesma pasta .data/pglite do `npm run dev`: pare o outro antes.
 */
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const [primeiro, ...resto] = process.argv.slice(2)
const temHora = primeiro !== undefined && !primeiro.startsWith('-')
const hora = temHora ? primeiro : '20:00'
const opcoes = temHora ? resto : process.argv.slice(2)

const relogio = new URL('./relogio-falso.mjs', import.meta.url).href
const env = {
  ...process.env,
  RELOGIO_FALSO: hora,
  NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --import ${relogio}`.trim(),
}

console.log(`Relógio falso: o servidor parte de ${hora} (horário de Brasília).`)
// Chama o binário do Nuxt com o próprio Node, sem shell: os argumentos passam sem concatenar.
const binarioDoNuxt = fileURLToPath(new URL('../node_modules/nuxt/bin/nuxt.mjs', import.meta.url))
const nuxt = spawn(process.execPath, [binarioDoNuxt, 'dev', ...opcoes], { stdio: 'inherit', env })
nuxt.on('exit', codigo => process.exit(codigo ?? 0))
