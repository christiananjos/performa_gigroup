---
paths:
  - "frontend/src/**/*.ts"
  - "frontend/src/**/*.tsx"
---

# Convenções de Frontend — React 18 + TypeScript

- Separe claramente componentes de apresentação (UI) de lógica de estado/negócio (hooks, services ou
  composables, conforme a stack).
- Componentes pequenos e reutilizáveis — se um componente cresce demais, quebre em subcomponentes.
- Estado local vs. global: só suba estado para um store/contexto compartilhado quando mais de um componente
  precisar dele.
- Camada de acesso a API centralizada (cliente HTTP único, tratamento de erro e loading consistentes) — nunca
  chame `fetch`/`axios` direto de dentro de um componente de apresentação.
- Código pronto para produção, sem placeholders ou `TODO`.
