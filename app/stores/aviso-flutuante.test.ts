import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DURACAO_DO_AVISO, useAvisoFlutuanteStore } from './aviso-flutuante'

describe('Aviso flutuante', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('não mostra nada antes de um aviso', () => {
    expect(useAvisoFlutuanteStore().texto).toBeNull()
  })

  it('mostra o aviso e some depois de 3 s', () => {
    const aviso = useAvisoFlutuanteStore()

    aviso.avisar('Pronto.')
    expect(aviso.texto).toBe('Pronto.')

    vi.advanceTimersByTime(DURACAO_DO_AVISO - 1)
    expect(aviso.texto).toBe('Pronto.')

    vi.advanceTimersByTime(1)
    expect(aviso.texto).toBeNull()
  })

  it('um aviso novo troca o anterior e recomeça a contagem', () => {
    const aviso = useAvisoFlutuanteStore()

    aviso.avisar('Primeiro.')
    vi.advanceTimersByTime(2000)
    aviso.avisar('Segundo.')
    vi.advanceTimersByTime(2000)

    expect(aviso.texto).toBe('Segundo.')

    vi.advanceTimersByTime(1000)
    expect(aviso.texto).toBeNull()
  })

  it('sem tipo, o aviso é de sucesso; uma falha passa o tipo erro', () => {
    const aviso = useAvisoFlutuanteStore()

    aviso.avisar('Pronto.')
    expect(aviso.tipo).toBe('sucesso')

    aviso.avisar('Não deu.', 'erro')
    expect(aviso.tipo).toBe('erro')
  })

  it('é o mesmo em todas as telas', () => {
    useAvisoFlutuanteStore().avisar('Saí.')

    expect(useAvisoFlutuanteStore().texto).toBe('Saí.')
  })
})
