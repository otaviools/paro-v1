# Registro de vaga compartilha a rua, não a posição exata

O plano dizia que a saída prevista "entra na previsão de quem está chegando" e, ao mesmo tempo, que "a localização da vaga não é compartilhada". As duas coisas não cabem juntas: para a saída entrar na previsão, o Parô precisa saber em que rua coberta a vaga vai ficar livre. Decidimos que o **registro de vaga** compartilhado tem só três campos: a rua coberta, a faixa horária de chegada e a faixa horária de saída prevista. Ele não leva coordenadas. O ponto exato do carro fica só no celular, para "Voltar até o carro". A frase do plano passa a ser "a localização *exata* da vaga não é compartilhada".

## Consequences

- Sem a localização ligada, a pessoa escolhe a rua coberta numa lista. Nesse caso, "Voltar até o carro" não fica disponível.
- Com a localização ligada, o celular usa a posição para propor a rua coberta mais próxima e guarda o ponto exato só no aparelho.
