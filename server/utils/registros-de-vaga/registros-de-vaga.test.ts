import { beforeEach, describe, expect, it } from 'vitest'
import { criarAreaCoberta } from '#shared/utils/area-coberta'
import type { ConfiguracaoDaAreaCoberta } from '#shared/utils/area-coberta'
import { criarBancoDeTeste } from '../../testes/banco-de-teste'
import { CodigoRecusado, criarRegistrosDeVaga, RegistroInvalido } from '.'

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
    await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '21:30' }, agora)

    expect(await registros.saidasPrevistas(noite)).toEqual([
      { ruaCoberta: 'rua-a', faixaHoraria: '21:30', quantidade: 1 },
    ])
  })

  it('depois de mudar a saída, conta o registro só na nova faixa horária', async () => {
    const { codigo } = await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '21:30' }, agora)

    await registros.alterarSaida(codigo, '22:00', agora)

    expect(await registros.saidasPrevistas(noite)).toEqual([
      { ruaCoberta: 'rua-a', faixaHoraria: '22:00', quantidade: 1 },
    ])
  })

  it('depois do "Saí", tira o registro da contagem e mantém os outros', async () => {
    const { codigo } = await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '21:30' }, agora)
    await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '21:30' }, agora)

    await registros.encerrar(codigo, agora)

    expect(await registros.saidasPrevistas(noite)).toEqual([
      { ruaCoberta: 'rua-a', faixaHoraria: '21:30', quantidade: 1 },
    ])
  })

  it('com a chegada em "agora", usa a faixa horária e a noite do instante', async () => {
    const registrado = await registros.registrar({ ruaCoberta: 'rua-a', chegada: 'agora', saidaPrevista: '21:30' }, agora)

    expect(registrado).toMatchObject({ chegada: '19:00', noite: '2027-05-05' })
  })

  describe('recusa o registro', () => {
    it.each([
      ['numa rua que não é coberta', { ruaCoberta: 'rua-z', chegada: '19:00', saidaPrevista: '21:30' }],
      ['com a saída prevista antes da chegada', { ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '18:30' }],
      ['com a saída prevista fora da área coberta', { ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '23:00' }],
      ['com a chegada fora da área coberta', { ruaCoberta: 'rua-a', chegada: '16:30', saidaPrevista: '21:30' }],
    ])('%s', async (_, registro) => {
      await expect(registros.registrar(registro, agora)).rejects.toThrow(RegistroInvalido)
      expect(await registros.saidasPrevistas(noite)).toEqual([])
    })

    it('com a chegada em "agora", fora da área coberta', async () => {
      /** 05/05/2027, 23h10 em Uberlândia. */
      const depoisDas23h = new Date('2027-05-06T02:10:00Z')

      await expect(registros.registrar({ ruaCoberta: 'rua-a', chegada: 'agora', saidaPrevista: '22:30' }, depoisDas23h))
        .rejects.toThrow(RegistroInvalido)
    })
  })

  it('recusa mudar a saída para antes da chegada, e o registro continua como estava', async () => {
    const { codigo } = await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '21:30' }, agora)

    await expect(registros.alterarSaida(codigo, '18:30', agora)).rejects.toThrow(RegistroInvalido)
    expect(await registros.saidasPrevistas(noite)).toEqual([
      { ruaCoberta: 'rua-a', faixaHoraria: '21:30', quantidade: 1 },
    ])
  })

  it('recusa mudar a saída para uma faixa horária que já passou', async () => {
    const { codigo } = await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '22:00' }, agora)
    /** 05/05/2027, 21h10 em Uberlândia. */
    const as21h10 = new Date('2027-05-06T00:10:00Z')

    await expect(registros.alterarSaida(codigo, '20:00', as21h10)).rejects.toThrow(RegistroInvalido)
    await registros.alterarSaida(codigo, '21:00', as21h10)
    expect(await registros.saidasPrevistas(noite)).toEqual([
      { ruaCoberta: 'rua-a', faixaHoraria: '21:00', quantidade: 1 },
    ])
  })

  describe('código', () => {
    it('recusa um código que não é de nenhum registro', async () => {
      await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '21:30' }, agora)

      await expect(registros.alterarSaida('codigo-inventado', '22:00', agora)).rejects.toThrow(CodigoRecusado)
      await expect(registros.encerrar('codigo-inventado', agora)).rejects.toThrow(CodigoRecusado)
      expect(await registros.saidasPrevistas(noite)).toEqual([
        { ruaCoberta: 'rua-a', faixaHoraria: '21:30', quantidade: 1 },
      ])
    })

    it('é de uso único: depois do "Saí", não muda nem encerra mais nada', async () => {
      const { codigo } = await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '21:30' }, agora)
      await registros.encerrar(codigo, agora)

      await expect(registros.alterarSaida(codigo, '22:00', agora)).rejects.toThrow(CodigoRecusado)
      await expect(registros.encerrar(codigo, agora)).rejects.toThrow(CodigoRecusado)
      expect(await registros.saidasPrevistas(noite)).toEqual([])
    })

    it('expira no fim da noite: na noite seguinte, é recusado', async () => {
      const { codigo } = await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '21:30' }, agora)
      /** Quinta-feira, 06/05/2027, 19h10 em Uberlândia. */
      const noiteSeguinte = new Date('2027-05-06T22:10:00Z')

      await expect(registros.alterarSaida(codigo, '22:00', noiteSeguinte)).rejects.toThrow(CodigoRecusado)
      await expect(registros.encerrar(codigo, noiteSeguinte)).rejects.toThrow(CodigoRecusado)
    })

    it('vale só para o próprio registro', async () => {
      const primeiro = await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '21:30' }, agora)
      const segundo = await registros.registrar({ ruaCoberta: 'rua-b', chegada: '19:00', saidaPrevista: '21:30' }, agora)

      await registros.encerrar(segundo.codigo, agora)

      expect(primeiro.codigo).not.toBe(segundo.codigo)
      expect(await registros.saidasPrevistas(noite)).toEqual([
        { ruaCoberta: 'rua-a', faixaHoraria: '21:30', quantidade: 1 },
      ])
    })
  })

  describe('fechar a noite', () => {
    it('grava o total de registros por rua coberta e faixa horária de chegada, encerrados incluídos', async () => {
      await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '21:30' }, agora)
      await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '22:00' }, agora)
      const { codigo } = await registros.registrar({ ruaCoberta: 'rua-b', chegada: '18:30', saidaPrevista: '21:30' }, agora)
      await registros.encerrar(codigo, agora)

      await registros.fecharNoite(noite)

      expect(await registros.totaisDaNoite(noite)).toEqual([
        { ruaCoberta: 'rua-a', faixaHoraria: '19:00', quantidade: 2 },
        { ruaCoberta: 'rua-b', faixaHoraria: '18:30', quantidade: 1 },
      ])
    })

    it('apaga os registros da noite, e as saídas previstas dela ficam vazias', async () => {
      await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '21:30' }, agora)

      await registros.fecharNoite(noite)

      expect(await registros.saidasPrevistas(noite)).toEqual([])
    })

    it('recusa o código de um registro da noite fechada, no alterar saída e no "Saí"', async () => {
      const { codigo } = await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '21:30' }, agora)

      await registros.fecharNoite(noite)

      await expect(registros.alterarSaida(codigo, '22:00', agora)).rejects.toThrow(CodigoRecusado)
      await expect(registros.encerrar(codigo, agora)).rejects.toThrow(CodigoRecusado)
    })

    it('não duplica os totais quando a mesma noite é fechada duas vezes', async () => {
      await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '21:30' }, agora)

      await registros.fecharNoite(noite)
      await registros.fecharNoite(noite)

      expect(await registros.totaisDaNoite(noite)).toEqual([
        { ruaCoberta: 'rua-a', faixaHoraria: '19:00', quantidade: 1 },
      ])
    })

    it('não mexe nos registros de outras noites', async () => {
      await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '21:30' }, agora)

      await registros.fecharNoite('2027-05-04')

      expect(await registros.totaisDaNoite('2027-05-04')).toEqual([])
      expect(await registros.saidasPrevistas(noite)).toEqual([
        { ruaCoberta: 'rua-a', faixaHoraria: '21:30', quantidade: 1 },
      ])
    })

    it('fecha as noites anteriores ainda abertas e deixa a noite de agora aberta', async () => {
      /** Segunda-feira, 03/05/2027, 19h10 em Uberlândia. */
      const segunda = new Date('2027-05-03T22:10:00Z')
      /** Terça-feira, 04/05/2027, 19h10 em Uberlândia. */
      const terca = new Date('2027-05-04T22:10:00Z')
      await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '21:30' }, segunda)
      await registros.registrar({ ruaCoberta: 'rua-b', chegada: '19:00', saidaPrevista: '21:30' }, terca)
      await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '21:30' }, agora)

      expect(await registros.fecharNoitesAnteriores(agora)).toEqual(['2027-05-03', '2027-05-04'])

      expect(await registros.totaisDaNoite('2027-05-03')).toEqual([{ ruaCoberta: 'rua-a', faixaHoraria: '19:00', quantidade: 1 }])
      expect(await registros.totaisDaNoite('2027-05-04')).toEqual([{ ruaCoberta: 'rua-b', faixaHoraria: '19:00', quantidade: 1 }])
      expect(await registros.totaisDaNoite(noite)).toEqual([])
      expect(await registros.saidasPrevistas(noite)).toEqual([
        { ruaCoberta: 'rua-a', faixaHoraria: '21:30', quantidade: 1 },
      ])
    })

    it('na madrugada, depois das 23h, fecha a noite que acabou', async () => {
      await registros.registrar({ ruaCoberta: 'rua-a', chegada: '19:00', saidaPrevista: '21:30' }, agora)
      /** Quinta-feira, 06/05/2027, 0h30 em Uberlândia (3h30 em UTC). */
      const madrugada = new Date('2027-05-06T03:30:00Z')

      expect(await registros.fecharNoitesAnteriores(madrugada)).toEqual([noite])
      expect(await registros.saidasPrevistas(noite)).toEqual([])
    })
  })
})
