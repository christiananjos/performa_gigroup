---
name: cicd-pipeline-expert
description: Especialista em pipelines de CI/CD no Azure DevOps (pipelines YAML, Boards, Repos, Environments, gates de release) e GitHub Actions (workflows, actions reutilizáveis, environments) — automação de build/test/deploy, políticas de branch, estratégias de deployment (blue-green, canary, rolling), gestão de artefatos e os steps de build específicos da stack deste projeto. Use esta skill sempre que o usuário perguntar sobre YAML de pipeline, falha de build, estratégia de deploy, política de branch, gates de release, workflows do GitHub Actions, ou disser "como configuro CI/CD pra isso" — mesmo sem nomear uma plataforma específica.
---

# CI/CD Pipeline Expert

Cobre Azure DevOps e GitHub Actions. Pergunte qual plataforma se não estiver claro — a sintaxe de pipeline não é intercambiável, embora os conceitos de base (stages, jobs, artefatos, gates) se mapeiem entre os dois.

## Fluxo de trabalho

1. **Identifique a plataforma** (Azure DevOps vs GitHub Actions) e se é um pipeline novo ou correção de um existente.
2. **Identifique a stack e os comandos de build** — a stack deste projeto é:
   **.NET** — `dotnet restore`, `dotnet build`, `dotnet test` e `dotnet publish` são os steps principais. O artefato publicado (saída do `publish`) é o que os estágios de deploy consomem.

   **React** — `npm ci` (nunca `npm install` em CI, que pode ignorar o lockfile), `npm run lint`, `npm test -- --run` (Vitest em modo não interativo; com Jest, `npm test -- --ci`) e `npm run build`. O artefato é o `dist/` (Vite) ou `build/` (Create React App), publicado num host estático/CDN pelos estágios de deploy.
   Como variáveis de build (`VITE_*`, `REACT_APP_*`) ficam embutidas no bundle, um artefato buildado com config de staging **não** pode ser promovido pra produção: ou você builda por ambiente (aceitando o custo), ou carrega a configuração em runtime (ex: um `config.json` servido junto) e mantém um único artefato.
3. Carregue `references/azure-devops.md` ou `references/github-actions.md` para sintaxe YAML específica da plataforma antes de escrever código de pipeline — não chute nomes de task ou versões de action de memória.

## Knowledge Engine

Antes de vasculhar o projeto inteiro, verifique primeiro se `knowledge/` existe. Leia `knowledge/index.json` e use `knowledge/vault/06 - Arquitetura/` e `knowledge/vault/07 - Integrações/` como referência (serviços, ambientes, dependências externas já mapeados) — é mais rápido e usa menos tokens do que reler o projeto inteiro a cada pergunta. Só faça uma busca ampla no repositório (YAML de pipeline existente, workflows) quando `knowledge/` não existir ou não tiver referência suficiente.

## Princípios de design de pipeline

- **Falhe rápido**: coloque as checagens mais baratas e com maior sinal primeiro (lint, restore, build) antes dos steps lentos (testes de integração, deploy).
- **Separe build de release**: o build produz um artefato versionado e imutável uma vez; os estágios de release/deploy consomem esse mesmo artefato em cada ambiente (dev — staging — prod). Nunca rebuilde por ambiente — isso arrisca drift entre ambientes.
- **Cacheie dependências**: os pacotes que o projeto restaura a cada build devem ser cacheados com chave baseada no hash do lockfile, pra reduzir tempo de build.
- **Privilégio mínimo**: service connections / secrets escopados por ambiente, não uma credencial única pra todo o pipeline.

## Estratégias de deployment

- **Blue-green**: dois ambientes idênticos, troca de tráfego no load balancer/slot. Downtime quase zero, rollback instantâneo fácil (troca de volta). Boa recomendação padrão para Azure App Service (deployment slots) ou Kubernetes.
- **Canary**: roteia uma pequena % do tráfego pra nova versão, observa métricas, aumenta gradualmente. Melhor pra pegar problemas sob carga real, mas precisa de infraestrutura de divisão de tráfego e monitoramento pra valer a pena.
- **Rolling**: substitui instâncias gradualmente. Padrão na maioria dos orquestradores de container; mais simples de configurar, mas rollback é mais lento que blue-green.
- Recomende blue-green como padrão pra maioria dos apps web no Azure, a menos que o usuário precise especificamente de ramp gradual de tráfego (canary) ou tenha restrição de recursos (rolling).

## Políticas de branch e Git flow

- Mínimo pra um repo de time: exigir PR (sem push direto pra main), exigir pelo menos uma build validation passando, exigir pelo menos um reviewer aprovando.
- Condicione o build do PR a `dotnet build` + `dotnet test` (unitários rápidos; testes de integração podem rodar pós-merge se forem lentos), mais `dotnet list package --vulnerable --include-transitive` como gate de dependência.

- Condicione o build do PR a `npm ci` + `npm run lint` + `npm test -- --run` + `npm run build`, mais `npm audit --audit-level=high` como gate de dependência. Suíte E2E completa (Playwright/Cypress) costuma ser lenta demais pro PR — rode um smoke E2E dos fluxos críticos no PR e a suíte inteira pós-merge ou agendada.
- Trunk-based (branches de feature de vida curta, merges frequentes na main) geralmente é preferível a branches de vida longa no estilo GitFlow pra times fazendo deploy contínuo.

## Arquivos de referência

- `references/azure-devops.md` — Estrutura de pipeline YAML, referência de tasks, environments/gates, configuração de política de Boards/Repos.
- `references/github-actions.md` — Estrutura de workflow YAML, workflows reutilizáveis/composite actions, environments, actions comuns da stack deste projeto.

Leia a referência relevante antes de gerar YAML de pipeline — nomes e versões de task/action mudam e chutar produz pipelines quebrados.

## Monorepo (backend/ + frontend/)

Este projeto é um monorepo: o código fica em `backend/` e `frontend/`. Ao gerar pipelines:

- Um workflow por deploy (back e front separados), cada um com `on.push.paths` / `on.pull_request.paths`
  restrito à sua pasta (`backend/**` ou `frontend/**`) mais o próprio arquivo do workflow, para uma mudança só
  no front não disparar o deploy do back.
- Os steps de build, teste e publish rodam com `working-directory: backend` (ou `frontend`); em Docker, o
  `context` aponta para a subpasta (`context: ./backend`), nunca para a raiz.
- No Azure DevOps, o equivalente é `trigger.paths.include` e `workingDirectory`.
- Cache de dependências usa o lockfile da subpasta (`frontend/package-lock.json`, `backend/**/*.csproj`).
