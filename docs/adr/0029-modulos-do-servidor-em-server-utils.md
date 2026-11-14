# Módulos do servidor em `server/utils`, com auto-import do Nitro

Cada módulo do servidor (Área coberta, Observações, Chance, Panorama da noite, Registros de vaga, Métricas de uso) era uma pasta própria em `server/`, com um `index.ts` que exporta a fábrica do módulo, um `do-app.ts` com a instância real e rotas em `server/api` que importavam essas instâncias explicitamente. Decidimos mover os módulos para `server/utils/`, onde o Nitro faz auto-import: as rotas usam as funções e instâncias dos módulos sem `import`. Continua valendo o desenho de `docs/modulos.md`: cada módulo tem uma fábrica que recebe as dependências (banco, configuração) e nunca lê o relógio; as rotas só repassam a chamada, com o instante de agora; os testes chamam a interface do módulo com PGLite.

## Considered Options

- **Pasta por módulo em `server/`, com imports explícitos:** era o estado do código. Deixa clara a origem de cada função na rota, mas repete imports em todas as rotas e foge da convenção do Nuxt.

## Consequences

- Os módulos mudam de lugar, e os imports das rotas somem. Os testes continuam importando o módulo pelo caminho do arquivo, porque o Vitest não tem o auto-import do Nitro.
- Como tudo que é exportado em `server/utils` fica disponível em todas as rotas, os nomes exportados precisam ser únicos no servidor inteiro. Funções internas de um módulo não são exportadas.
- `docs/modulos.md` passa a citar `server/utils/` como lugar dos módulos.
