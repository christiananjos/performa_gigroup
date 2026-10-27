# Backend — atenção ao abrir esta pasta

Este projeto é um **monorepo**. O `knowledge/`, o `.claude/` (agentes, comandos, skills, rules), o `docs/` e o
`output/` ficam na **raiz do repositório** (`..`), compartilhados com a outra frente.

- **Abra o projeto pela raiz**, não por `backend/`. Abrindo só esta pasta, os agentes, comandos e skills do pipeline
  podem não carregar.
- Se esta sessão foi aberta aqui, **avise o usuário** antes de gravar qualquer coisa de memória, e resolva os
  caminhos a partir da raiz (`git rev-parse --show-toplevel`). **Nunca crie** `knowledge/`, `docs/` ou `.claude/`
  dentro de `backend/`.
- Regras completas: `../CLAUDE.md`.
- Build e testes: rode de dentro desta pasta (`dotnet build`, `dotnet test`).
