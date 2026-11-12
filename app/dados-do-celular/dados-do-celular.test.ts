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
})
