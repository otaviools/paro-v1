# Stack: Nuxt, Nuxt UI e PWA na Vercel; Supabase só como Postgres

O app usa Nuxt com Nuxt UI, é um PWA instalável (`@vite-pwa/nuxt`) e é publicado na Vercel. O banco é Postgres, hospedado no Supabase. Avaliamos React (Next.js) por causa do ecossistema de WebGL. Como o MapLibre GL não depende de framework (ADR 0017), as diferenças ficaram pequenas, e escolhemos Nuxt, que o plano e o roteiro técnico já usavam. O Supabase Realtime, previsto no `Arquitetura.md`, não é usado: a chance só muda quando entra uma observação (ADR 0005), e as saídas previstas da noite são lidas pelo app consultando o servidor a cada um ou dois minutos.

## Consequences

- Como só o Postgres do Supabase é usado, sem Realtime, Edge Functions nem auth, trocar de provedor de banco depois é simples.
