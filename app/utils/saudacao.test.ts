import { describe, expect, it } from 'vitest'
import { LIMITE_DO_APELIDO, NOMES_ENGRACADOS, saudacaoDoHorario, sortearNomeEngracado } from './saudacao'

describe('Saudação do Início', () => {
  it('é bom dia das 5h às 11h59', () => {
    expect(saudacaoDoHorario(5)).toBe('Bom dia')
    expect(saudacaoDoHorario(11)).toBe('Bom dia')
  })

  it('é boa tarde do meio-dia às 17h59', () => {
    expect(saudacaoDoHorario(12)).toBe('Boa tarde')
    expect(saudacaoDoHorario(17)).toBe('Boa tarde')
  })

  it('é boa noite das 18h às 4h59', () => {
    expect(saudacaoDoHorario(18)).toBe('Boa noite')
    expect(saudacaoDoHorario(23)).toBe('Boa noite')
    expect(saudacaoDoHorario(0)).toBe('Boa noite')
    expect(saudacaoDoHorario(4)).toBe('Boa noite')
  })
})

describe('Nome engraçado de quem busca vaga', () => {
  it('sorteia um nome da lista', () => {
    expect(sortearNomeEngracado(() => 0)).toBe(NOMES_ENGRACADOS[0])
    expect(sortearNomeEngracado(() => 0.9999)).toBe(NOMES_ENGRACADOS.at(-1))
  })

  it('nenhum apelido passa do limite que cabe numa linha do título', () => {
    const longos = NOMES_ENGRACADOS.filter(nome => nome.length > LIMITE_DO_APELIDO)
    expect(longos).toEqual([])
  })

  it('a lista não tem nomes repetidos', () => {
    expect(new Set(NOMES_ENGRACADOS).size).toBe(NOMES_ENGRACADOS.length)
  })
})
