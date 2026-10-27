# Backend — .NET 10 (Clean Architecture, somente backend)

Parte do monorepo (veja o `README.md` da raiz). O código desta frente fica em `backend/src/`;
memória (`knowledge/`), agentes (`.claude/`), especificação (`docs/backend/SPEC.md`) e relatórios
(`output/`) ficam na raiz.

## Como rodar

Todos os comandos rodam **de dentro desta pasta**:

```bash
cd backend
dotnet build
dotnet test
```

## Pipeline

Para gerar ou alterar código aqui, rode na raiz do projeto: `/inicia-orquestracao backend`.
