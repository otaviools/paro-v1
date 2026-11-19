import { gradeDosTextos } from '.'
import type { DiaDaSemana, GradeHoraria, TextoDoPdf } from '.'

export type LeituraDoPdf
  = | { tipo: 'lida', grade: GradeHoraria, foraDaNoite: DiaDaSemana[] }
    /** PDF sem texto (letras desenhadas) ou que não é uma grade horária da ESAMC. */
    | { tipo: 'ilegivel' }

/**
 * Lê o PDF do horário de aulas no navegador, com o pdf.js (ADR 0035). O
 * arquivo não sai do celular: daqui só sai a grade, com os horários de cada
 * dia. O pdf.js (cerca de 1 MB) só é baixado na primeira leitura. Usa a
 * versão "legacy", que funciona também em navegadores mais antigos.
 */
export async function lerGradeDoPdf(arquivo: File): Promise<LeituraDoPdf> {
  const [{ getDocument, GlobalWorkerOptions }, { default: WorkerDoPdf }] = await Promise.all([
    import('pdfjs-dist/legacy/build/pdf.mjs'),
    // O Vite empacota o worker do pdf.js como um Web Worker do próprio app.
    import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?worker'),
  ])
  GlobalWorkerOptions.workerPort ??= new WorkerDoPdf()

  try {
    const documento = await getDocument({ data: new Uint8Array(await arquivo.arrayBuffer()) }).promise
    const paginas: TextoDoPdf[][] = []
    for (let numero = 1; numero <= documento.numPages; numero++) {
      const { items } = await (await documento.getPage(numero)).getTextContent()
      paginas.push(items.flatMap(item => ('str' in item && item.str.trim())
        ? [{ texto: item.str.trim(), x: item.transform[4] as number, y: item.transform[5] as number }]
        : []))
    }
    await documento.destroy()
    const lida = gradeDosTextos(paginas)
    return lida ? { tipo: 'lida', ...lida } : { tipo: 'ilegivel' }
  }
  catch {
    // Arquivo corrompido, protegido por senha ou que não é PDF.
    return { tipo: 'ilegivel' }
  }
}
