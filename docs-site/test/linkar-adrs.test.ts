import { describe, expect, it } from 'vitest'
import { linkarAdrs } from '../utils/linkar-adrs'

const arquivos = ['0003-a.md', '0004-b.md', '0015-c.md', '0027-d.md', '0001-e.md', '0024-f.md']
const base = 'https://github.com/otaviools/paro-v1/blob/main/docs/adr/'
const link = (numero: string, arquivo: string) => `[${numero}](${base}${arquivo}){target="_blank"}`

describe('linkarAdrs', () => {
  it('liga uma menção solta', () => {
    expect(linkarAdrs('(ADR 0027)', arquivos)).toBe(`(ADR ${link('0027', '0027-d.md')})`)
  })

  it('liga cada número de uma lista', () => {
    expect(linkarAdrs('ADRs 0003, 0004 e 0015', arquivos)).toBe(
      `ADRs ${link('0003', '0003-a.md')}, ${link('0004', '0004-b.md')} e ${link('0015', '0015-c.md')}`
    )
  })

  it('liga as pontas de um intervalo', () => {
    expect(linkarAdrs('ADRs 0001 a 0024', arquivos)).toBe(
      `ADRs ${link('0001', '0001-e.md')} a ${link('0024', '0024-f.md')}`
    )
  })

  it('não mexe em código', () => {
    const texto = 'em `ADR 0027` e `docs/adr/`'
    expect(linkarAdrs(texto, arquivos)).toBe(texto)
  })

  it('não mexe em bloco de código', () => {
    const texto = '```\nADR 0027\n```'
    expect(linkarAdrs(texto, arquivos)).toBe(texto)
  })

  it('não mexe em link que já existe', () => {
    expect(linkarAdrs('[ADR 0027](x)', arquivos)).toBe('[ADR 0027](x)')
  })

  it('deixa como texto o ADR que não existe', () => {
    expect(linkarAdrs('ADR 0099', arquivos)).toBe('ADR 0099')
  })

  it('liga só os números que existem numa lista', () => {
    expect(linkarAdrs('ADRs 0099 e 0027', arquivos)).toBe(`ADRs 0099 e ${link('0027', '0027-d.md')}`)
  })
})
