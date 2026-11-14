# Módulos do Parô

Proposta de módulos derivada do `CONTEXT.md` e das ADRs 0001 a 0024. Usa o vocabulário da skill `codebase-design`: **módulo**, **interface**, **seam**, **adapter**, **depth**. Cada módulo junta muita regra atrás de uma interface pequena, para que as regras fiquem num lugar só e não espalhadas pelas telas.

## Módulos do domínio (servidor)

### 1. Panorama da noite

- **Responsabilidade:** responder "como está cada rua coberta nesta faixa horária". É o módulo de leitura das telas Início, Mapa, Detalhe da rua e Visão geral desktop.
- **Interface:**
  - `panorama(faixaHoraria, agora) → { ruas: [{ rua, estimativa, saidasPrevistas, distanciaAoDestino }], melhorChance, demonstracao: boolean }`
  - `ruaAoLongoDaNoite(rua, agora) → { rua, distanciaAoDestino, meioDoTrecho, faixasHorarias: [{ faixaHoraria, estimativa }], melhorFaixaHoraria, saidasPrevistas: [{ faixaHoraria, quantidade }], demonstracao }`, para o Detalhe da rua
- **Esconde:**
  - a regra da melhor chance: desempate pela distância até o destino e ruas Sem dado fora da disputa;
  - a junção de Chance, Registros de vaga e Área coberta;
  - o aviso "Dados de demonstração" (ADR 0012).
- **Teste de exclusão:** sem esse módulo, cada tela teria que juntar chance, saídas previstas e distâncias por conta própria. A complexidade voltaria multiplicada.

### 2. Chance

- **Responsabilidade:** transformar observações em uma faixa de chance com base, ou em Sem dado. É o módulo com mais regras de negócio.
- **Interface:** `estimar(observacoes, semestre, calendario) → Map<(ruaCoberta, faixaHoraria), Estimativa>`, em que `Estimativa = { faixaDeChance, chance, base } | SemDado`
- **Esconde:**
  - a rua cheia, com ocupação de 85% ou mais (ADR 0005);
  - o filtro por semestre e por dia letivo normal (ADRs 0007 e 0008);
  - o mínimo de 4 observações (ADR 0007);
  - os cortes de 70% e 40% das faixas de chance (ADR 0006).
- **Dependências:** é cálculo puro em memória, sem banco, relógio ou rede. Não tem adapter, e os testes chamam a interface diretamente. É o primeiro alvo de TDD.

### 3. Observações

- **Responsabilidade:** guardar e entregar as observações, e dizer se são reais ou fictícias.
- **Interface:** `doSemestre(semestre) → Observacao[]`, `registrar(observacao)` (usado pela equipe em campo) e `eDemonstracao() → boolean`
- **Seam:** é real, com dois adapters:
  - Postgres, para as observações reais;
  - gerador de observações fictícias (ADR 0012).

  Em 2027, a mudança é trocar o adapter.
- **Garante:** que as duas fontes nunca se misturam numa mesma resposta.

### 4. Registros de vaga

- **Responsabilidade:** cuidar do ciclo de vida de um registro numa noite. Recebe o registro, permite alterá-lo ou encerrá-lo, conta as saídas previstas e fecha a noite.
- **Interface:** `registrar({ rua, chegada, saidaPrevista }, agora) → { codigo, noite, chegada }`, `alterarSaida(codigo, faixa, agora)`, `encerrar(codigo, agora)` (o "Saí"), `saidasPrevistas(noite) → [{ ruaCoberta, faixaHoraria, quantidade }]`, `fecharNoite(noite)`, `fecharNoitesAnteriores(agora) → [noite]` (o fechamento diário) e `totaisDaNoite(noite) → [{ ruaCoberta, faixaHoraria, quantidade }]`, em que a faixa horária dos totais é a de chegada. A chegada pode ser `"agora"`, a faixa horária do instante.
- **Esconde:**
  - o código de uso único, que expira no fim da noite (ADR 0014);
  - a ausência de identificador (ADR 0004);
  - a agregação em totais por noite e a exclusão dos registros (ADR 0021).
- **Dependências:** usa Postgres, com substituto local. Os testes rodam com PGLite. O seam fica interno ao módulo e não há porta de repositório exposta.

### 5. Área coberta

- **Responsabilidade:** guardar o espaço e o tempo do produto: ruas cobertas e seus trechos, destino, distâncias, faixas horárias das 17h às 23h e calendário letivo.
- **Interface:** `ruasCobertas()`, `distanciaAoDestino(rua)`, `ruaMaisProxima(ponto)`, `faixaHoraria(instante)`, `noiteDe(instante)`, `eDiaLetivoNormal(data)` e `semestreDe(data)`
- **Por que juntar espaço e calendário:** os dois são dados fixos, configurados pela equipe, e mudam pelo mesmo motivo, a virada do semestre (ADRs 0008, 0019 e 0024). Separar daria dois módulos rasos.
- **Dependências:** é em memória, carregado de configuração. Recebe o instante como parâmetro e nunca lê o relógio sozinho. `ruaMaisProxima(ponto)` roda no celular, na tela Registrar vaga, para que o ponto do carro nunca vá ao servidor (ADR 0003).

