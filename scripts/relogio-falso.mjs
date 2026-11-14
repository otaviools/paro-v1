/**
 * Relógio falso para testar o Parô fora do horário da área coberta (17h às
 * 23h): adianta ou atrasa o `Date` só no processo que o carrega, sem mudar o
 * código do app. Carregado pelo `npm run dev:relogio` (dev-com-relogio.mjs).
 *
 * RELOGIO_FALSO define a hora de partida, no horário de Brasília:
 * - "20:00": hoje às 20h (o padrão, sem a variável);
 * - "2026-11-20T21:30:00-03:00": data e hora completas.
 * O relógio anda normalmente a partir daí. Só vale para desenvolvimento.
 */
const DataReal = Date
const valor = process.env.RELOGIO_FALSO || '20:00'
const hoje = new DataReal().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
const partida = /^\d{2}:\d{2}$/.test(valor) ? `${hoje}T${valor}:00-03:00` : valor
const deslocamento = DataReal.parse(partida) - DataReal.now()

if (Number.isNaN(deslocamento)) {
  throw new Error(`RELOGIO_FALSO inválido: "${valor}". Use "20:00" ou "2026-11-20T21:30:00-03:00".`)
}

class DataFalsa extends DataReal {
  constructor(...args) {
    if (args.length === 0) super(DataReal.now() + deslocamento)
    else super(...args)
  }

  static now() {
    return DataReal.now() + deslocamento
  }
}

globalThis.Date = DataFalsa
