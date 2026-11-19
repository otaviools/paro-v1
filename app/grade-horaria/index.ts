/**
 * Grade horária (ADR 0035): o início da primeira aula e o fim da última aula
 * da noite em cada dia da semana. Este módulo monta a grade a partir dos
 * textos do PDF do portal da ESAMC e calcula o que sai dela. Não lê o PDF:
 * quem lê é `lerGradeDoPdf` (ler-pdf.ts), só no navegador.
 */

/** Login do portal do aluno da ESAMC Uberlândia, onde fica o horário de aulas. */
export const ENDERECO_DO_PORTAL = 'https://waeweb.esamcuberlandia.com.br/waeweb/servlet/hwalgn?1,'

/** Dias da semana com aula na ESAMC, na ordem da grade. */
export const DIAS_DA_SEMANA = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'] as const
export type DiaDaSemana = typeof DIAS_DA_SEMANA[number]

export const NOMES_DOS_DIAS: Record<DiaDaSemana, string> = {
  seg: 'Segunda', ter: 'Terça', qua: 'Quarta', qui: 'Quinta', sex: 'Sexta', sab: 'Sábado',
}

/** Horário no formato "HH:MM". */
export type Horario = string

/** Aulas da noite de um dia: início da primeira e fim da última. */
export interface AulasDoDia {
  inicio: Horario
  fim: Horario
}

/** Dias sem aula na noite não aparecem. */
export type GradeHoraria = Partial<Record<DiaDaSemana, AulasDoDia>>

/** Texto do PDF com a posição na página (origem embaixo, como no pdf.js). */
export interface TextoDoPdf {
  texto: string
  x: number
  y: number
}

/** Só entram aulas que começam no período da área coberta, das 17h às 23h. */
const INICIO_DA_NOITE = '17:00'
const FIM_DA_NOITE = '23:00'

function minutos(horario: Horario): number {
  const [h, m] = horario.split(':').map(Number) as [number, number]
  return h * 60 + m
}

const HORARIO = /^([01]\d|2[0-3]):[0-5]\d$/

export function eHorario(texto: string): texto is Horario {
  return HORARIO.test(texto)
}

/** Aula da noite: começa das 17h às 23h e termina depois de começar. */
export function eAulaDaNoite({ inicio, fim }: AulasDoDia): boolean {
  return eHorario(inicio) && eHorario(fim)
    && inicio >= INICIO_DA_NOITE && inicio < FIM_DA_NOITE && minutos(fim) > minutos(inicio)
}

/** Dia da coluna pelo texto do cabeçalho da grade ("Segunda", "Terça"...). */
const DIA_DO_CABECALHO: Record<string, DiaDaSemana> = Object.fromEntries(
  DIAS_DA_SEMANA.map(dia => [NOMES_DOS_DIAS[dia], dia]),
)

/**
 * Monta a grade horária com os textos de cada página do PDF do portal da
 * ESAMC: os dias do cabeçalho dão as colunas, os rótulos "Das HH:MM às
 * HH:MM" dão as linhas (pela hora escrita, porque as linhas não vêm em
 * ordem), e cada "Sala" é uma aula, na coluna e na linha em que está.
 * Devolve null quando os textos não são de uma grade: sem os dias, sem as
 * linhas ou sem nenhuma aula. `foraDaNoite` lista os dias que só têm aulas
 * fora das 17h às 23h: eles ficam fora da grade, e a conferência avisa.
 */
export function gradeDosTextos(paginas: TextoDoPdf[][]): { grade: GradeHoraria, foraDaNoite: DiaDaSemana[] } | null {
  let colunas: { dia: DiaDaSemana, x: number }[] = []
  const aulas = new Map<DiaDaSemana, AulasDoDia[]>()
  let algumaAula = false

  for (const textos of paginas) {
    if (colunas.length === 0) {
      colunas = textos
        .filter(t => DIA_DO_CABECALHO[t.texto])
        .map(t => ({ dia: DIA_DO_CABECALHO[t.texto]!, x: t.x }))
        .sort((a, b) => a.x - b.x)
    }
    if (colunas.length === 0) continue
    const inicioDasColunas = colunas[0]!.x

    // Rótulos da coluna de horários. O fim pode vir no mesmo texto ou no de
    // baixo, sozinho ("19:50") ou com o "às" ("às 19:50", no AlunoNet).
    const daEsquerda = textos.filter(t => t.x < inicioDasColunas - 5)
    const linhas: { y: number, aula: AulasDoDia }[] = []
    for (const rotulo of daEsquerda) {
      const encontrado = rotulo.texto.match(/^Das\s*(\d\d:\d\d)(?:\s*às\s*(\d\d:\d\d))?/)
      if (!encontrado) continue
      const fim = encontrado[2]
        ?? daEsquerda
          .map(t => t.texto.replace(/^às\s*/, ''))
          .find((texto, i) => eHorario(texto) && daEsquerda[i]!.y < rotulo.y && rotulo.y - daEsquerda[i]!.y < 20)
      if (fim) linhas.push({ y: rotulo.y, aula: { inicio: encontrado[1]!, fim } })
    }

    for (const sala of textos.filter(t => /^Sala\b/.test(t.texto))) {
      const coluna = colunas.filter(c => c.x <= sala.x + 5).at(-1)
      // A linha da aula é a do rótulo logo acima da "Sala" (y maior).
      const linha = linhas.filter(l => l.y >= sala.y - 5).sort((a, b) => a.y - b.y)[0]
      if (!coluna || !linha) continue
      algumaAula = true
      aulas.set(coluna.dia, [...(aulas.get(coluna.dia) ?? []), linha.aula])
    }
  }

  if (colunas.length === 0 || !algumaAula) return null

  const grade: GradeHoraria = {}
  const foraDaNoite: DiaDaSemana[] = []
  for (const dia of DIAS_DA_SEMANA) {
    const doDia = aulas.get(dia)
    if (!doDia) continue
    const daNoite = doDia.filter(eAulaDaNoite)
    if (daNoite.length === 0) {
      foraDaNoite.push(dia)
      continue
    }
    grade[dia] = {
      inicio: daNoite.map(a => a.inicio).sort()[0]!,
      fim: daNoite.map(a => a.fim).sort().at(-1)!,
    }
  }
  return { grade, foraDaNoite }
}

/** Dia da semana da noite "AAAA-MM-DD"; domingo não tem aula e devolve null. */
export function diaDaSemanaDaNoite(noite: string): DiaDaSemana | null {
  const [ano, mes, dia] = noite.split('-').map(Number) as [number, number, number]
  const indice = new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()
  return indice === 0 ? null : DIAS_DA_SEMANA[indice - 1]!
}

/**
 * Saída prevista sugerida: a faixa horária em que a última aula acaba (aula
 * até 21h50, saída 21h30). Depois da última faixa horária, fica a última.
 */
export function saidaPrevistaDaAula(fim: Horario, faixasHorarias: string[]): string | null {
  const daAula = faixasHorarias.filter(f => minutos(f) <= minutos(fim))
  return daAula.at(-1) ?? null
}

/** Grade sem nenhum dia com aula na noite. */
export function gradeVazia(grade: GradeHoraria): boolean {
  return DIAS_DA_SEMANA.every(d => !grade[d])
}
