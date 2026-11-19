import { dadosDoCelularDoAparelho } from '~/dados-do-celular'
import { diaDaSemanaDaNoite } from '~/grade-horaria'
import type { AulasDoDia } from '~/grade-horaria'

/** O dia de hoje pela grade horária (ADR 0035). */
export interface HojeDaGrade {
  noite: string
  /** Aulas da noite de hoje; null em dia sem aula. */
  aulas: AulasDoDia | null
  /** Melhor chegada para a primeira aula; null sem aula, sem chance a tempo ou sem conexão. */
  melhorChegada: MelhorChegada | null
}

/** Uma consulta por noite e horário de aula, dividida entre o Início, as abas e o card "Hoje". */
const consultas = new Map<string, Promise<MelhorChegada | null>>()

/**
 * Hoje pela grade horária guardada no celular: as aulas da noite e a melhor
 * chegada, que vem do servidor (`GET /api/melhor-chegada`) só com o horário
 * da primeira aula. Só no navegador. `ler()` devolve null sem grade horária
 * ou sem saber a noite.
 */
export function useHojeDaGrade() {
  const { lerNoite } = useAgora()

  async function ler(): Promise<HojeDaGrade | null> {
    const grade = dadosDoCelularDoAparelho().gradeHoraria()
    if (!grade) return null
    const noite = await lerNoite()
    if (!noite) return null
    const dia = diaDaSemanaDaNoite(noite)
    const aulas = (dia && grade[dia]) || null
    if (!aulas) return { noite, aulas: null, melhorChegada: null }

    const chave = `${noite}|${aulas.inicio}`
    if (!consultas.has(chave)) {
      consultas.set(chave, $fetch<RespostaDaMelhorChegada>('/api/melhor-chegada', {
        query: { primeiraAula: aulas.inicio } satisfies ConsultaDaMelhorChegada,
      }).catch(() => {
        consultas.delete(chave)
        return null
      }))
    }
    return { noite, aulas, melhorChegada: await consultas.get(chave)! }
  }

  return { ler }
}
