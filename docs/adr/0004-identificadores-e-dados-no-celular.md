# Registros sem identificador; sessões com identificador mensal

O plano promete "sem cadastro", mas também quer rotina salva, histórico que pode ser apagado e uso recorrente medido por "dispositivo anônimo". Um identificador fixo de aparelho, ligado a ruas e horários repetidos, pode identificar uma pessoa. Pela LGPD, isso é dado pessoal pseudonimizado. Decidimos que rotina, local padrão, histórico e o ponto do carro ficam só no celular. Os registros de vaga vão ao servidor sem nenhum identificador. Só as sessões levam um identificador aleatório que muda todo mês, o que basta para medir a meta "30% voltam na semana seguinte".

## Considered Options

- **(a) Nenhum identificador:** é o mais simples, mas a recorrência só poderia ser estimada por uma pergunta no app.
- **(b) Identificador fixo de aparelho em registros e sessões:** mede com precisão e permite apagar dados no servidor. Foi rejeitado porque guarda dado pseudonimizado ligado a deslocamentos e exige política de retenção e aviso de privacidade.

## Consequences

- "Apagar histórico" limpa só o celular. Os registros já enviados ficam no servidor, mas não podem ser ligados a ninguém.
- A recorrência medida perde quem volta depois da troca mensal do identificador. É uma imprecisão aceita.
- Sessões e registros de vaga não podem ser cruzados no servidor.
