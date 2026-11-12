/** "19:00" → "19h"; "19:30" → "19h30". */
export function rotuloDaFaixaHoraria(inicio: string) {
  const [h, m] = inicio.split(':')
  return m === '00' ? `${h}h` : `${h}h${m}`
}

/** "AAAA-MM-DD" → "DD/MM". */
function diaEMes(data: string) {
  const [, mes, dia] = data.split('-')
  return `${dia}/${mes}`
}

/** Base de uma chance: "6 noites · última em 04/11". */
export function textoDaBase(base: { observações: number, última: string }) {
  return `${base.observações} noites · última em ${diaEMes(base.última)}`
}

export function distanciaAPe(metros: number) {
  return `${metros} m a pé`
}

/** "18:00" → "18h–18h30"; "22:30" → "22h30–23h". */
export function intervaloDaFaixaHoraria(inicio: string) {
  const [h, m] = inicio.split(':').map(Number) as [number, number]
  const fim = h * 60 + m + 30
  const hhmm = (minutos: number) =>
    `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`
  return `${rotuloDaFaixaHoraria(inicio)}–${rotuloDaFaixaHoraria(hhmm(fim))}`
}

/**
 * Chance em número com a base (ADR 0006): "7 de 10 noites · última em 04/11".
 * As noites não cheias voltam da chance, que é exatamente não cheias / base.
 */
export function textoDaChanceComBase(chance: number, base: { observações: number, última: string }) {
  const naoCheias = Math.round((chance * base.observações) / 100)
  return `${naoCheias} de ${textoDaBase(base)}`
}
