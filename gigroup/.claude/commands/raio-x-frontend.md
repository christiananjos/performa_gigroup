---
description: Faz uma varredura técnica completa (raio-x) de um projeto frontend existente — stack e build, arquitetura e roteamento, gerência de estado, camada de API, componentes/UX e infraestrutura — e grava a documentação em docs/raw/, separada por tema, pronta para ser consumida por um subagente. Ideal para projetos legados sem documentação prévia.
---

# Raio-X de Projeto

Você é um especialista em arqueologia de código: recebe um projeto sem documentação (frequentemente legado, sem ninguém disponível pra explicar as decisões) e produz um relatório técnico completo do que existe de fato no código — não do que deveria existir.

**Princípio central**: nunca assuma. Toda afirmação no relatório final precisa vir de algo que você efetivamente leu no código, não de convenção assumida por nome de pasta. Se um padrão parece existir mas você não confirmou em pelo menos 2-3 arquivos, marque como "aparenta ser X, a confirmar" em vez de afirmar como fato.

## Estratégia de investigação

Use busca lexical progressiva (grep/glob), do geral pro específico — não tente ler o projeto inteiro de uma vez:

1. **Mapa de superfície primeiro**: liste a árvore de diretórios (2-3 níveis), ignorando `node_modules/`, `dist/` e `.next/`. A nomenclatura já sugere hipóteses (`pages/`, `features/`, `components/`, `store/`, `services/` — mas confirme antes de afirmar).
2. **Manifestos e configuração primeiro**: `package.json`, lockfile, `tsconfig.json`, config do bundler (`vite.config`, `webpack.config`, `angular.json`, `next.config`), `.env*`, `Dockerfile`, `.github/workflows/` — revelam framework, versão, dependências, scripts e infraestrutura declarada sem precisar ler lógica ainda.
3. **Depois o ponto de entrada e o roteamento**: `main.ts(x)` / `index.tsx` / `app.module.ts` / `App.vue`, arquivo de rotas — é o esqueleto por onde tudo passa.
4. **Depois o estado**: store global, contextos, composables/hooks compartilhados, cache de dados de servidor.
5. **Depois a camada de API**: cliente HTTP, interceptors, tipos/DTOs, mocks.
6. **Por último, os componentes de tela**: as telas principais e os componentes compartilhados.

Priorize amplitude antes de profundidade: é mais valioso confirmar a existência e o papel de 30 arquivos-chave do que ler 3 arquivos linha por linha no início.

## O que investigar em cada frente

### 1. Stack e ambiente
- Framework e versão (`package.json` → `dependencies`), linguagem (TypeScript ou JavaScript, e o quão estrito é o `tsconfig.json`).
- Gerenciador de pacotes (pelo lockfile presente) e bundler/ferramenta de build.
- Dependências que denunciam padrões: biblioteca de estado (Redux, Zustand, Pinia, NgRx), de dados (React Query, SWR, Apollo), de formulário (React Hook Form, Formik), de UI (MUI, Tailwind, PrimeNG, Vuetify), de teste (Vitest, Jest, Playwright, Cypress).
- Como o projeto roda e builda: scripts do `package.json`, `Dockerfile`, variáveis de ambiente esperadas.

### 2. Arquitetura e roteamento
- Como o código está organizado de fato: por feature (tudo da funcionalidade junto) ou por tipo técnico (todas as páginas numa pasta, todos os serviços em outra) — e se a convenção é seguida de forma consistente ou só em parte.
- Mapa de rotas: quais telas existem, quais são públicas e quais protegidas, como é feito o code splitting / lazy loading.
- Guards de rota e redirecionamentos — e se existe verificação equivalente no servidor (se não houver, isso é um ponto de atenção, não um detalhe).
- Renderização: SPA pura, SSR/SSG (Next, Nuxt, Angular Universal), ou híbrido.
- Camadas dentro do frontend: onde mora a lógica de negócio (componente, hook/composable/service, store) — em projeto legado é comum regra de negócio dentro do componente de tela.

### 3. Gerência de estado
- Estado global: qual biblioteca, quais slices/stores existem e o que cada um guarda.
- Estado de servidor: existe cache de dados (React Query, SWR, Apollo, NgRx Entity) ou cada tela busca e guarda por conta própria?
- Estado de formulário e de UI, e o que é persistido no navegador (`localStorage`, `sessionStorage`, cookie) — anote o que é persistido, porque isso reaparece na análise de segurança.
- Sinais de duplicação: o mesmo dado mantido em mais de um lugar é o débito técnico mais comum aqui.

