import { beforeEach, describe, expect, it } from 'vitest'
import { criarAreaCoberta } from '../area-coberta'
import type { ConfiguracaoDaAreaCoberta } from '../area-coberta'
import { criarBancoDeTeste } from '../banco/teste'
import { CódigoRecusado, criarRegistrosDeVaga, RegistroInválido } from '.'

const configuracao: ConfiguracaoDaAreaCoberta = {
  provisoria: true,
  fusoHorario: 'America/Sao_Paulo',
  destino: { nome: 'Entrada de pedestres principal', ponto: { lat: -18.9, lon: -48.27 } },
  ruasCobertas: [
    { id: 'rua-a', nome: 'Rua A', trecho: { de: 'Esquina 1', ate: 'Esquina 2', meio: { lat: -18.901, lon: -48.271 }, linha: [] }, distanciaAoDestinoMetros: 300 },
    { id: 'rua-b', nome: 'Rua B', trecho: { de: 'Esquina 3', ate: 'Esquina 4', meio: { lat: -18.902, lon: -48.272 }, linha: [] }, distanciaAoDestinoMetros: 120 },
  ],
  calendarioLetivo: [],
}

/** Quarta-feira, 05/05/2027, 19h10 em Uberlândia (UTC-3). */
const agora = new Date('2027-05-05T22:10:00Z')
const noite = '2027-05-05'

let registros: ReturnType<typeof criarRegistrosDeVaga>

beforeEach(async () => {
  registros = criarRegistrosDeVaga({ banco: await criarBancoDeTeste(), areaCoberta: criarAreaCoberta(configuracao) })
})

describe('Registros de vaga', () => {
  it('conta a saída prevista de um registro na rua coberta e na faixa horária informadas', async () => {
    await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saídaPrevista: '21:30' }, agora)

    expect(await registros.saídasPrevistas(noite)).toEqual([
      { ruaCoberta: 'rua-a', faixaHorária: '21:30', quantidade: 1 },
    ])
  })

  it('depois de mudar a saída, conta o registro só na nova faixa horária', async () => {
    const { código } = await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saídaPrevista: '21:30' }, agora)

    await registros.alterarSaída(código, '22:00', agora)

    expect(await registros.saídasPrevistas(noite)).toEqual([
      { ruaCoberta: 'rua-a', faixaHorária: '22:00', quantidade: 1 },
    ])
  })

  it('depois do "Saí", tira o registro da contagem e mantém os outros', async () => {
    const { código } = await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saídaPrevista: '21:30' }, agora)
    await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saídaPrevista: '21:30' }, agora)

    await registros.encerrar(código, agora)

    expect(await registros.saídasPrevistas(noite)).toEqual([
      { ruaCoberta: 'rua-a', faixaHorária: '21:30', quantidade: 1 },
    ])
  })

  it('com a chegada em "agora", usa a faixa horária e a noite do instante', async () => {
    const registrado = await registros.registrar({ ruaCoberta: 'rua-a', chegada: 'agora', saídaPrevista: '21:30' }, agora)

    expect(registrado).toMatchObject({ chegada: '19:00', noite: '2027-05-05' })
  })

  describe('recusa o registro', () => {
    it.each([
      ['numa rua que não é coberta', { ruaCoberta: 'rua-z', chegada: '19:00', saídaPrevista: '21:30' }],
      ['com a saída prevista antes da chegada', { ruaCoberta: 'rua-a', chegada: '19:00', saídaPrevista: '18:30' }],
      ['com a saída prevista fora da área coberta', { ruaCoberta: 'rua-a', chegada: '19:00', saídaPrevista: '23:00' }],
      ['com a chegada fora da área coberta', { ruaCoberta: 'rua-a', chegada: '16:30', saídaPrevista: '21:30' }],
    ])('%s', async (_, registro) => {
      await expect(registros.registrar(registro, agora)).rejects.toThrow(RegistroInválido)
      expect(await registros.saídasPrevistas(noite)).toEqual([])
    })

    it('com a chegada em "agora", fora da área coberta', async () => {
      /** 05/05/2027, 23h10 em Uberlândia. */
      const depoisDas23h = new Date('2027-05-06T02:10:00Z')

      await expect(registros.registrar({ ruaCoberta: 'rua-a', chegada: 'agora', saídaPrevista: '22:30' }, depoisDas23h))
        .rejects.toThrow(RegistroInválido)
    })
  })

  it('recusa mudar a saída para antes da chegada, e o registro continua como estava', async () => {
    const { código } = await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saídaPrevista: '21:30' }, agora)

    await expect(registros.alterarSaída(código, '18:30', agora)).rejects.toThrow(RegistroInválido)
    expect(await registros.saídasPrevistas(noite)).toEqual([
      { ruaCoberta: 'rua-a', faixaHorária: '21:30', quantidade: 1 },
    ])
  })

  it('recusa mudar a saída para uma faixa horária que já passou', async () => {
    const { código } = await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saídaPrevista: '22:00' }, agora)
    /** 05/05/2027, 21h10 em Uberlândia. */
    const às21h10 = new Date('2027-05-06T00:10:00Z')

    await expect(registros.alterarSaída(código, '20:00', às21h10)).rejects.toThrow(RegistroInválido)
    await registros.alterarSaída(código, '21:00', às21h10)
    expect(await registros.saídasPrevistas(noite)).toEqual([
      { ruaCoberta: 'rua-a', faixaHorária: '21:00', quantidade: 1 },
    ])
  })

  describe('código', () => {
    it('recusa um código que não é de nenhum registro', async () => {
      await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saídaPrevista: '21:30' }, agora)

      await expect(registros.alterarSaída('codigo-inventado', '22:00', agora)).rejects.toThrow(CódigoRecusado)
      await expect(registros.encerrar('codigo-inventado', agora)).rejects.toThrow(CódigoRecusado)
      expect(await registros.saídasPrevistas(noite)).toEqual([
        { ruaCoberta: 'rua-a', faixaHorária: '21:30', quantidade: 1 },
      ])
    })

    it('é de uso único: depois do "Saí", não muda nem encerra mais nada', async () => {
      const { código } = await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saídaPrevista: '21:30' }, agora)
      await registros.encerrar(código, agora)

      await expect(registros.alterarSaída(código, '22:00', agora)).rejects.toThrow(CódigoRecusado)
      await expect(registros.encerrar(código, agora)).rejects.toThrow(CódigoRecusado)
      expect(await registros.saídasPrevistas(noite)).toEqual([])
    })

    it('expira no fim da noite: na noite seguinte, é recusado', async () => {
      const { código } = await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saídaPrevista: '21:30' }, agora)
      /** Quinta-feira, 06/05/2027, 19h10 em Uberlândia. */
      const noiteSeguinte = new Date('2027-05-06T22:10:00Z')

      await expect(registros.alterarSaída(código, '22:00', noiteSeguinte)).rejects.toThrow(CódigoRecusado)
      await expect(registros.encerrar(código, noiteSeguinte)).rejects.toThrow(CódigoRecusado)
    })

    it('vale só para o próprio registro', async () => {
      const primeiro = await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saídaPrevista: '21:30' }, agora)
      const segundo = await registros.registrar({ ruaCoberta: 'rua-b', chegada: '19:00', saídaPrevista: '21:30' }, agora)

      await registros.encerrar(segundo.código, agora)

      expect(primeiro.código).not.toBe(segundo.código)
      expect(await registros.saídasPrevistas(noite)).toEqual([
        { ruaCoberta: 'rua-a', faixaHorária: '21:30', quantidade: 1 },
      ])
    })
  })
})
