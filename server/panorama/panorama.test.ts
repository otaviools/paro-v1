import { describe, expect, it } from 'vitest'
import { areaCoberta, criarAreaCoberta } from '../area-coberta'
import type { ConfiguracaoDaAreaCoberta } from '../area-coberta'
import { configuracaoDaAreaCoberta } from '../area-coberta/configuracao'
import type { Observação, Observações } from '../observacoes'
import { criarObservaçõesFictícias } from '../observacoes/ficticias'
import { criarPanorama } from '.'

const configuracao: ConfiguracaoDaAreaCoberta = {
  provisoria: true,
  fusoHorario: 'America/Sao_Paulo',
  destino: { nome: 'Entrada de pedestres principal', ponto: { lat: -18.9, lon: -48.27 } },
  ruasCobertas: [
    { id: 'rua-a', nome: 'Rua A', trecho: { de: 'Esquina 1', ate: 'Esquina 2', meio: { lat: -18.901, lon: -48.271 } }, distanciaAoDestinoMetros: 300 },
    { id: 'rua-b', nome: 'Rua B', trecho: { de: 'Esquina 3', ate: 'Esquina 4', meio: { lat: -18.902, lon: -48.272 } }, distanciaAoDestinoMetros: 120 },
    { id: 'rua-c', nome: 'Rua C', trecho: { de: 'Esquina 5', ate: 'Esquina 6', meio: { lat: -18.903, lon: -48.273 } }, distanciaAoDestinoMetros: 200 },
  ],
  calendarioLetivo: [
    {
      id: '2026-2',
      de: '2026-08-03',
      ate: '2026-12-11',
      diasDeAula: [1, 2, 3, 4, 5],
      provas: [],
      feriados: [],
      ferias: [],
    },
    {
      id: '2027-1',
      de: '2027-02-15',
      ate: '2027-06-30',
      diasDeAula: [1, 2, 3, 4, 5], // segunda a sexta
      provas: [{ de: '2027-04-12', ate: '2027-04-16' }],
      feriados: ['2027-04-21'],
      ferias: [{ de: '2027-03-01', ate: '2027-03-05' }],
    },
  ],
}

const area = criarAreaCoberta(configuracao)

/** Quarta-feira, 05/05/2027, 19h10 em Uberlândia: semestre 2027-1. */
const agora = new Date('2027-05-05T22:10:00Z')

/** Observação de 20 vagas na faixa horária das 19h. */
function observação(ruaCoberta: string, data: string, vagasOcupadas: number, faixaHorária = '19:00'): Observação {
  return { ruaCoberta, faixaHorária, data, totalDeVagas: 20, vagasOcupadas }
}

/** Fonte de teste que devolve sempre a mesma lista, sem filtrar pelo semestre. */
function fonte(lista: Observação[], demonstração = false): Observações {
  return {
    async doSemestre() { return lista },
    éDemonstração() { return demonstração },
  }
}

function estimativaDe(resultado: Awaited<ReturnType<ReturnType<typeof criarPanorama>['panorama']>>, rua: string) {
  return resultado.ruas.find((r) => r.rua.id === rua)!.estimativa
}