### 6. Métricas de uso

- **Responsabilidade:** acompanhar as metas do plano (seção 12.6): recorrência, utilidade percebida e total de registros por noite.
- **Interface:** `registrarSessao(idMensal, data)`, `responderAjudou(ajudou, data)`, `consolidar(data) → { semanasConsolidadas, sessoesApagadas }` (a rotina diária) e `relatorio(de, ate)` (até 366 dias) `→ { recorrencia: [{ semana, motoristas, voltaramNaSemanaSeguinte }], ajudou: [{ data, sim, nao }], registrosPorNoite: [{ noite, total, porRuaEFaixaHoraria }] }`, para a equipe.
- **Esconde:**
  - a recorrência por semana: o total de uma semana é gravado quando a semana seguinte termina;
  - a retenção de 60 dias das sessões e a consolidação em totais (ADRs 0004 e 0021);
  - a recusa de identificador fora do formato sorteado pelo celular.
- **Dependências:** usa Postgres (PGLite nos testes) e, de Registros de vaga, só `totaisDaNoite`: os totais de registros por noite são os que o `fecharNoite` gravou. Este módulo não lê registros de vaga e não guarda cópia dos totais.

## Módulos do celular (cliente)

### 7. Dados do celular

- **Responsabilidade:** guardar tudo que nunca sai do aparelho: rotina, ponto do carro, códigos dos registros abertos, histórico e identificador mensal de sessão.
- **Interface:** `rotina` (ler e definir), `pontoDoCarro` (guardar ao registrar, apagar no "Saí"), `codigoDoRegistroAtual`, `idDeSessaoDoMes(mes)`, `respondeuAjudou(noite)` / `marcarRespostaAjudou(noite)` e `apagarHistorico()`
- **Garante:** que esses dados nunca vão para o servidor (ADRs 0003, 0004 e 0015). Concentrar isso num módulo só deixa a regra de privacidade verificável num único lugar.
- **Dependências:** usa `localStorage`, com substituto local. Os testes usam um armazenamento em memória.

### 8. Mapa da área

- **Responsabilidade:** desenhar as ruas cobertas sobre o mapa, com o padrão da faixa de chance de cada uma, e mostrar o ponto do carro.
- **Interface:** `<MapaDaArea :ruas :pontoDoCarro :posicaoAtual :etiquetaDoCarro @selecionar-rua>`
- **Esconde:** o MapLibre GL, os tiles PMTiles, as imagens dos padrões (sólido, hachura, pontilhado e tracejado) e o tema escuro (ADRs 0006, 0017 e 0019).
- **Seam:** tem um único adapter (MapLibre), então não vale criar uma porta. Basta isolar o MapLibre dentro do componente, para que nenhuma tela o use direto.

## O que não vira módulo

- **Rotas HTTP do Nitro:** cada rota só repassa a chamada para um módulo do servidor. São adapters finos.
- **Sugestão de rua:** é só gravar, listar e apagar. É uma rota direta para o banco.
- **"Como chegar":** é um link para o app de navegação do celular (ADR 0020).

## Dependências

```
Telas ──► Panorama da noite ──► Chance          (puro)
                │                 ▲
                │                 └── Observações ──► [Postgres | Gerador fictício]
                ├──► Registros de vaga ──► Postgres (PGLite nos testes)
                └──► Área coberta       (configuração)
Telas ──► Dados do celular ──► localStorage
Telas ──► Mapa da área ──► MapLibre + PMTiles
Métricas de uso ──► Registros de vaga.totaisDaNoite (gravados por fecharNoite)
```

Seams que valem a pena:

- Observações: real ou fictícia.
- Postgres: PGLite nos testes, nos módulos 3, 4 e 6.
- Armazenamento do celular: em memória nos testes.

O relógio não vira seam. Ele é passado como parâmetro (`agora` ou `instante`).

## Ordem sugerida

1. **Chance:** concentra a maioria das ADRs e é puro, por isso é o melhor primeiro alvo para TDD.
2. **Área coberta:** é a configuração de que Chance e Panorama dependem.
3. **Observações**, com o gerador de observações fictícias.
4. **Panorama da noite:** é o que as telas consomem.
5. **Registros de vaga**, depois **Dados do celular** e **Mapa da área**.
6. **Métricas de uso.**
