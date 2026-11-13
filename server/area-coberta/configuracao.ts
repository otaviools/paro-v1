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

  // PROVISÓRIO: ponto da ESAMC no OpenStreetMap, até a medição da entrada de
  // pedestres principal (ADR 0024).
  destino: {
    nome: 'Entrada de pedestres principal da ESAMC Uberlândia',
    ponto: { lat: -18.912511, lon: -48.279397 },
  },

  // As cinco ruas cobertas da ADR 0001. Trechos e distâncias PROVISÓRIOS (ADR 0024).
  // PROVISÓRIO: cada linha vai de uma esquina à outra no quarteirão mais perto
  // da ESAMC, com os vértices das vias do OpenStreetMap (recorte do mapa em
  // public/mapa). O meio é o ponto médio da linha. Os limites reais vêm do
  // protocolo de campo.
  ruasCobertas: [
    {
      id: 'vasconcelos-costa',
      nome: 'Av. Vasconcelos Costa',
      trecho: {
        de: 'a definir',
        ate: 'a definir',
        meio: { lat: -18.912858, lon: -48.279568 },
        linha: [{ lat: -18.913016, lon: -48.280114 }, { lat: -18.912699, lon: -48.279022 }],
      },
      distanciaAoDestinoMetros: 150,
    },
    {
      id: 'rivalino-pereira',
      nome: 'R. Rivalino Pereira',
      trecho: {
        de: 'a definir',
        ate: 'a definir',
        meio: { lat: -18.913144, lon: -48.278883 },
        linha: [{ lat: -18.912699, lon: -48.279022 }, { lat: -18.913589, lon: -48.278743 }],
      },
      distanciaAoDestinoMetros: 250,
    },
    {
      id: 'belo-horizonte',
      nome: 'Av. Belo Horizonte',
      trecho: {
        de: 'a definir',
        ate: 'a definir',
        meio: { lat: -18.911947, lon: -48.279874 },
        linha: [{ lat: -18.912105, lon: -48.280411 }, { lat: -18.911788, lon: -48.279336 }],
      },
      distanciaAoDestinoMetros: 350,
    },
    {
      id: 'arlindo-teixeira',
      nome: 'R. Arlindo Teixeira',
      trecho: {
        de: 'a definir',
        ate: 'a definir',
        meio: { lat: -18.913463, lon: -48.279975 },
        linha: [{ lat: -18.913016, lon: -48.280114 }, { lat: -18.913909, lon: -48.279835 }],
      },
      distanciaAoDestinoMetros: 300,
    },
    {
      id: 'alexandre-marquez',
      nome: 'R. Alexandre Marquez',
      trecho: {
        de: 'a definir',
        ate: 'a definir',
        meio: { lat: -18.913749, lon: -48.279289 },
        linha: [{ lat: -18.913909, lon: -48.279835 }, { lat: -18.913589, lon: -48.278743 }],
      },
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