describe('Panorama da noite', () => {
  it('mostra Sem dado, e não Difícil, para uma rua com só 3 observações, todas cheias', async () => {
    const { panorama } = criarPanorama({
      areaCoberta: area,
      observações: fonte([
        observação('rua-a', '2027-02-17', 20),
        observação('rua-a', '2027-02-24', 19),
        observação('rua-a', '2027-03-10', 18),
      ]),
    })

    const resultado = await panorama('19:00', agora)

    expect(estimativaDe(resultado, 'rua-a')).toEqual({ tipo: 'sem-dado' })
  })

  it('dá a chance como o percentual das observações em que a rua não estava cheia, com a base', async () => {
    // 7 de 10 noites abaixo de 85% de ocupação: chance de 70% (ADR 0005), Tranquilo (ADR 0006).
    const { panorama } = criarPanorama({
      areaCoberta: area,
      observações: fonte([
        observação('rua-a', '2027-02-15', 10),
        observação('rua-a', '2027-02-16', 12),
        observação('rua-a', '2027-02-17', 16),
        observação('rua-a', '2027-02-18', 5),
        observação('rua-a', '2027-02-22', 14),
        observação('rua-a', '2027-02-23', 11),
        observação('rua-a', '2027-02-24', 9),
        observação('rua-a', '2027-02-25', 20),
        observação('rua-a', '2027-05-03', 19),
        observação('rua-a', '2027-03-08', 18),
      ]),
    })

    const resultado = await panorama('19:00', agora)

    expect(estimativaDe(resultado, 'rua-a')).toEqual({
      tipo: 'chance',
      faixaDeChance: 'Tranquilo',
      chance: 70,
      base: { observações: 10, última: '2027-05-03' },
    })
  })

  it.each([
    [4, 'Apertado', 40],
    [6, 'Apertado', 60],
    [3, 'Difícil', 30],
    [0, 'Difícil', 0],
  ])('com %i de 10 noites não cheias, a faixa de chance é %s, com chance de %i', async (naoCheias, faixaDeChance, chance) => {
    const ocupações = Array.from({ length: 10 }, (_, i) => (i < naoCheias ? 10 : 20))
    const { panorama } = criarPanorama({ areaCoberta: area, observações: fonte(noites('rua-a', ocupações)) })

    const resultado = await panorama('19:00', agora)

    expect(estimativaDe(resultado, 'rua-a')).toMatchObject({ tipo: 'chance', faixaDeChance, chance })
  })

  it('considera a rua cheia a partir de 85% de ocupação', async () => {
    // 17 de 20 vagas = 85% (cheia); 16 de 20 = 80% (não cheia).
    const { panorama } = criarPanorama({
      areaCoberta: area,
      observações: fonte([...noites('rua-a', [17, 17, 17, 17]), ...noites('rua-b', [16, 16, 16, 16])]),
    })

    const resultado = await panorama('19:00', agora)

    expect(estimativaDe(resultado, 'rua-a')).toMatchObject({ faixaDeChance: 'Difícil', chance: 0 })
    expect(estimativaDe(resultado, 'rua-b')).toMatchObject({ faixaDeChance: 'Tranquilo', chance: 100 })
  })

  it('mostra Sem dado quando as 4 observações caem em só 3 dias diferentes', async () => {
    const { panorama } = criarPanorama({
      areaCoberta: area,
      observações: fonte([...noites('rua-a', [10, 10, 10]), observação('rua-a', '2027-02-17', 10)]),
    })

    const resultado = await panorama('19:00', agora)

    expect(estimativaDe(resultado, 'rua-a')).toEqual({ tipo: 'sem-dado' })
  })

  it('não conta observações de prova, feriado, férias ou de outro semestre', async () => {
    const foraDoPadrão = (rua: string) => [
      observação(rua, '2027-04-14', 20), // semana de provas
      observação(rua, '2027-04-21', 20), // feriado
      observação(rua, '2027-03-03', 20), // férias no meio do semestre
      observação(rua, '2026-10-14', 20), // semestre anterior
    ]
    const { panorama } = criarPanorama({
      areaCoberta: area,
      observações: fonte([
        ...noites('rua-a', [10, 10, 10, 10]), ...foraDoPadrão('rua-a'),
        ...noites('rua-b', [10, 10, 10]), ...foraDoPadrão('rua-b'),
      ]),
    })

    const resultado = await panorama('19:00', agora)

    expect(estimativaDe(resultado, 'rua-a')).toEqual({
      tipo: 'chance',
      faixaDeChance: 'Tranquilo',
      chance: 100,
      base: { observações: 4, última: '2027-02-18' },
    })
    expect(estimativaDe(resultado, 'rua-b')).toEqual({ tipo: 'sem-dado' })
  })

  it('ordena as ruas cobertas por chance, com Sem dado no fim, cada uma com a distância ao destino', async () => {
    const { panorama } = criarPanorama({
      areaCoberta: area,
      observações: fonte([
        ...noites('rua-a', [10, 10, 20, 20]), // 50%
        ...noites('rua-c', [10, 10, 10, 20]), // 75%
      ]),
    })

    const resultado = await panorama('19:00', agora)

    expect(resultado.ruas.map((r) => [r.rua.id, r.distânciaAoDestino])).toEqual([
      ['rua-c', 200],
      ['rua-a', 300],
      ['rua-b', 120],
    ])
  })

  it('em empate de chance, põe primeiro a rua mais perto do destino', async () => {
    const { panorama } = criarPanorama({
      areaCoberta: area,
      observações: fonte([
        ...noites('rua-a', [10, 10, 10, 10]),
        ...noites('rua-b', [10, 10, 10, 10]),
        ...noites('rua-c', [10, 10, 10, 10]),
      ]),
    })

    const resultado = await panorama('19:00', agora)

    expect(resultado.ruas.map((r) => r.rua.id)).toEqual(['rua-b', 'rua-c', 'rua-a'])
  })

  describe('melhor chance', () => {
    it('é a rua coberta de maior chance', async () => {
      const { panorama } = criarPanorama({
        areaCoberta: area,
        observações: fonte([
          ...noites('rua-a', [10, 10, 20, 20]), // 50%
          ...noites('rua-b', [20, 20, 20, 10]), // 25%, a mais perto do destino
          ...noites('rua-c', [10, 10, 10, 20]), // 75%
        ]),
      })

      const resultado = await panorama('19:00', agora)

      expect(resultado.melhorChance).toEqual({
        rua: { id: 'rua-c', nome: 'Rua C' },
        estimativa: { tipo: 'chance', faixaDeChance: 'Tranquilo', chance: 75, base: { observações: 4, última: '2027-02-18' } },
        distânciaAoDestino: 200,
      })
    })

    it('em empate de chance, é a rua mais perto do destino', async () => {
      // rua-a (300 m) e rua-c (200 m) com 75%; rua-b (120 m) com 50%.
      const { panorama } = criarPanorama({
        areaCoberta: area,
        observações: fonte([
          ...noites('rua-a', [10, 10, 10, 20]),
          ...noites('rua-b', [10, 10, 20, 20]),
          ...noites('rua-c', [20, 10, 10, 10]),
        ]),
      })

      const resultado = await panorama('19:00', agora)

      expect(resultado.melhorChance?.rua.id).toBe('rua-c')
    })

    it('deixa de fora as ruas Sem dado, mesmo que a única com chance seja Difícil', async () => {
      // rua-b, a mais perto do destino, e rua-c têm só 3 observações, todas livres.
      const { panorama } = criarPanorama({
        areaCoberta: area,
        observações: fonte([
          ...noites('rua-a', [20, 20, 20, 20]), // 0%
          ...noites('rua-b', [10, 10, 10]),
          ...noites('rua-c', [10, 10, 10]),
        ]),
      })

      const resultado = await panorama('19:00', agora)

      expect(resultado.melhorChance?.rua.id).toBe('rua-a')
    })

    it('existe com o rótulo Difícil quando todas as ruas estão Difícil', async () => {
      const { panorama } = criarPanorama({
        areaCoberta: area,
        observações: fonte([
          ...noites('rua-a', [20, 20, 20, 20]), // 0%
          ...noites('rua-b', [20, 20, 20, 20]), // 0%
          ...noites('rua-c', [10, 20, 20, 20]), // 25%
        ]),
      })

      const resultado = await panorama('19:00', agora)

      expect(resultado.melhorChance).toMatchObject({
        rua: { id: 'rua-c' },
        estimativa: { faixaDeChance: 'Difícil', chance: 25 },
      })
    })

    it('não existe quando todas as ruas estão Sem dado', async () => {
      const { panorama } = criarPanorama({
        areaCoberta: area,
        observações: fonte([...noites('rua-a', [10, 10, 10]), ...noites('rua-b', [10])]),
      })

      const resultado = await panorama('19:00', agora)

      expect(resultado.melhorChance).toBeNull()
    })

    it('não existe em "agora", fora da área coberta', async () => {
      const { panorama } = criarPanorama({ areaCoberta: area, observações: fonte(noites('rua-a', [10, 10, 10, 10])) })

      const resultado = await panorama('agora', new Date('2027-05-05T18:00:00Z')) // 15h00

      expect(resultado.melhorChance).toBeNull()
    })
  })

  it('em "agora", usa a faixa horária do instante', async () => {
    const { panorama } = criarPanorama({
      areaCoberta: area,
      observações: fonte([
        ...noites('rua-a', [10, 10, 10, 10]),
        observação('rua-b', '2027-02-15', 10, '21:00'),
      ]),
    })

    const resultado = await panorama('agora', agora) // 19h10

    expect(resultado.faixaHorária).toBe('19:00')
    expect(estimativaDe(resultado, 'rua-a')).toMatchObject({ faixaDeChance: 'Tranquilo' })
  })

  it('em "agora", fora da área coberta, não mostra nenhuma rua', async () => {
    const { panorama } = criarPanorama({ areaCoberta: area, observações: fonte(noites('rua-a', [10, 10, 10, 10])) })

    const resultado = await panorama('agora', new Date('2027-05-05T18:00:00Z')) // 15h00

    expect(resultado.faixaHorária).toBeNull()
    expect(resultado.ruas).toEqual([])
  })

  it('recusa uma faixa horária fora da área coberta', async () => {
    const { panorama } = criarPanorama({ areaCoberta: area, observações: fonte([]) })

    await expect(panorama('23:00', agora)).rejects.toThrow('23:00')
  })

  describe('com a fonte de observações fictícias', () => {
    /** Quinta-feira, 12/11/2026, 19h10 em Uberlândia. */
    const agoraNaDemonstração = new Date('2026-11-12T22:10:00Z')

    it('indica que a chance é de demonstração', async () => {
      const { panorama } = criarPanorama({
        areaCoberta,
        observações: criarObservaçõesFictícias(configuracaoDaAreaCoberta),
      })

      const resultado = await panorama('19:00', agoraNaDemonstração)

      expect(resultado.demonstração).toBe(true)
    })

    it.each(areaCoberta.faixasHorárias())('na faixa horária %s, mostra Tranquilo, Apertado, Difícil e Sem dado', async (faixaHorária) => {
      const { panorama } = criarPanorama({
        areaCoberta,
        observações: criarObservaçõesFictícias(configuracaoDaAreaCoberta),
      })

      const resultado = await panorama(faixaHorária, agoraNaDemonstração)

      const estados = new Set(resultado.ruas.map(({ estimativa: e }) => (e.tipo === 'chance' ? e.faixaDeChance : 'Sem dado')))
      expect(estados).toEqual(new Set(['Tranquilo', 'Apertado', 'Difícil', 'Sem dado']))
    })

    it('gera sempre as mesmas observações fictícias', async () => {
      const primeira = await criarObservaçõesFictícias(configuracaoDaAreaCoberta).doSemestre('2027-1')
      const segunda = await criarObservaçõesFictícias(configuracaoDaAreaCoberta).doSemestre('2027-1')

      expect(primeira.length).toBeGreaterThan(0)
      expect(segunda).toEqual(primeira)
    })
  })

  it('com uma fonte de observações reais, não indica demonstração', async () => {
    const { panorama } = criarPanorama({ areaCoberta: area, observações: fonte([], false) })

    const resultado = await panorama('19:00', agora)

    expect(resultado.demonstração).toBe(false)
  })

  it('usa os cortes das faixas de chance da configuração', async () => {
    // Com cortes de 80% e 50%, 7 de 10 noites (70%) passa a ser Apertado.
    const { panorama } = criarPanorama({
      areaCoberta: area,
      observações: fonte(noites('rua-a', [10, 10, 10, 10, 10, 10, 10, 20, 20, 20])),
      chance: { ocupaçãoDeRuaCheia: 85, mínimoDeObservações: 4, cortes: { tranquilo: 80, apertado: 50 } },
    })

    const resultado = await panorama('19:00', agora)

    expect(estimativaDe(resultado, 'rua-a')).toMatchObject({ faixaDeChance: 'Apertado', chance: 70 })
  })
})

/** Dias letivos normais do semestre 2027-1, todos antes de `agora`. */
const diasLetivosNormais = [
  '2027-02-15', '2027-02-16', '2027-02-17', '2027-02-18', '2027-02-19',
  '2027-02-22', '2027-02-23', '2027-02-24', '2027-02-25', '2027-02-26',
]

/** Uma observação por dia letivo normal, com as vagas ocupadas dadas (de 20). */
function noites(ruaCoberta: string, vagasOcupadas: number[]): Observação[] {
  return vagasOcupadas.map((ocupadas, i) => observação(ruaCoberta, diasLetivosNormais[i]!, ocupadas))
}
