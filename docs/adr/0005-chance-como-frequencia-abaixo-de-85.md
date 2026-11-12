# Chance de vaga é a frequência de observações abaixo de 85% de ocupação

O plano citava "chance", "limiar de 85%" e "regra de ocupação" sem ligar uma coisa à outra. Decidimos que uma rua coberta está **cheia** numa observação quando a ocupação contada é de 85% ou mais (o limiar de Shoup, a partir do qual as pessoas começam a rodar procurando vaga). A **chance** de uma rua coberta numa faixa horária é o percentual de observações em que ela não estava cheia. Exemplo: 7 de 10 noites abaixo de 85% dá chance de 70%.

## Considered Options

- **Chance = 1 − ocupação média:** é mais simples, mas não é uma probabilidade e subestima ruas que ainda têm vagas. Uma rua com 80% de ocupação média apareceria com "chance de 20%".

## Consequences

- O protocolo de campo precisa contar, em cada observação, o total de vagas da rua coberta e quantas estão ocupadas.
- A precisão da chance depende do número de observações. Com poucas noites medidas, ela muda em saltos grandes.
