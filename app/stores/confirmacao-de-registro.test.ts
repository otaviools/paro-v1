import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useConfirmacaoDeRegistroStore } from './confirmacao-de-registro'

describe('Confirmação de registro', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('não aparece sem um registro novo', () => {
    expect(useConfirmacaoDeRegistroStore().consumir()).toBe(false)
  })

  it('aparece uma vez depois de Registrar vaga', () => {
    useConfirmacaoDeRegistroStore().marcar()

    const minhaVaga = useConfirmacaoDeRegistroStore()

    expect(minhaVaga.consumir()).toBe(true)
    expect(minhaVaga.consumir()).toBe(false)
  })
})
