import { describe, expect, it } from 'vitest'
import { armazenamentoEmMemoria, criarDadosDoCelular } from '.'

describe('Dados do celular', () => {
  describe('rotina', () => {
    it('não existe antes de a pessoa escolher', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())

      expect(dados.rotina()).toBeNull()
    })

    it('é a faixa horária de chegada que a pessoa escolheu', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())

      dados.definirRotina('18:30')

      expect(dados.rotina()).toBe('18:30')
    })

    it('continua guardada no aparelho quando o app abre de novo', () => {
      const aparelho = armazenamentoEmMemoria()
      criarDadosDoCelular(aparelho).definirRotina('19:00')

      const reaberto = criarDadosDoCelular(aparelho)

      expect(reaberto.rotina()).toBe('19:00')
    })

    it('some quando a pessoa tira a rotina', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())
      dados.definirRotina('19:00')

      dados.definirRotina(null)

      expect(dados.rotina()).toBeNull()
    })
  })

  describe('registro de vaga atual', () => {
    const registro = {
      codigo: 'codigo-do-servidor',
      noite: '2027-05-05',
      ruaCoberta: { id: 'rua-a', nome: 'Rua A' },
      chegada: '19:00',
      saidaPrevista: '21:30',
    }

    it('guarda o código do registro, que continua no aparelho quando o app abre de novo', () => {
      const aparelho = armazenamentoEmMemoria()
      criarDadosDoCelular(aparelho).guardarRegistro(registro)

      const reaberto = criarDadosDoCelular(aparelho)

      expect(reaberto.registroAtual('2027-05-05')).toEqual(registro)
    })

    it('não existe antes de registrar', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())

      expect(dados.registroAtual('2027-05-05')).toBeNull()
    })

    it('vale só na noite do registro: na noite seguinte, o código expirou e some do aparelho', () => {
      const aparelho = armazenamentoEmMemoria()
      const dados = criarDadosDoCelular(aparelho)
      dados.guardarRegistro(registro)

      expect(dados.registroAtual('2027-05-06')).toBeNull()
      expect(dados.registroAtual('2027-05-05')).toBeNull()
    })

    it('guarda a nova saída prevista depois de mudar a saída', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())
      dados.guardarRegistro(registro)

      dados.mudarSaidaDoRegistro('22:00')

      expect(dados.registroAtual('2027-05-05')).toEqual({ ...registro, saidaPrevista: '22:00' })
    })

    it('some do aparelho depois do "Saí", com o código', () => {
      const aparelho = armazenamentoEmMemoria()
      criarDadosDoCelular(aparelho).guardarRegistro(registro)

      criarDadosDoCelular(aparelho).encerrarRegistro('21:00')

      expect(criarDadosDoCelular(aparelho).registroAtual('2027-05-05')).toBeNull()
    })
  })

  describe('ponto do carro', () => {
    const registro = {
      codigo: 'codigo-do-servidor',
      noite: '2027-05-05',
      ruaCoberta: { id: 'rua-a', nome: 'Rua A' },
      chegada: '19:00',
      saidaPrevista: '21:30',
    }
    const ponto = { lat: -18.912858, lon: -48.279568 }

    it('fica no aparelho no registro com localização ligada, mesmo quando o app abre de novo', () => {
      const aparelho = armazenamentoEmMemoria()
      criarDadosDoCelular(aparelho).guardarRegistro(registro, ponto)

      const reaberto = criarDadosDoCelular(aparelho)

      expect(reaberto.pontoDoCarro('2027-05-05')).toEqual(ponto)
    })

    it('não existe no registro manual', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())

      dados.guardarRegistro(registro)

      expect(dados.registroAtual('2027-05-05')).toEqual(registro)
      expect(dados.pontoDoCarro('2027-05-05')).toBeNull()
    })

    it('não passa para o registro manual seguinte, mesmo vindo de um registro com localização', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())
      dados.guardarRegistro(registro, ponto)

      dados.guardarRegistro({ ...registro, codigo: 'outro-codigo', noite: '2027-05-06' })

      expect(dados.pontoDoCarro('2027-05-06')).toBeNull()
    })

    it('é apagado do aparelho no "Saí"', () => {
      const aparelho = armazenamentoEmMemoria()
      criarDadosDoCelular(aparelho).guardarRegistro(registro, ponto)

      criarDadosDoCelular(aparelho).encerrarRegistro('21:00')

      expect(criarDadosDoCelular(aparelho).pontoDoCarro('2027-05-05')).toBeNull()
    })

    it('some com o registro na noite seguinte, sem precisar do "Saí"', () => {
      const aparelho = armazenamentoEmMemoria()
      criarDadosDoCelular(aparelho).guardarRegistro(registro, ponto)

      const naNoiteSeguinte = criarDadosDoCelular(aparelho)

      expect(naNoiteSeguinte.pontoDoCarro('2027-05-06')).toBeNull()
      expect(naNoiteSeguinte.pontoDoCarro('2027-05-05')).toBeNull()
    })
  })

  describe('forma de colaborar', () => {
    it('começa desligada: nenhuma, antes de a pessoa escolher', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())

      expect(dados.formaDeColaborar()).toBe('nenhuma')
    })

    it('é a forma que a pessoa escolheu, e continua guardada quando o app abre de novo', () => {
      const aparelho = armazenamentoEmMemoria()
      criarDadosDoCelular(aparelho).definirFormaDeColaborar('manual')

      const reaberto = criarDadosDoCelular(aparelho)

      expect(reaberto.formaDeColaborar()).toBe('manual')
    })

    it('volta a desligada quando a pessoa desliga a colaboração em Ajustes', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())
      dados.definirFormaDeColaborar('localizacao-ligada')

      dados.definirFormaDeColaborar('nenhuma')

      expect(dados.formaDeColaborar()).toBe('nenhuma')
    })
  })

  describe('primeira visita', () => {
    it('ainda não aconteceu num aparelho novo', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())

      expect(dados.primeiraVisitaConcluida()).toBe(false)
    })

    it('aparece só uma vez: depois de concluída, continua concluída quando o app abre de novo', () => {
      const aparelho = armazenamentoEmMemoria()
      criarDadosDoCelular(aparelho).concluirPrimeiraVisita()

      const reaberto = criarDadosDoCelular(aparelho)

      expect(reaberto.primeiraVisitaConcluida()).toBe(true)
    })
  })

  describe('grade horária', () => {
    const grade = { seg: { inicio: '19:00', fim: '21:50' }, qua: { inicio: '19:00', fim: '20:40' } }

    it('não existe antes de importar', () => {
      expect(criarDadosDoCelular(armazenamentoEmMemoria()).gradeHoraria()).toBeNull()
    })

    it('fica no aparelho quando o app abre de novo', () => {
      const aparelho = armazenamentoEmMemoria()
      criarDadosDoCelular(aparelho).definirGradeHoraria(grade)

      expect(criarDadosDoCelular(aparelho).gradeHoraria()).toEqual(grade)
    })

    it('substitui a rotina de um horário só', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())
      dados.definirRotina('19:00')

      dados.definirGradeHoraria(grade)

      expect(dados.rotina()).toBeNull()
    })

    it('sai do aparelho quando a pessoa remove a grade', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())
      dados.definirGradeHoraria(grade)

      dados.definirGradeHoraria(null)

      expect(dados.gradeHoraria()).toBeNull()
    })

    it('ignora dias guardados fora da noite ou estragados', () => {
      const aparelho = armazenamentoEmMemoria()
      aparelho.setItem('paro:grade-horaria', '{"seg":{"inicio":"19:00","fim":"21:50"},"sab":{"inicio":"13:00","fim":"14:40"},"ter":{"inicio":"x"}}')

      expect(criarDadosDoCelular(aparelho).gradeHoraria()).toEqual({ seg: { inicio: '19:00', fim: '21:50' } })
    })

    it('é apagada com o histórico', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())
      dados.definirGradeHoraria(grade)

      dados.apagarHistorico()

      expect(dados.gradeHoraria()).toBeNull()
    })
  })

  describe('histórico de vagas', () => {
    const registro = {
      codigo: 'codigo-do-servidor',
      noite: '2027-05-05',
      ruaCoberta: { id: 'rua-a', nome: 'Rua A' },
      chegada: '19:00',
      saidaPrevista: '21:30',
    }
    const todas = () => true

    it('está vazio antes da primeira vaga', () => {
      expect(criarDadosDoCelular(armazenamentoEmMemoria()).historicoDeVagas(todas)).toEqual([])
    })

    it('não mostra o registro aberto da noite', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())
      dados.guardarRegistro(registro)

      expect(dados.historicoDeVagas(todas)).toEqual([])
    })

    it('guarda a vaga com a faixa horária do "Saí", e continua no aparelho quando o app abre de novo', () => {
      const aparelho = armazenamentoEmMemoria()
      const dados = criarDadosDoCelular(aparelho)
      dados.guardarRegistro(registro)

      dados.encerrarRegistro('21:00')

      expect(criarDadosDoCelular(aparelho).historicoDeVagas(todas)).toEqual([
        { noite: '2027-05-05', ruaCoberta: { id: 'rua-a', nome: 'Rua A' }, chegada: '19:00', saida: '21:00', saiu: true },
      ])
    })

    it('guarda a última saída prevista quando a noite acaba sem o "Saí"', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())
      dados.guardarRegistro(registro)
      dados.mudarSaidaDoRegistro('22:00')

      dados.registroAtual('2027-05-06')

      expect(dados.historicoDeVagas(todas)).toEqual([
        { noite: '2027-05-05', ruaCoberta: { id: 'rua-a', nome: 'Rua A' }, chegada: '19:00', saida: '22:00', saiu: false },
      ])
    })

    it('guarda a saída prevista quando o servidor recusa o código', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())
      dados.guardarRegistro(registro)

      dados.encerrarRegistro(null)

      expect(dados.historicoDeVagas(todas)[0]).toMatchObject({ saida: '21:30', saiu: false })
    })

    it('não guarda o código nem o ponto do carro', () => {
      const aparelho = armazenamentoEmMemoria()
      const dados = criarDadosDoCelular(aparelho)
      dados.guardarRegistro(registro, { lat: -18.912858, lon: -48.279568 })

      dados.encerrarRegistro('21:00')

      const guardado = aparelho.getItem('paro:historico-de-vagas') ?? ''
      expect(guardado).not.toContain('codigo')
      expect(guardado).not.toContain('-18.912858')
    })

    it('mostra da noite mais recente para a mais antiga', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())
      dados.guardarRegistro({ ...registro, noite: '2027-05-03' })
      dados.encerrarRegistro('21:00')
      dados.guardarRegistro({ ...registro, noite: '2027-05-05', ruaCoberta: { id: 'rua-b', nome: 'Rua B' } })
      dados.encerrarRegistro('22:00')
      dados.guardarRegistro({ ...registro, noite: '2027-05-04' })
      dados.encerrarRegistro('20:00')

      expect(dados.historicoDeVagas(todas).map(v => v.noite)).toEqual(['2027-05-05', '2027-05-04', '2027-05-03'])
    })

    it('tira do aparelho as vagas que não são mais mantidas (de outro semestre)', () => {
      const aparelho = armazenamentoEmMemoria()
      const dados = criarDadosDoCelular(aparelho)
      dados.guardarRegistro({ ...registro, noite: '2026-12-01' })
      dados.encerrarRegistro('21:00')
      dados.guardarRegistro(registro)
      dados.encerrarRegistro('21:00')
      const doSemestre = (noite: string) => noite >= '2027-01-01'

      expect(dados.historicoDeVagas(doSemestre).map(v => v.noite)).toEqual(['2027-05-05'])
      expect(criarDadosDoCelular(aparelho).historicoDeVagas(todas).map(v => v.noite)).toEqual(['2027-05-05'])
    })
  })

  describe('apagar histórico', () => {
    const registro = {
      codigo: 'codigo-do-servidor',
      noite: '2027-05-05',
      ruaCoberta: { id: 'rua-a', nome: 'Rua A' },
      chegada: '19:00',
      saidaPrevista: '21:30',
    }

    it('limpa tudo do aparelho: rotina, registro com o código e ponto do carro', () => {
      const aparelho = armazenamentoEmMemoria()
      const dados = criarDadosDoCelular(aparelho)
      dados.definirRotina('19:00')
      dados.guardarRegistro(registro, { lat: -18.912858, lon: -48.279568 })

      dados.apagarHistorico()

      const reaberto = criarDadosDoCelular(aparelho)
      expect(reaberto.rotina()).toBeNull()
      expect(reaberto.registroAtual('2027-05-05')).toBeNull()
      expect(reaberto.pontoDoCarro('2027-05-05')).toBeNull()
    })

    it('limpa o histórico de vagas', () => {
      const aparelho = armazenamentoEmMemoria()
      const dados = criarDadosDoCelular(aparelho)
      dados.guardarRegistro(registro)
      dados.encerrarRegistro('21:00')

      dados.apagarHistorico()

      expect(criarDadosDoCelular(aparelho).historicoDeVagas(() => true)).toEqual([])
    })

    it('mantém a forma de colaborar e não traz de volta a Primeira visita', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())
      dados.definirFormaDeColaborar('manual')
      dados.concluirPrimeiraVisita()

      dados.apagarHistorico()

      expect(dados.formaDeColaborar()).toBe('manual')
      expect(dados.primeiraVisitaConcluida()).toBe(true)
    })
  })

  describe('identificador de sessão do mês', () => {
    it('é o mesmo durante o mês, mesmo com o app aberto de novo', () => {
      const aparelho = armazenamentoEmMemoria()
      const id = criarDadosDoCelular(aparelho).idDeSessaoDoMes('2027-05')

      const reaberto = criarDadosDoCelular(aparelho)

      expect(reaberto.idDeSessaoDoMes('2027-05')).toBe(id)
    })

    it('muda na virada do mês (ADR 0004)', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())
      const deMaio = dados.idDeSessaoDoMes('2027-05')

      const deJunho = dados.idDeSessaoDoMes('2027-06')

      expect(deJunho).not.toBe(deMaio)
      expect(dados.idDeSessaoDoMes('2027-06')).toBe(deJunho)
    })

    it('é um número sorteado de 16 bytes em hexadecimal, diferente em cada aparelho', () => {
      const um = criarDadosDoCelular(armazenamentoEmMemoria()).idDeSessaoDoMes('2027-05')
      const outro = criarDadosDoCelular(armazenamentoEmMemoria()).idDeSessaoDoMes('2027-05')

      expect(um).toMatch(/^[0-9a-f]{32}$/)
      expect(outro).not.toBe(um)
    })
  })

  describe('resposta a "A previsão ajudou hoje?"', () => {
    it('fica marcada como respondida na noite em que a pessoa respondeu', () => {
      const aparelho = armazenamentoEmMemoria()
      const dados = criarDadosDoCelular(aparelho)
      expect(dados.respondeuAjudou('2027-05-05')).toBe(false)

      dados.marcarRespostaAjudou('2027-05-05')

      expect(criarDadosDoCelular(aparelho).respondeuAjudou('2027-05-05')).toBe(true)
    })

    it('volta a ser perguntada na noite seguinte', () => {
      const dados = criarDadosDoCelular(armazenamentoEmMemoria())
      dados.marcarRespostaAjudou('2027-05-05')

      expect(dados.respondeuAjudou('2027-05-06')).toBe(false)
    })
  })

  // Versões antigas do app guardavam chaves e valores com acento (ADR 0026).
  describe('dados guardados por uma versão antiga do app', () => {
    it('mantém a rotina, o registro de vaga e o ponto do carro', () => {
      const aparelho = armazenamentoEmMemoria()
      aparelho.setItem('paro:rotina', '19:00')
      aparelho.setItem('paro:registro-de-vaga', '{"código":"codigo-do-servidor","noite":"2027-05-05","ruaCoberta":{"id":"rua-a","nome":"Rua A"},"chegada":"19:00","saídaPrevista":"21:30"}')
      aparelho.setItem('paro:ponto-do-carro', '{"lat":-18.912858,"lon":-48.279568}')

      const dados = criarDadosDoCelular(aparelho)

      expect(dados.rotina()).toBe('19:00')
      expect(dados.registroAtual('2027-05-05')).toEqual({
        codigo: 'codigo-do-servidor',
        noite: '2027-05-05',
        ruaCoberta: { id: 'rua-a', nome: 'Rua A' },
        chegada: '19:00',
        saidaPrevista: '21:30',
      })
      expect(dados.pontoDoCarro('2027-05-05')).toEqual({ lat: -18.912858, lon: -48.279568 })
    })

    it('muda a saída prevista de um registro guardado no formato antigo', () => {
      const aparelho = armazenamentoEmMemoria()
      aparelho.setItem('paro:registro-de-vaga', '{"código":"codigo-do-servidor","noite":"2027-05-05","ruaCoberta":{"id":"rua-a","nome":"Rua A"},"chegada":"19:00","saídaPrevista":"21:30"}')
      const dados = criarDadosDoCelular(aparelho)

      dados.mudarSaidaDoRegistro('22:00')

      expect(dados.registroAtual('2027-05-05')).toMatchObject({ codigo: 'codigo-do-servidor', saidaPrevista: '22:00' })
    })

    it('mantém a forma de colaborar com a localização ligada', () => {
      const aparelho = armazenamentoEmMemoria()
      aparelho.setItem('paro:forma-de-colaborar', 'localização-ligada')

      expect(criarDadosDoCelular(aparelho).formaDeColaborar()).toBe('localizacao-ligada')
    })

    it('mantém o identificador de sessão do mês', () => {
      const aparelho = armazenamentoEmMemoria()
      aparelho.setItem('paro:sessao-do-mes', '{"mês":"2027-05","id":"0123456789abcdef0123456789abcdef"}')

      expect(criarDadosDoCelular(aparelho).idDeSessaoDoMes('2027-05')).toBe('0123456789abcdef0123456789abcdef')
    })
  })
})