### 4. Camada de API e contratos
- Cliente HTTP em uso (`fetch`, `axios`, `HttpClient`) e se há um wrapper único ou chamadas espalhadas pelos componentes.
- Interceptors: token, refresh, tratamento centralizado de erro, retry.
- Contratos: tipos/DTOs das respostas, se são escritos à mão ou gerados de um OpenAPI, e o quanto refletem a API real.
- Endpoints consumidos: liste-os com o arquivo onde são chamados — esse mapa é o que um backend precisa pra não quebrar o frontend.

### 5. Componentes, UX e acessibilidade
- Componentes compartilhados e se existe um design system (próprio ou biblioteca), tokens de tema, suporte a tema claro/escuro.
- Padrões de estilo: CSS Modules, Tailwind, styled-components, SCSS — e se convivem mais de um.
- Internacionalização e formatação (data, moeda), se houver.
- Acessibilidade: uso de elementos semânticos e rótulos, foco visível, navegação por teclado — mapeie o estado atual, sem transformar isso numa auditoria completa.
- Tratamento de carregamento e de erro nas telas: existe padrão (skeleton, toast, boundary) ou cada tela resolve do seu jeito?

### 6. Infraestrutura e qualidade
- Build e deploy: onde o site é publicado (host estático, CDN, container), como as variáveis de ambiente entram (embutidas no build ou carregadas em runtime).
- Autenticação no browser: onde o token fica, como o logout limpa a sessão, como a expiração é tratada — mapeamento, não auditoria (para auditar, o projeto tem a skill `frontend-security-expert` e o agente `06-security-scan-sdd`).
- Observabilidade: monitoramento de erro (Sentry e afins), analytics, logs.
- Testes existentes: o que está coberto de fato (unitário, componente, E2E) e o que está abandonado/ignorado (`skip`, `only`).
- CI/CD: se houver `.github/workflows/` ou `azure-pipelines.yml`, resuma o pipeline existente.

## Saída: gravação em docs/raw/

Este comando não apresenta o relatório só no chat — ele grava a documentação diretamente em `docs/raw/` na raiz do projeto, em arquivos separados por tema, para que o subagente que consome essa pasta encontre cada assunto isolado.

1. Antes de escrever, verifique se `docs/raw/` já existe; se não existir, crie a pasta.
2. Se algum dos arquivos abaixo já existir de uma execução anterior, sobrescreva-o por completo — não faça merge parcial com conteúdo antigo, já que o código pode ter mudado desde a última varredura.
3. Grave exatamente estes arquivos, cada um contendo só a seção correspondente (sem repetir o título do projeto em todos):

| Arquivo | Conteúdo |
|---|---|
| `docs/raw/resumo.md` | Resumo executivo: o que é a aplicação, framework e stack principal, nível de saúde arquitetural percebido (2-4 frases) + índice linkando os demais arquivos desta lista |
| `docs/raw/arquitetura.md` | Organização do código, mapa de rotas (públicas e protegidas), estratégia de renderização, onde mora a lógica de negócio |
| `docs/raw/estado.md` | Estado global e de servidor, o que é persistido no navegador, duplicação de dados encontrada |
| `docs/raw/api-e-contratos.md` | Cliente HTTP, interceptors, tipos/DTOs, lista de endpoints consumidos com o arquivo que os chama |
| `docs/raw/componentes-e-ux.md` | Componentes compartilhados, design system e estilo, i18n, acessibilidade, padrões de carregamento e erro |
| `docs/raw/infraestrutura.md` | Build e deploy, variáveis de ambiente, autenticação no browser (mapeamento), observabilidade, testes, CI/CD |
| `docs/raw/pontos-de-atencao.md` | Riscos, débito técnico, ambiguidades encontradas + seção "O que não foi possível confirmar" |

4. Cada arquivo temático começa com um H1 simples (ex: `# Arquitetura`), sem repetir o nome do projeto — isso já está no `resumo.md`.
5. Depois de gravar todos os arquivos, confirme no chat com uma lista curta do que foi criado/atualizado em `docs/raw/` — não repita o conteúdo completo no chat, já que ele está nos arquivos.

## Regras finais

- Este relatório serve pra alguém (ou pra um subagente) que nunca viu o projeto conseguir se situar rápido — priorize clareza sobre exaustividade nos primeiros parágrafos de cada arquivo, e deixe detalhe fino pra quem quiser aprofundar.
- Sempre cite caminhos de arquivo reais (ex: `frontend/src/features/pedidos/PedidoForm.tsx`) como evidência das afirmações, não descrições vagas.
- Nunca leia `node_modules/`, `dist/` ou artefatos de build — o que interessa é o código-fonte do projeto.
- Se o projeto for grande demais pra cobrir tudo numa passada, avise isso no `resumo.md` e priorize as áreas que o usuário pediu (ou, na ausência de pedido específico, priorize arquitetura → estado → camada de API, nessa ordem).
