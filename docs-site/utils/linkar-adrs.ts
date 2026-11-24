// Transforma "ADR 0029" (e listas como "ADRs 0003, 0004 e 0015" ou "ADRs 0001 a 0024")
// em links para o arquivo do ADR no GitHub. Usado nas páginas lidas de ../docs, que citam
// ADRs, mas os ADRs não entram no site. Não mexe em código nem em links que já existem,
// e deixa como texto o número que não tem arquivo em docs/adr/.

const BASE = 'https://github.com/otaviools/paro-v1/blob/main/docs/adr/'

// Trechos que ficam intactos: bloco de código, código em linha e link Markdown.
const PROTEGIDO = /```[\s\S]*?```|`[^`\n]*`|\[[^\]\n]*\]\([^)\n]*\)/g
const MENCAO = /\bADRs? (\d{4}(?:(?:, | e | a )\d{4})*)/g

export function linkarAdrs(markdown: string, arquivos: string[]): string {
  const porNumero = new Map(arquivos.map(arquivo => [arquivo.slice(0, 4), arquivo]))

  const linkarTexto = (texto: string) =>
    texto.replace(MENCAO, (mencao, lista: string) => {
      const prefixo = mencao.slice(0, mencao.length - lista.length)
      const ligada = lista.replace(/\d{4}/g, (numero) => {
        const arquivo = porNumero.get(numero)
        return arquivo ? `[${numero}](${BASE}${arquivo}){target="_blank"}` : numero
      })
      return prefixo + ligada
    })

  let saida = ''
  let inicio = 0
  for (const trecho of markdown.matchAll(PROTEGIDO)) {
    saida += linkarTexto(markdown.slice(inicio, trecho.index)) + trecho[0]
    inicio = trecho.index + trecho[0].length
  }
  return saida + linkarTexto(markdown.slice(inicio))
}
