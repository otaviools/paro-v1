# Parô

Previsão da chance de encontrar vaga de estacionamento por rua e horário no entorno da ESAMC Uberlândia, voltada a quem dirige até lá à noite.

## Language

### Pessoas

**Motorista**:
Pessoa que vai de carro até a área coberta e procura vaga; é o público principal do Parô.
_Avoid_: usuário, condutor, cliente

**Colaborador**:
Motorista que faz registros de vaga; o papel existe a cada registro, não é um cadastro. Não se refere a funcionário de empresas ou da ESAMC.
_Avoid_: voluntário, contribuidor, usuário ativo

**Rotina**:
Horário de chegada habitual que a pessoa escolhe para si, usado como faixa horária inicial do app.
_Avoid_: local padrão, perfil, preferência

### Lugar

**Rua coberta**:
Trecho delimitado de uma das cinco ruas do entorno da ESAMC, a uma distância curta a pé dela, para o qual o Parô mostra a chance de vaga. Vagas fora do trecho não pertencem a ela.
_Avoid_: rua monitorada, rua do mapa, rua inteira

**Área coberta**:
O conjunto das ruas cobertas no período das 17h às 23h.
_Avoid_: recorte, região

**Destino**:
A entrada de pedestres principal da ESAMC Uberlândia, ponto até onde todas as distâncias do Parô são medidas.
_Avoid_: ESAMC (como ponto), faculdade, endereço

**Vaga**:
Lugar na via pública de uma rua coberta onde é permitido estacionar um carro. Estacionamentos privados, lugares proibidos e espaços de moto não contam.
_Avoid_: lugar, espaço, posição

**Ponto do carro**:
Posição exata onde o motorista deixou o carro, lida só quando a localização está ligada e guardada só no celular até ele avisar que saiu.
_Avoid_: localização da vaga, posição, coordenada

**Sugestão de rua**:
Pedido, sem identificação, para que a equipe passe a observar uma rua ou trecho fora da área coberta. Não altera o mapa.
_Avoid_: pedido de rua, sugerir medição, indicação

### Tempo

**Faixa horária**:
Intervalo de 30 minutos dentro da área coberta, a menor unidade de tempo de uma previsão.
_Avoid_: faixa (sozinho), slot, janela, horário

**Pico de chegada**:
Período das 18h30 às 19h59, em que 75% dos respondentes da pesquisa chegam à região. Descreve a demanda, não a ocupação.
_Avoid_: pico (sozinho), horário de pico, rush

**Pico de saída**:
Período das 21h às 22h59, em que 85% dos respondentes da pesquisa saem da região. Descreve a demanda, não a ocupação.
_Avoid_: pico (sozinho), horário de saída

**Dia letivo normal**:
Dia de aula na ESAMC que não é de prova, feriado nem férias; só as observações desses dias contam para a chance.
_Avoid_: dia útil, dia comum

### Observação e chance

**Observação**:
Contagem feita em campo, numa noite, das vagas existentes e ocupadas de uma rua coberta numa faixa horária.
_Avoid_: medição (sozinho), leitura, amostra

**Observação fictícia**:
Observação inventada para demonstração, no mesmo formato de uma observação real, que nunca se mistura com dados reais.
_Avoid_: mock, dado falso, exemplo

**Ocupação**:
Percentual das vagas de uma rua coberta que estão com um carro no momento de uma observação.
_Avoid_: lotação, uso, taxa de ocupação

**Rua cheia**:
Situação de uma rua coberta, numa observação, em que a ocupação é de 85% ou mais.
_Avoid_: lotada, sem vaga

**Chance**:
Percentual das observações do semestre, em dias letivos normais, de uma rua coberta numa faixa horária, em que ela não estava cheia.
_Avoid_: probabilidade, disponibilidade, previsão

**Faixa de chance**:
Intervalo de chance com rótulo mostrado ao motorista: Tranquilo (70% ou mais), Apertado (40% a 69%) ou Difícil (menos de 40%).
_Avoid_: faixa (sozinho), porcentagem, nível, status

**Sem dado**:
Estado de uma rua coberta, numa faixa horária, que ainda não tem observações suficientes no semestre para ter uma chance. Nunca é tratado como vaga livre nem como rua cheia.
_Avoid_: vazio, desconhecido, livre, sem medição

**Base**:
Número de observações que sustentam uma chance e a data da mais recente, mostrados junto dela.
_Avoid_: horário da medição, atualização, fonte

**Melhor chance**:
A rua coberta com a maior chance numa faixa horária; em empate, vale a mais perto do destino. Ruas Sem dado não concorrem.
_Avoid_: melhor chance agora, melhor vaga, rua recomendada, sugestão

### Registros

**Registro de vaga**:
Informação voluntária de que um motorista estacionou numa rua coberta, com a faixa horária de chegada e a faixa horária de saída prevista. Não inclui o ponto do carro e só pode ser alterado ou encerrado na mesma noite.
_Avoid_: check-in, vaga ativa, estacionei

**Forma de colaborar**:
Maneira como um motorista faz registros de vaga: com a localização ligada, em que o celular propõe a rua coberta mais próxima, ou manual, em que ele escolhe a rua numa lista. Sem forma de colaborar ("nenhuma", o padrão), o motorista só consulta a chance e não faz registros de vaga.
_Avoid_: modo de consentimento, ajudar a previsão, contribuir

**Saída prevista**:
Contagem, na noite atual, de registros de vaga que indicam saída numa rua coberta e faixa horária. É mostrada à parte e não entra na chance.
_Avoid_: vaga liberando, previsão de saída
