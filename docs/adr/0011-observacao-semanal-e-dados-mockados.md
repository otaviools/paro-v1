# Observação semanal pela equipe; dados mockados até o semestre de 2027

Pelo cronograma do plano, as observações paravam na semana 4 e o lançamento era na semana 11. A base de todas as chances chegaria ao lançamento com 7 semanas ou mais (ADR 0008), e os registros de vaga não repõem observações (ADR 0009). Decidimos que, depois da etapa "Medir", a equipe faz 1 noite de observação por semana, nas cinco ruas cobertas, das 18h às 23h, em revezamento, até o fim do semestre. Usuários não fazem observações. Como o próximo semestre letivo só começa em fevereiro ou março de 2027, até lá o produto é construído e demonstrado só com dados mockados.

## Considered Options

- **Parar depois da etapa "Medir":** é o menor esforço, mas a base ficaria velha justamente no lançamento.
- **Observações feitas por usuários pelo app:** abriria espaço para contagens falsas sem identificador (ADR 0004) e, ao contrário das saídas previstas, isso afetaria a chance.

## Consequences

- As "semanas" do cronograma do plano passam a contar a partir do início do semestre letivo de 2027.
- A construção do app (etapa "Construir") pode começar antes da etapa "Medir", usando dados mockados.
