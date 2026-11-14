import { dadosDoCelularDoAparelho } from '~/dados-do-celular'

/** Faixas horárias fixas das abas, além de Agora. */
const FAIXAS_HORARIAS_DAS_ABAS = ['19:00', '21:00', '22:00']

/**
 * Panorama da noite com as abas de faixa horária do Início e do Mapa:
 * Agora, 19h, 21h e 22h, mais a rotina quando não é uma delas. Abre na
 * rotina do celular; sem rotina, em Agora.
 */
export function usePanoramaDaNoite() {
  /** Rotina do celular; lida só no navegador, depois de montar. */
  const rotina = ref<string | null>(null)

  const abas = computed(() => {
    const faixasHorarias = rotina.value && !FAIXAS_HORARIAS_DAS_ABAS.includes(rotina.value)
      ? [...FAIXAS_HORARIAS_DAS_ABAS, rotina.value].sort()
      : FAIXAS_HORARIAS_DAS_ABAS
    return [
      { valor: 'agora', rotulo: 'Agora' },
      ...faixasHorarias.map(f => ({ valor: f, rotulo: rotuloDaFaixaHoraria(f) })),
    ]
  })

  /** Null até ler a rotina; depois, a faixa horária da aba escolhida. */
  const faixaHoraria = ref<string | null>(null)

  // A faixa horária inicial depende da rotina, que só existe no celular: a
  // busca roda no navegador, depois de ler a rotina. Cada tela tem a sua
  // chave: com uma chave só, a busca da tela anterior, já desmontada, não
  // acompanha mais a troca de aba da tela nova.
  const { data: panorama, status, error, execute } = useFetch<Panorama>('/api/panorama', {
    key: `panorama-da-noite-${useId()}`,
    query: { faixaHoraria } satisfies EntradaNaoValidada<ConsultaDoPanorama>,
    server: false,
    immediate: false,
  })

  onMounted(() => {
    rotina.value = dadosDoCelularDoAparelho().rotina()
    faixaHoraria.value = rotina.value ?? 'agora'
    execute()
  })

  // Uma rotina guardada que deixou de ser faixa horária da área coberta (o
  // servidor recusa com 400) vale como sem rotina: a tela volta para Agora.
  watch(error, (erro) => {
    if (erro?.statusCode === 400 && rotina.value !== null && faixaHoraria.value === rotina.value) {
      rotina.value = null
      faixaHoraria.value = 'agora'
    }
  })

  const carregando = computed(() => status.value === 'idle' || status.value === 'pending')

  return { abas, faixaHoraria, panorama, error, carregando }
}
