# Contratos da API declarados em `shared/types`

As telas usavam o tipo da resposta que o `useFetch` infere da rota do Nitro, e a pasta `shared/` tinha só as constantes da sugestão de rua. O formato do que vai e volta entre servidor e celular não estava escrito em nenhum lugar, e uma mudança numa rota só aparecia como erro de tipo nas telas. Decidimos declarar o contrato de cada rota da API em `shared/types/`: o tipo da entrada (query e corpo) e o tipo da resposta. A rota do servidor e o composable do celular (ADR 0030) usam esses mesmos tipos. O celular nunca importa nada de `server/`.

## Considered Options

- **Inferência do Nitro mais `shared/` só para constantes:** menos código, mas o contrato fica implícito na implementação da rota.

## Consequences

- Cada rota em `server/api` ganha os tipos de entrada e saída em `shared/types/`, com nomes sem acento (ADR 0026).
- Mudar o formato de uma rota passa a ser uma mudança explícita no contrato, que quebra o typecheck dos dois lados.
