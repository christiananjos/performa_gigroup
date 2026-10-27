# POC — Portal do Worker (frontend)

Prova de conceito da arquitetura descrita em `docs/frontend/SPEC.md`. Serve para **ver** a estrutura e as
telas da fase Básico. Não é o código de produção: o pipeline (`/inicia-orquestracao frontend`) gera o
frontend real em `frontend/`.

```bash
npm install
npm run dev        # http://localhost:5173
```

Login de demonstração: qualquer CPF com 11 dígitos e senha com 6+ caracteres. Ou abra `/?demo` para entrar
direto, já com o termo LGPD aceito. Troque o contrato no topo para ver os três momentos do worker (ativo,
em admissão, encerrado).

## O que olhar

| Arquivo | O que mostra |
|---|---|
| `src/app/modules.ts` | Registro único das trilhas; menu, rotas e roadmap saem daqui |
| `src/modules/<trilha>/index.ts` | Features da trilha com fase, rota e página (lazy) |
| `src/app/router.tsx` | Portões sessão → LGPD no `loader` e `FeatureGate` por feature |
| `src/shared/session/session.tsx` | Contrato ativo e features liberadas pelo backend |
| `src/mocks/api.ts` | API simulada do BFF, incluindo a regra de visibilidade por situação do contrato |

## Diferenças conscientes em relação à spec

- API em memória (`src/mocks/api.ts`) em vez de MSW + `fetch`; a troca é só em `src/shared/api/http.ts`.
- Sessão simulada em `sessionStorage` pelo mock; o produto usa cookie `HttpOnly` do BFF.
- CSS global único em vez de CSS Modules; sem testes, PWA, react-hook-form/zod e telemetria real.
- Primeiro acesso e esqueci a senha só exibem a descrição do fluxo.
