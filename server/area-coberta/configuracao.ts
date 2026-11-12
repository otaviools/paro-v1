import type { ConfiguracaoDaAreaCoberta } from '.'

/**
 * Configuração versionada da área coberta.
 *
 * PROVISÓRIA: os trechos, as coordenadas, as distâncias e o calendário letivo
 * abaixo são estimativas para desenvolvimento. Os valores reais vêm do
 * protocolo de campo (limites dos trechos e distâncias medidas a pé) e do
 * calendário oficial da ESAMC para 2027. Ao trocá-los, mude `provisoria` para false.
 */
export const configuracaoDaAreaCoberta: ConfiguracaoDaAreaCoberta = {
  provisoria: true,
  fusoHorario: 'America/Sao_Paulo',

  // PROVISÓRIO: coordenada aproximada da entrada de pedestres principal (ADR 0024).
  destino: {
    nome: 'Entrada de pedestres principal da ESAMC Uberlândia',
    ponto: { lat: -18.9146, lon: -48.2754 },
  },

  // As cinco ruas cobertas da ADR 0001. Trechos e distâncias PROVISÓRIOS (ADR 0024).
  ruasCobertas: [
    {
      id: 'vasconcelos-costa',
      nome: 'Av. Vasconcelos Costa',
      trecho: { de: 'a definir', ate: 'a definir', meio: { lat: -18.9140, lon: -48.2760 } },
      distanciaAoDestinoMetros: 150,
    },
    {
      id: 'rivalino-pereira',
      nome: 'R. Rivalino Pereira',
      trecho: { de: 'a definir', ate: 'a definir', meio: { lat: -18.9152, lon: -48.2745 } },
      distanciaAoDestinoMetros: 250,
    },
    {
      id: 'belo-horizonte',
      nome: 'Av. Belo Horizonte',
      trecho: { de: 'a definir', ate: 'a definir', meio: { lat: -18.9160, lon: -48.2770 } },
      distanciaAoDestinoMetros: 350,
    },
    {
      id: 'arlindo-teixeira',
      nome: 'R. Arlindo Teixeira',
      trecho: { de: 'a definir', ate: 'a definir', meio: { lat: -18.9135, lon: -48.2740 } },
      distanciaAoDestinoMetros: 300,
    },
    {
      id: 'alexandre-marquez',
      nome: 'R. Alexandre Marquez',
      trecho: { de: 'a definir', ate: 'a definir', meio: { lat: -18.9128, lon: -48.2765 } },
      distanciaAoDestinoMetros: 450,
    },
  ],

  // PROVISÓRIO: datas estimadas até a publicação do calendário oficial (ADRs 0008 e 0011).
  calendarioLetivo: [
    // PROVISÓRIO, SÓ PARA DEMONSTRAÇÃO: semestre que cobre novembro de 2026,
    // para que as observações fictícias apareçam antes de 2027 (ADRs 0011 e 0012).
    // Não é o calendário real da ESAMC. Remover quando as observações reais começarem.
    {
      id: '2026-2-demonstracao',
      de: '2026-08-03',
      ate: '2026-12-11',
      diasDeAula: [1, 2, 3, 4, 5],
      provas: [],
      feriados: ['2026-09-07', '2026-10-12', '2026-11-02', '2026-11-20'],
      ferias: [],
    },
    {
      id: '2027-1',
      de: '2027-02-15',
      ate: '2027-06-30',
      diasDeAula: [1, 2, 3, 4, 5],
      provas: [],
      feriados: ['2027-04-21', '2027-05-01', '2027-05-27'],
      ferias: [],
    },
  ],
}
