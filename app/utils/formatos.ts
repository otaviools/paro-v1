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
