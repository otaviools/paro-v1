# Parô

Previsão da chance de encontrar vaga de estacionamento por rua e horário no entorno da ESAMC Uberlândia, voltada a quem dirige até lá à noite.

## Language

**Rua coberta**:
Uma das cinco ruas do entorno da ESAMC para as quais o Parô mostra a chance de vaga.
_Avoid_: rua monitorada, rua do mapa

**Área coberta**:
O conjunto das ruas cobertas no período das 17h às 23h.
_Avoid_: recorte, região

**Faixa horária**:
Intervalo de 30 minutos dentro da área coberta, a menor unidade de tempo de uma previsão.
_Avoid_: faixa (sozinho), slot, janela, horário

**Faixa de chance**:
Intervalo de chance com rótulo mostrado ao usuário: Tranquilo (70% ou mais), Apertado (40% a 69%) ou Difícil (menos de 40%).
_Avoid_: faixa (sozinho), porcentagem, nível, status

**Sem dado**:
Estado de uma rua coberta, em uma faixa horária, quando ainda não há medição para estimar a chance. Nunca é tratado como vaga livre.
_Avoid_: vazio, desconhecido, livre

**Registro de vaga**:
Informação voluntária de que alguém estacionou numa rua coberta, com a faixa horária de chegada e a faixa horária de saída prevista. Não inclui a posição exata do carro e só pode ser alterado ou encerrado na mesma noite.
_Avoid_: check-in, vaga ativa, estacionei

**Observação**:
Contagem feita em campo, numa noite, das vagas existentes e ocupadas de uma rua coberta numa faixa horária.
_Avoid_: medição (sozinho), leitura, amostra

**Rua cheia**:
Situação de uma rua coberta, numa observação, em que 85% ou mais das vagas estão ocupadas.
_Avoid_: lotada, sem vaga

**Chance**:
Percentual de observações de uma rua coberta, numa faixa horária, em que ela não estava cheia.
_Avoid_: probabilidade, disponibilidade, previsão

**Dia letivo normal**:
Dia de aula na ESAMC que não é de prova, feriado nem férias; só as observações desses dias contam para a chance.
_Avoid_: dia útil, dia comum

**Base**:
Número de observações que sustentam uma chance e a data da mais recente, mostrados junto dela.
_Avoid_: horário da medição, atualização, fonte

**Saída prevista**:
Contagem, na noite atual, de registros de vaga que indicam saída numa rua coberta e faixa horária. É mostrada à parte e não entra na chance.
_Avoid_: vaga liberando, previsão de saída

**Observação fictícia**:
Observação inventada para demonstração, no mesmo formato de uma observação real, que nunca se mistura com dados reais.
_Avoid_: mock, dado falso, exemplo

**Rotina**:
Horário de chegada habitual que a pessoa escolhe para si, usado como faixa horária inicial do app.
_Avoid_: local padrão, perfil, preferência
