import { describe, expect, it } from 'vitest'
import { areaCoberta, criarAreaCoberta } from '.'
import type { ConfiguracaoDaAreaCoberta } from '.'

const configuracao: ConfiguracaoDaAreaCoberta = {
  provisoria: true,
  fusoHorario: 'America/Sao_Paulo',
  destino: { nome: 'Entrada de pedestres principal', ponto: { lat: -18.9, lon: -48.27 } },
  ruasCobertas: [
    { id: 'rua-a', nome: 'Rua A', trecho: { de: 'Esquina 1', ate: 'Esquina 2', meio: { lat: -18.901, lon: -48.271 }, linha: [] }, distanciaAoDestinoMetros: 300 },
    { id: 'rua-b', nome: 'Rua B', trecho: { de: 'Esquina 3', ate: 'Esquina 4', meio: { lat: -18.902, lon: -48.272 }, linha: [] }, distanciaAoDestinoMetros: 120 },
  ],
  calendarioLetivo: [
    {
      id: '2027-1',
      de: '2027-02-15',
      ate: '2027-06-30',
      diasDeAula: [1, 2, 3, 4, 5], // segunda a sexta
      provas: [{ de: '2027-04-12', ate: '2027-04-16' }],
      feriados: ['2027-04-21'],
      ferias: [{ de: '2027-03-01', ate: '2027-03-05' }],
    },
    {
      id: '2027-2',
      de: '2027-08-02',
      ate: '2027-12-10',
      diasDeAula: [1, 2, 3, 4, 5],
      provas: [],
      feriados: [],
      ferias: [],
    },
  ],
}

describe('Área coberta', () => {
  it('lista as ruas cobertas da configuração', () => {
    const area = criarAreaCoberta(configuracao)

    expect(area.ruasCobertas().map((r) => r.nome)).toEqual(['Rua A', 'Rua B'])
  })

  it('dá a distância a pé de uma rua coberta até o destino', () => {
    const area = criarAreaCoberta(configuracao)

    expect(area.distânciaAoDestino('rua-b')).toBe(120)
  })

  it('recusa uma rua que não é coberta', () => {
    const area = criarAreaCoberta(configuracao)

    expect(() => area.distânciaAoDestino('rua-z')).toThrow('rua-z')
  })

  describe('faixa horária', () => {
    const area = criarAreaCoberta(configuracao)

    it.each([
      ['2026-11-12T20:00:00Z', '17:00'], // 17h00 em Uberlândia, início da área coberta
      ['2026-11-12T22:10:00Z', '19:00'], // 19h10
      ['2026-11-12T22:30:00Z', '19:30'], // 19h30
      ['2026-11-13T01:59:00Z', '22:30'], // 22h59, última faixa horária
    ])('o instante %s cai na faixa horária %s', (instante, faixa) => {
      expect(area.faixaHorária(new Date(instante))).toBe(faixa)
    })

    it.each([
      ['2026-11-12T19:59:00Z'], // 16h59
      ['2026-11-13T02:00:00Z'], // 23h00
      ['2026-11-12T15:00:00Z'], // 12h00
    ])('o instante %s fica fora da área coberta', (instante) => {
      expect(area.faixaHorária(new Date(instante))).toBeNull()
    })

    it('lista as doze faixas horárias da área coberta, das 17h às 23h', () => {
      expect(area.faixasHorárias()).toEqual([
        '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
        '20:00', '20:30', '21:00', '21:30', '22:00', '22:30',
      ])
    })
  })

  describe('noite', () => {
    const area = criarAreaCoberta(configuracao)

    it('é a data local de Uberlândia, mesmo quando em UTC já é o dia seguinte', () => {
      // 22h30 de 12/11 em Uberlândia = 01h30 de 13/11 em UTC
      expect(area.noiteDe(new Date('2026-11-13T01:30:00Z'))).toBe('2026-11-12')
    })

    it('é a mesma para o início e o fim da área coberta', () => {
      expect(area.noiteDe(new Date('2026-11-12T20:00:00Z'))).toBe('2026-11-12')
      expect(area.noiteDe(new Date('2026-11-13T01:59:00Z'))).toBe('2026-11-12')
    })
  })

  describe('semestre', () => {
    const area = criarAreaCoberta(configuracao)

    it.each([
      ['2027-02-15', '2027-1'], // primeiro dia
      ['2027-06-30', '2027-1'], // último dia
      ['2027-09-01', '2027-2'],
    ])('a data %s pertence ao semestre %s', (data, semestre) => {
      expect(area.semestreDe(data)).toBe(semestre)
    })

    it.each([['2027-07-15'], ['2026-11-12']])('a data %s não pertence a nenhum semestre', (data) => {
      expect(area.semestreDe(data)).toBeNull()
    })
  })

  describe('dia letivo normal', () => {
    const area = criarAreaCoberta(configuracao)

    it.each([
      ['2027-02-17'], // quarta-feira de aula
      ['2027-04-19'], // segunda-feira depois da semana de provas
    ])('%s é dia letivo normal', (data) => {
      expect(area.éDiaLetivoNormal(data)).toBe(true)
    })

    it.each([
      ['2027-02-20', 'sábado'],
      ['2027-04-14', 'dia de prova'],
      ['2027-04-21', 'feriado'],
      ['2027-03-03', 'férias no meio do semestre'],
      ['2027-07-14', 'fora de qualquer semestre'],
    ])('%s não é dia letivo normal (%s)', (data) => {
      expect(area.éDiaLetivoNormal(data)).toBe(false)
    })
  })

  describe('configuração do app', () => {
    it('cobre as cinco ruas da ADR 0001, cada uma com distância até o destino', () => {
      const nomes = areaCoberta.ruasCobertas().map((r) => r.nome)

      expect(nomes).toEqual([
        'Av. Vasconcelos Costa',
        'R. Rivalino Pereira',
        'Av. Belo Horizonte',
        'R. Arlindo Teixeira',
        'R. Alexandre Marquez',
      ])
      for (const rua of areaCoberta.ruasCobertas()) {
        expect(areaCoberta.distânciaAoDestino(rua.id)).toBeGreaterThan(0)
      }
    })
  })
})
