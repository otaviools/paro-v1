# Formatação e lint pelo @nuxt/eslint com stylistic, sem Prettier

O repositório não tinha ferramenta de formatação, e o código estava escrito com aspas simples e sem ponto e vírgula. O editor de quem programa reformatava com o padrão do Prettier (aspas duplas e ponto e vírgula), misturando estilos no mesmo arquivo. Decidimos usar só o ESLint, pelo módulo oficial `@nuxt/eslint`, com as regras de formatação do ESLint Stylistic ligadas: aspas simples e sem ponto e vírgula, o estilo que o código já usa. O editor formata ao salvar pelo ESLint.

## Considered Options

- **Prettier + @nuxt/eslint:** Prettier formata e o ESLint só aponta erros. Usa aspas duplas e ponto e vírgula, o padrão do Prettier. Exigiria reformatar o código todo de uma vez e manter duas ferramentas que podem conflitar.
- **Prettier configurado com aspas simples:** mantém o estilo atual, mas continua com duas ferramentas para a mesma tarefa.

## Consequences

- Não existe `.prettierrc` no repositório. A formatação do Prettier no editor precisa ficar desligada para este projeto, e a do ESLint ligada.
- `npm run lint` passa a fazer parte das verificações, junto com typecheck, testes e build.
