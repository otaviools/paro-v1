import { describe, expect, it } from 'vitest'
import { diaDaSemanaDaNoite, eAulaDaNoite, gradeDosTextos, saidaPrevistaDaAula } from '.'
import type { TextoDoPdf } from '.'
// Textos do PDF de uma grade real do portal da ESAMC, só com dias, rótulos de
// horário e "Sala" (sem nome, documentos, disciplinas nem professores).
import gradeDaEsamc from './fixtures/grade-esamc.json'
// Outra grade real, do AlunoNet, em que o fim vem num texto à parte, "às HH:MM".
import gradeDoAlunoNet from './fixtures/grade-alunonet.json'

const FAIXAS = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30']

describe('Grade horária', () => {
  describe('lida do PDF do portal da ESAMC', () => {
    const lida = gradeDosTextos(gradeDaEsamc as TextoDoPdf[][])

    it('tem o início da primeira aula e o fim da última de cada dia com aula na noite', () => {
      expect(lida?.grade).toEqual({
        seg: { inicio: '19:00', fim: '21:50' },
        ter: { inicio: '19:00', fim: '21:50' },
        qua: { inicio: '19:00', fim: '20:40' },
        qui: { inicio: '19:00', fim: '21:50' },
        sex: { inicio: '19:00', fim: '21:50' },
      })
    })

    it('deixa de fora o dia só com aulas à tarde, e avisa', () => {
      expect(lida?.foraDaNoite).toEqual(['sab'])
    })
  })

  it('lê a grade do AlunoNet, com o fim da aula em "às HH:MM" no texto de baixo', () => {
    expect(gradeDosTextos(gradeDoAlunoNet as TextoDoPdf[][])).toEqual({
      grade: {
        seg: { inicio: '19:00', fim: '21:50' },
        ter: { inicio: '19:00', fim: '21:50' },
        qua: { inicio: '19:00', fim: '20:40' },
        qui: { inicio: '19:00', fim: '21:50' },
        sex: { inicio: '19:00', fim: '21:50' },
      },
      foraDaNoite: ['sab'],
    })
  })

  it('não é uma grade quando o PDF não tem texto', () => {
    expect(gradeDosTextos([[], [], []])).toBeNull()
  })

  it('não é uma grade quando o PDF tem texto, mas não tem os dias nem aulas', () => {
    expect(gradeDosTextos([[{ texto: 'Fatura do cartão', x: 50, y: 700 }, { texto: 'Sala de estar', x: 60, y: 600 }]])).toBeNull()
  })

  it('acha o fim da linha no mesmo texto do rótulo', () => {
    const lida = gradeDosTextos([[
      { texto: 'Segunda', x: 100, y: 600 },
      { texto: 'Das 19:00 às 19:50', x: 20, y: 500 },
      { texto: 'Sala:', x: 110, y: 480 },
    ]])

    expect(lida?.grade).toEqual({ seg: { inicio: '19:00', fim: '19:50' } })
  })

  it('aula da noite começa das 17h às 23h', () => {
    expect(eAulaDaNoite({ inicio: '17:00', fim: '17:50' })).toBe(true)
    expect(eAulaDaNoite({ inicio: '16:40', fim: '17:10' })).toBe(false)
    expect(eAulaDaNoite({ inicio: '19:00', fim: '18:00' })).toBe(false)
  })

  it('o dia da semana vem da noite; domingo não tem aula', () => {
    expect(diaDaSemanaDaNoite('2026-11-16')).toBe('seg')
    expect(diaDaSemanaDaNoite('2026-11-21')).toBe('sab')
    expect(diaDaSemanaDaNoite('2026-11-22')).toBeNull()
  })

  it('a saída prevista é a faixa horária em que a última aula acaba', () => {
    expect(saidaPrevistaDaAula('21:50', FAIXAS)).toBe('21:30')
    expect(saidaPrevistaDaAula('20:40', FAIXAS)).toBe('20:30')
    expect(saidaPrevistaDaAula('22:00', FAIXAS)).toBe('22:00')
    expect(saidaPrevistaDaAula('23:30', FAIXAS)).toBe('22:30')
    expect(saidaPrevistaDaAula('16:00', FAIXAS)).toBeNull()
  })
})
