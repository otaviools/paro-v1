import { describe, expect, it } from 'vitest'
import { armazenamentoEmMemória, criarDadosDoCelular } from '.'

describe('Dados do celular', () => {
  describe('rotina', () => {
    it('não existe antes de a pessoa escolher', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemória())

      expect(dados.rotina()).toBeNull()
    })

    it('é a faixa horária de chegada que a pessoa escolheu', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemória())

      dados.definirRotina('18:30')

      expect(dados.rotina()).toBe('18:30')
    })

    it('continua guardada no aparelho quando o app abre de novo', () => {
      const aparelho = armazenamentoEmMemória()
      criarDadosDoCelular(aparelho).definirRotina('19:00')

      const reaberto = criarDadosDoCelular(aparelho)

      expect(reaberto.rotina()).toBe('19:00')
    })

    it('some quando a pessoa tira a rotina', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemória())
      dados.definirRotina('19:00')

      dados.definirRotina(null)

      expect(dados.rotina()).toBeNull()
    })
  })

  describe('registro de vaga atual', () => {
    const registro = {
      código: 'codigo-do-servidor',
      noite: '2027-05-05',
      ruaCoberta: { id: 'rua-a', nome: 'Rua A' },
      chegada: '19:00',
      saídaPrevista: '21:30',
    }

    it('guarda o código do registro, que continua no aparelho quando o app abre de novo', () => {
      const aparelho = armazenamentoEmMemória()
      criarDadosDoCelular(aparelho).guardarRegistro(registro)

      const reaberto = criarDadosDoCelular(aparelho)

      expect(reaberto.registroAtual('2027-05-05')).toEqual(registro)
    })

    it('não existe antes de registrar', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemória())

      expect(dados.registroAtual('2027-05-05')).toBeNull()
    })

    it('vale só na noite do registro: na noite seguinte, o código expirou e some do aparelho', () => {
      const aparelho = armazenamentoEmMemória()
      const dados = criarDadosDoCelular(aparelho)
      dados.guardarRegistro(registro)

      expect(dados.registroAtual('2027-05-06')).toBeNull()
      expect(dados.registroAtual('2027-05-05')).toBeNull()
    })

    it('guarda a nova saída prevista depois de mudar a saída', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemória())
      dados.guardarRegistro(registro)

      dados.mudarSaídaDoRegistro('22:00')

      expect(dados.registroAtual('2027-05-05')).toEqual({ ...registro, saídaPrevista: '22:00' })
    })

    it('some do aparelho depois do "Saí", com o código', () => {
      const aparelho = armazenamentoEmMemória()
      criarDadosDoCelular(aparelho).guardarRegistro(registro)

      criarDadosDoCelular(aparelho).apagarRegistro()

      expect(criarDadosDoCelular(aparelho).registroAtual('2027-05-05')).toBeNull()
    })
  })

  describe('ponto do carro', () => {
    const registro = {
      código: 'codigo-do-servidor',
      noite: '2027-05-05',
      ruaCoberta: { id: 'rua-a', nome: 'Rua A' },
      chegada: '19:00',
      saídaPrevista: '21:30',
    }
    const ponto = { lat: -18.912858, lon: -48.279568 }

    it('fica no aparelho no registro com localização ligada, mesmo quando o app abre de novo', () => {
      const aparelho = armazenamentoEmMemória()
      criarDadosDoCelular(aparelho).guardarRegistro(registro, ponto)

      const reaberto = criarDadosDoCelular(aparelho)

      expect(reaberto.pontoDoCarro('2027-05-05')).toEqual(ponto)
    })

    it('não existe no registro manual', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemória())

      dados.guardarRegistro(registro)

      expect(dados.registroAtual('2027-05-05')).toEqual(registro)
      expect(dados.pontoDoCarro('2027-05-05')).toBeNull()
    })

    it('não passa para o registro manual seguinte, mesmo vindo de um registro com localização', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemória())
      dados.guardarRegistro(registro, ponto)

      dados.guardarRegistro({ ...registro, código: 'outro-codigo', noite: '2027-05-06' })

      expect(dados.pontoDoCarro('2027-05-06')).toBeNull()
    })

    it('é apagado do aparelho no "Saí"', () => {
      const aparelho = armazenamentoEmMemória()
      criarDadosDoCelular(aparelho).guardarRegistro(registro, ponto)

      criarDadosDoCelular(aparelho).apagarRegistro()

      expect(criarDadosDoCelular(aparelho).pontoDoCarro('2027-05-05')).toBeNull()
    })

    it('some com o registro na noite seguinte, sem precisar do "Saí"', () => {
      const aparelho = armazenamentoEmMemória()
      criarDadosDoCelular(aparelho).guardarRegistro(registro, ponto)

      const naNoiteSeguinte = criarDadosDoCelular(aparelho)

      expect(naNoiteSeguinte.pontoDoCarro('2027-05-06')).toBeNull()
      expect(naNoiteSeguinte.pontoDoCarro('2027-05-05')).toBeNull()
    })
  })
})
