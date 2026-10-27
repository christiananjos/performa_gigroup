# Portal do Worker (Gi Group) — Especificação de Frontend

## 📋 Visão Geral

**Cliente:** Gi Group Holding — multinacional de RH e staffing presente em mais de 30 países (trabalho temporário e
permanente, recrutamento, BPO e desenvolvimento de força de trabalho).

**Produto:** Portal do Worker — o canal em que o trabalhador alocado pela Gi Group (o *worker*) acessa as
informações da sua relação com a empresa: contratos, admissão, documentos, pagamentos, férias, desligamento e
atendimento. Self-service: o objetivo é o worker resolver sozinho o que hoje exige contato com o RH/consultor.

**Público:** worker em admissão, worker ativo (temporário ou efetivo, alocado em empresa cliente — a *tomadora*)
e ex-worker (contrato encerrado, que ainda precisa de TRCT, informe de rendimentos e, no futuro, rehiring). Perfil
predominante: acesso pelo celular, letramento digital variado, conexão móvel instável.

**Stack:** React 18 + TypeScript + Vite (somente frontend). Consome a API do `backend/` (.NET 10, descrita em
`docs/backend/SPEC.md`), que atua como **BFF** — integrações com folha, admissão, ponto e demais sistemas da Gi
Group ficam atrás dele, nunca no frontend.

**Escopo desta rodada:** fase **Básico (Q4/2026 – Q1/2027)** do roadmap revisado — REQ-001 a REQ-022. As fases
seguintes estão descritas em [Roadmap](#-roadmap-fora-do-escopo-desta-rodada) só para que a arquitetura já as
comporte; **não devem ser implementadas** nesta rodada.

> **Fonte:** "Roadmap Portal do Worker — revisado (1/3, 2/3, 3/3)", slides 5–7. Onde a tabela inicial de trilhas
> diverge dos slides revisados, vale o slide revisado. Itens marcados como *Premissa* não vieram de documento do
> cliente e precisam de confirmação (ver [Questões em aberto](#-questões-em-aberto)).

---

## 🧱 Arquitetura de Frontend

### Decisões base

| Tema | Decisão | Por quê |
|---|---|---|
| Build | Vite + React 18 + TypeScript `strict` | Padrão do monorepo; build rápido |
| Canal | Web responsiva **mobile-first**, instalável como PWA (manifest + service worker) | Um código para celular e desktop; PWA abre caminho para biometria (WebAuthn) na fase Desempenho e para "Aviso de novo pagamento" (push) |
| Roteamento | React Router 6 (data router), *lazy* por módulo | Guard de sessão no `loader`, antes de renderizar dado privado; code splitting por trilha |
| Estado do servidor | TanStack Query v5 | Cache, loading/erro e revalidação padronizados; nada de `useEffect` + `fetch` em tela |
| Estado global de cliente | Só dois contextos: **Sessão** (worker logado + features liberadas) e **Contrato ativo** | Tudo o mais é estado local ou cache do Query; sem Redux |
| Formulários | react-hook-form + zod | Validação declarativa; o mesmo schema tipa o payload |
| Estilo | CSS Modules + design tokens em CSS custom properties (`src/shared/ui/tokens.css`) | Sem dependência de UI kit; tokens trocam com o manual de marca Gi Group |
| Mocks | MSW (Mock Service Worker) em dev e nos testes | Front avança antes do backend; o contrato de API fica versionado em `src/mocks/` |
| Testes | Vitest + Testing Library (unit/componente) e Playwright (E2E) | Ver [Testes](#-testes) |
| Idioma | pt-BR, textos centralizados por módulo | Escopo é a operação Brasil (LGPD, TRCT, seguro-desemprego). Sem lib de i18n até haver outro país no escopo |

### Estrutura de pastas

Organização **por trilha do roadmap** (feature-sliced). Cada trilha é um módulo isolado; o módulo nunca importa de
outro módulo — o que é compartilhado sobe para `shared/`.

```
frontend/src/
├── app/                      # composição: providers, router, layout (shell)
│   ├── main.tsx
│   ├── providers.tsx         # QueryClient, Sessão, Contrato ativo
│   ├── router.tsx            # monta as rotas a partir do registro de módulos
│   ├── modules.ts            # REGISTRO: lista de módulos/trilhas
│   └── layout/               # AppShell: cabeçalho, seletor de contrato, menu, bottom nav (mobile)
├── modules/                  # uma pasta por trilha do roadmap
│   ├── fundacao-acesso/      # login, cadastro, perfil, LGPD, contratos, hub de links
│   ├── onboarding-admissao/  # Programa Acolhendo, status da admissão
│   ├── gestao-pessoal/       # ficha de registro, férias, dados cadastrais, TRCT, seguro-desemprego
│   ├── financeiro/           # holerite, informe de rendimentos, comprovantes, recibos de férias
│   ├── atendimento/          # FAQ, BOT, canais de contato, ouvidoria
│   ├── ponto-frequencia/     # (fase Otimização — ainda sem código)
│   ├── comunicacao-cultura/  # (fase Desempenho+)
│   ├── treinamento/          # (fase Encantamento+)
│   ├── beneficios-saude/     # (fase Desempenho+)
│   └── engajamento-rehiring/ # (fase Desempenho+)
│       └── <trilha>/
│           ├── index.ts      # ModuleDefinition: features, rotas e itens de menu da trilha
│           ├── api.ts        # hooks do TanStack Query da trilha (useHolerites, ...)
│           ├── types.ts
│           ├── pages/        # uma página por feature
│           └── components/   # componentes exclusivos da trilha
├── shared/
│   ├── api/                  # cliente HTTP único (fetch), erros tipados, query keys
│   ├── session/              # SessionProvider, ContractProvider, guards
│   ├── ui/                   # design system: tokens, Button, Card, DocumentList, EmptyState, ...
│   ├── lib/                  # formatadores (moeda, data, CPF mascarado), download de PDF
│   └── telemetry/            # track(evento) — base do Dashboard de uso
└── mocks/                    # handlers MSW = contrato de API enquanto o backend não existe
```

### Registro de módulos e feature flags

O roadmap tem 9 trilhas e 4 fases; features entram e saem por fase, por tomadora e por tipo de worker. Para isso
não virar `if` espalhado pelo código, cada trilha declara suas features num `ModuleDefinition`:

```ts
type Fase = 'basico' | 'desempenho' | 'encantamento' | 'otimizacao';

interface Feature {
  id: string;            // ex.: 'financeiro.holerite' — mesmo id usado pelo backend nas flags
  titulo: string;
  fase: Fase;
  rota?: string;         // ausente = feature ainda sem tela
  page?: () => Promise<{ default: React.ComponentType }>; // lazy import
}

interface ModuleDefinition {
  id: string;            // ex.: 'financeiro'
  trilha: string;        // ex.: 'Financeiro do Trabalhador'
  features: Feature[];
}
```

- O backend responde `GET /api/me/features?contratoId={id}` com a lista de ids liberados para **este** worker (fase em produção,
  tomadora, situação do contrato). O frontend só roteia e mostra no menu o que estiver na lista **e** tiver `page`.
- Liberar uma feature de uma fase nova = publicar a página e ligar a flag no backend; sem mexer no menu nem no
  router.
- Rota de feature desligada responde 404 do app (não "tela vazia").

### Sessão, autenticação e contrato ativo

- **Sessão em cookie `HttpOnly; Secure; SameSite=Strict`** emitido pelo BFF. O frontend nunca lê nem guarda token
  (nada em `localStorage`/`sessionStorage`). Requisições mutáveis enviam o header anti-CSRF devolvido pelo BFF.
- Toda rota privada passa por um `loader` que chama `GET /api/me`; 401 redireciona para `/entrar` **antes** de
  renderizar qualquer dado.
- Ordem de portões após o login: (1) sessão válida → (2) consentimento LGPD vigente aceito → (3) contrato ativo
  selecionado → app.
- **Contrato ativo**: o worker pode ter vários contratos (ativos e encerrados, em tomadoras diferentes). O
  contrato selecionado fica no cabeçalho e **toda query de dado contratual leva o `contratoId` na query key** —
  trocar de contrato troca o conteúdo da tela inteira sem lógica extra.
- Biometria (fase Desempenho) entra como WebAuthn/passkey no mesmo fluxo de login — por isso a sessão não pode
  depender de senha guardada no cliente.

### Documentos (PDF)

Holerite, informe, TRCT, recibos e guias seguem um único componente `DocumentList` + `GET .../{id}/pdf`. O PDF
chega como blob e abre via `URL.createObjectURL` (revogado depois). O service worker **não** guarda em cache
nenhuma resposta de `/api/` — documento pessoal não fica no aparelho.

### Telemetria (base do "Dashboard de uso", fase Otimização)

O Dashboard de uso só terá dados históricos se o evento for coletado desde o Básico. `shared/telemetry` expõe
`track(nome, props)` e o shell registra automaticamente `page_view` (id da feature) e cada módulo registra
`document_download`, `form_submit`, `link_out`. **Nenhum dado pessoal** (CPF, nome, valores) vai nos eventos — só
ids de feature, tipo de documento e o id pseudonimizado que o BFF fornecer.

### Qualidade de experiência

- **Acessibilidade:** WCAG 2.1 AA; alvo de toque ≥ 44 px; navegação por teclado; textos em linguagem simples.
- **Performance:** JS inicial ≤ 200 KB gzip (módulos em chunks *lazy*); LCP ≤ 2,5 s em 4G; skeleton em toda lista.
- **Resiliência:** Error Boundary por módulo (uma trilha fora do ar não derruba o portal); estados vazio, carregando
  e erro com "tentar de novo" em toda tela de dados.
- **Shell:** mobile com bottom nav de até 5 destinos (Início, Pagamentos, Documentos, Ajuda, Perfil) + menu
  completo; desktop com menu lateral agrupado por trilha. Segue `.claude/rules/frontend-ux-laws.md`.

---

## 🎯 Requisitos Funcionais (fase Básico)

### Trilha: Fundação & Acesso

### REQ-001: Login, primeiro acesso e recuperação de senha
- Login com CPF (máscara, validação de dígito) e senha.
- Primeiro acesso: CPF + data de nascimento → código de verificação (SMS ou e-mail cadastrado) → criação de senha.
  Fluxo em etapas com indicador "passo X de 3".
- "Esqueci minha senha" com o mesmo envio de código.
- Mensagens de erro de login genéricas (não revelar se o CPF existe).
- Logout limpa sessão no BFF e todo estado do cliente (cache do Query incluído) e volta para `/entrar`.

### REQ-002: Perfil
- Exibe nome, CPF mascarado (`***.456.789-**`), e-mail, celular e foto/iniciais.
- Edição de e-mail e celular com confirmação por código; demais dados cadastrais seguem REQ-010.

### REQ-003: LGPD e consentimento
- Após o login, se houver termo vigente não aceito, exibir o termo (versão e data) antes de qualquer outra tela.
- Aceite registrado no backend com versão do termo; recusa encerra a sessão com explicação.
- Página "Privacidade" no perfil: termo aceito, data do aceite e link para o canal do encarregado de dados (DPO).

### REQ-004: Contratos ativos e inativos
- Lista dos contratos do worker: tomadora, cargo, tipo (temporário/efetivo), início, fim (ou previsão) e situação.
- Seletor de contrato ativo no cabeçalho; padrão = contrato ativo mais recente.
- Contrato encerrado continua acessível (documentos e informes), com selo "Encerrado".

### REQ-005: Hub de links de sistemas
- Lista de atalhos para sistemas externos (ex.: ponto da tomadora, benefícios) vinda do backend, filtrada por
  contrato. Abre em nova aba com aviso de que está saindo do portal; registra `link_out`.

### REQ-006: Início (painel do worker)
- Resumo do contrato ativo, último pagamento (valor líquido e data), pendências (ex.: admissão em andamento,
  termo LGPD) e atalhos para as features mais usadas.
- Ação principal única por estado: "Ver holerite" (ativo), "Acompanhar admissão" (em admissão), "Baixar TRCT"
  (desligado).

### Trilha: Onboarding & Admissão

### REQ-007: Programa Acolhendo
- Card de acesso ao Programa Acolhendo (link externo informado pelo backend) para workers em admissão ou nos
  primeiros dias de contrato. *Premissa:* janela de exibição definida pelo backend.

### REQ-008: Status da admissão
- Linha do tempo das etapas da admissão (ex.: documentos recebidos → exame admissional → contrato → integração)
  com etapa atual em destaque e próxima ação esperada do worker.
- Somente leitura nesta fase (upload de documentos é fase Desempenho).

### Trilha: Gestão Pessoal (self-service)

### REQ-009: Ficha de registro
- Visualização da ficha de registro do contrato ativo e download em PDF.

### REQ-010: Férias e dados cadastrais
- Férias: período aquisitivo atual, saldo de dias, férias programadas e histórico.
- Dados cadastrais: visualização (endereço, dependentes, dados bancários mascarados) e **solicitação** de
  alteração com anexo de comprovante. *Premissa:* alteração passa por aprovação do RH — a tela mostra o status da
  solicitação, nunca edita o dado diretamente.

### REQ-011: TRCT e comprovante
- Para contrato encerrado: download do TRCT e do comprovante de pagamento da rescisão.

### REQ-012: Guia do seguro-desemprego
- Para contrato encerrado elegível: download da guia e orientação de próximos passos (link gov.br).

### Trilha: Financeiro do Trabalhador

### REQ-013: Holerite digital
- Lista por competência (mês/ano) do contrato ativo; detalhe com proventos, descontos e líquido; download em PDF.
- *Premissa:* histórico dos últimos 24 meses.

### REQ-014: Informe de rendimentos
- Lista por ano-calendário; download em PDF. Disponível também para contrato encerrado.

### REQ-015: Comprovantes de pagamento
- Lista de comprovantes de crédito (salário, adiantamento, rescisão) por data; download em PDF.

### REQ-016: Recibos de férias
- Lista de recibos por período de gozo; download em PDF.

### Trilha: Atendimento & Suporte

### REQ-017: Central de dúvidas (FAQ)
- Perguntas agrupadas por tema, com busca por texto. Conteúdo vem do backend (gerenciável sem deploy).

### REQ-018: Atendimento via BOT
- Acesso ao assistente virtual a partir da FAQ e do botão "Ajuda". *Premissa:* o BOT é um produto existente da Gi
  Group incorporado via widget/link; o portal não implementa o motor de conversa.

### REQ-019: Canais de contato
- Telefones, WhatsApp e e-mail de atendimento, filtrados pela unidade/filial do contrato ativo.

### REQ-020: Ouvidoria e sugestões
- Formulário com tipo (elogio, sugestão, reclamação, denúncia), mensagem e opção de envio anônimo.
- Retorna número de protocolo na tela de confirmação.

### Transversais

### REQ-021: Arquitetura modular com feature flags
- Registro de módulos e `GET /api/me/features` conforme a seção [Arquitetura](#-arquitetura-de-frontend).
- Menu, rotas e atalhos do Início derivam exclusivamente do registro + flags.

### REQ-022: Telemetria de uso
- `track()` com eventos `page_view`, `document_download`, `form_submit`, `link_out`, enviados em lote para
  `POST /api/telemetria`, sem dados pessoais.

---

## 🏗️ Regras de Negócio

### BR-001: Acesso somente aos próprios dados
O worker vê exclusivamente dados dos seus contratos. O frontend nunca envia `workerId`; o BFF o deriva da sessão.

### BR-002: Escopo por contrato
Todo dado contratual (holerite, férias, ficha, comprovantes, links, canais) é filtrado pelo contrato ativo
selecionado. Informe de rendimentos é por CPF/ano e independe do contrato.

### BR-003: Consentimento LGPD obrigatório
Sem aceite da versão vigente do termo, nenhuma tela além do termo e do logout fica acessível. Nova versão do termo
exige novo aceite.

### BR-004: Visibilidade por situação do contrato
- Em admissão: Início, Status da admissão, Programa Acolhendo, Atendimento, Perfil.
- Ativo: todas as features da fase, exceto TRCT e seguro-desemprego.
- Encerrado: documentos históricos, informe, TRCT, seguro-desemprego, Atendimento.
A regra é aplicada pelo backend em `GET /api/me/features`; o frontend só obedece.

### BR-005: Dados sensíveis mascarados
CPF, conta bancária e PIS aparecem mascarados por padrão. Valores de pagamento só nas telas financeiras e no
Início (último líquido).

### BR-006: Sessão
Expira após 15 minutos de inatividade (*Premissa*) com aviso 1 minuto antes; ao expirar, volta ao login preservando
a rota de destino.

### BR-007: Ouvidoria anônima
Manifestação marcada como anônima não envia identificação do worker; o protocolo é o único vínculo.

---

## 🗄️ Modelo de Dados (telas/estado)

### Worker (`GET /api/me`)
- id (string, pseudonimizado), nome, cpfMascarado, email, celular
- consentimentoPendente (bool), versaoTermo (string)

### Contrato
- id (UUID), tomadora (string), cargo (string)
- tipo (enum: Temporario, Efetivo)
- situacao (enum: EmAdmissao, Ativo, Encerrado)
- inicio (date), fim (date, nullable), filialId (string)

### Documento (holerite, informe, comprovante, recibo de férias, TRCT, guia, ficha)
- id, tipo (enum: Holerite, InformeRendimentos, ComprovantePagamento, ReciboFerias, TRCT, ComprovanteRescisao,
  GuiaSeguroDesemprego, FichaRegistro)
- referencia (string — ex.: `2026-10`, `2025`), dataEmissao (date), valorLiquido (decimal, nullable)

### HoleriteDetalhe
- competencia, proventos[{descricao, valor}], descontos[{descricao, valor}], totalProventos, totalDescontos, liquido

### Ferias
- periodoAquisitivo {inicio, fim}, saldoDias (int), programadas[{inicio, fim, dias}], historico[...]

### SolicitacaoCadastral
- id, campo (enum: Endereco, Dependentes, DadosBancarios), status (enum: Enviada, EmAnalise, Aprovada, Recusada),
  criadaEm (date)

### EtapaAdmissao
- ordem (int), titulo, status (enum: Concluida, Atual, Pendente), acaoEsperada (string, nullable)

### LinkSistema
- id, titulo, descricao, url, icone

### FaqItem
- id, tema, pergunta, resposta (markdown simples)

### Manifestacao (ouvidoria)
- tipo (enum: Elogio, Sugestao, Reclamacao, Denuncia), mensagem (string, 10–2000), anonima (bool) → protocolo

### Features (`GET /api/me/features`)
- string[] de ids de feature (ex.: `financeiro.holerite`)

---

## 📡 Endpoints Consumidos (BFF em `backend/`)

Todos sob `/api`, autenticados por cookie de sessão, exceto os de `auth`. Endpoints com `{contratoId}` validam no
backend que o contrato pertence ao worker da sessão.

### Autenticação e sessão
- `POST /api/auth/login` — CPF + senha
- `POST /api/auth/primeiro-acesso` — CPF + data de nascimento → envia código
- `POST /api/auth/verificar-codigo` — código → token de criação de senha
- `POST /api/auth/definir-senha`
- `POST /api/auth/esqueci-senha`
- `POST /api/auth/logout`
- `GET /api/me` — worker da sessão
- `GET /api/me/features?contratoId={id}` — ids de features liberadas para o contrato ativo
- `GET /api/lgpd/termo-vigente` · `POST /api/lgpd/aceite`

### Perfil e contratos
- `PATCH /api/me/contato` — e-mail/celular (com código)
- `GET /api/contratos`
- `GET /api/contratos/{contratoId}/links`

### Admissão e gestão pessoal
- `GET /api/contratos/{contratoId}/admissao`
- `GET /api/contratos/{contratoId}/ficha-registro` · `GET .../ficha-registro/pdf`
- `GET /api/contratos/{contratoId}/ferias`
- `GET /api/contratos/{contratoId}/dados-cadastrais`
- `POST /api/contratos/{contratoId}/solicitacoes-cadastrais` (multipart, com comprovante)
- `GET /api/contratos/{contratoId}/solicitacoes-cadastrais`

### Documentos e financeiro
- `GET /api/contratos/{contratoId}/documentos?tipo={tipo}` — holerites, comprovantes, recibos, TRCT, guia
- `GET /api/contratos/{contratoId}/holerites/{id}` — detalhe
- `GET /api/informes-rendimentos` — por CPF, todos os anos
- `GET /api/documentos/{id}/pdf` — blob PDF

### Atendimento
- `GET /api/faq`
- `GET /api/contratos/{contratoId}/canais-contato`
- `POST /api/ouvidoria` → `{ protocolo }`

### Telemetria
- `POST /api/telemetria` — lote de eventos

---

## 🗺️ Roadmap (fora do escopo desta rodada)

Registrado para a arquitetura comportar; cada item vira uma feature com `fase` no registro de módulos.
Legenda do cliente: ✓ contemplado no webinar · ↑ antecipado · ↓ postergado · ★ novo (priorizado na planilha).

| Trilha | Desempenho (Q2/2027) | Encantamento (Q3/2027) | Otimização (Q4/2027) |
|---|---|---|---|
| Fundação & Acesso | ✓ Autenticação biométrica | — | ★ Navegação amigável (web) · ★ Dashboard de uso |
| Onboarding & Admissão | ★ Agendamento de integração · ✓↓ Upload de documentos · ★ Check-in do 1º dia | — | ✓↓ Contrato p/ assinatura · ★ Declínio da admissão |
| Gestão Pessoal | ★ Vencimento de contrato · ✓↑ Prorrogações e aditivos | ★ Aba de afastamento · ★ Promoções e méritos · ✓↑ Aba de desligamento | — |
| Ponto & Frequência | — | — | ✓↓ Gestão de ponto · ✓ Pendências de marcação |
| Financeiro do Trabalhador | ✓↑ Aviso de novo pagamento · ★ Extrato de benefícios | ✓ Adiantamento salarial | ★ Consignado (sem prioridade definida) |
| Atendimento & Suporte | ★ Histórico de chamados | — | — |
| Comunicação & Cultura | ★ Mural de comunicados | — | ★ Manual e políticas · ★ Mensagens da liderança · ★ Aniversários e boas-vindas · ★ Biblioteca de documentos |
| Treinamento & Desenvolvimento | — | ✓ Trilhas de capacitação · ✓ Certificados digitais · ★ Avaliação e metas | ✓ Cursos recomendados |
| Benefícios & Saúde | ✓↑ Lista de benefícios · ★ Acidente de trabalho | — | ★ Acesso ao ASO |
| Engajamento & Rehiring | ✓ Pesquisa de satisfação · ✓ Pesquisa de clima | — | ✓ Indique um amigo · ✓ Gamificação · ★ Vagas para rehiring |

Impactos já previstos na arquitetura:
- **Biometria / Aviso de novo pagamento** → PWA + WebAuthn + Web Push (por isso PWA desde o Básico).
- **Upload de documentos / Contrato p/ assinatura** → componente de upload e integração com assinatura eletrônica
  em `shared/ui`, reaproveitado por Gestão Pessoal (solicitação cadastral já usa upload no Básico).
- **Dashboard de uso** → depende da telemetria do REQ-022.
- **Vagas para rehiring** → acesso de ex-worker (contrato encerrado), já suportado pelo BR-004.

---

## 🧪 Testes

Cobertura mínima: 80% (linhas) em `shared/` e `modules/`.

- [ ] Unitários: formatadores, máscaras de CPF, validação de formulários (schemas zod), filtro de features.
- [ ] Componentes (Testing Library + MSW): cada página nos estados carregando, vazio, erro e com dados.
- [ ] Guards: rota privada sem sessão redireciona sem renderizar dado; consentimento pendente bloqueia o app.
- [ ] Troca de contrato ativo recarrega os dados da tela.
- [ ] E2E (Playwright, viewport mobile 390×844 e desktop 1280×800): login → aceite LGPD → Início → baixar
      holerite → logout; primeiro acesso completo; ouvidoria anônima com protocolo.
- [ ] Acessibilidade: `@axe-core/playwright` sem violações sérias nas telas do E2E.

---

## 🔒 Segurança

- [ ] Sessão só por cookie `HttpOnly` do BFF; nenhum token, CPF ou documento em `localStorage`/`sessionStorage`.
- [ ] Header anti-CSRF em toda requisição mutável.
- [ ] Guard no `loader` (antes de renderizar); 401 em qualquer chamada derruba a sessão do cliente.
- [ ] Logout limpa cache do TanStack Query e todo storage do cliente.
- [ ] **Backend precisa garantir rate limiting** em login, primeiro acesso, verificação de código e esqueci-senha
      (o frontend só exibe o bloqueio retornado — sinalizar na rodada do backend).
- [ ] Nenhum segredo em variáveis `VITE_*`; a única configuração pública é a URL base da API.
- [ ] CSP restritiva (sem `unsafe-inline` em script); links externos com `rel="noopener noreferrer"`.
- [ ] Service worker não guarda respostas de `/api/` nem PDFs.
- [ ] Telemetria sem dado pessoal (revisado no teste de REQ-022).
- [ ] HTTPS em produção.

---

## ✅ Critérios de Aceitação

- [ ] REQ-001 a REQ-022 funcionando contra os mocks MSW, em mobile e desktop.
- [ ] Menu e rotas gerados só pelo registro de módulos + `GET /api/me/features` (desligar uma flag remove a
      feature sem deploy de frontend).
- [ ] Portões na ordem sessão → LGPD → contrato ativo.
- [ ] Testes com 80%+ de cobertura e E2E do fluxo principal passando.
- [ ] Orçamento de performance (JS inicial ≤ 200 KB gzip) e WCAG 2.1 AA nas telas do E2E.
- [ ] Sem vulnerabilidades críticas no security scan.

---

## ❓ Questões em aberto

1. **Canal:** web responsiva/PWA confirmada como canal único, ou haverá app nativo? ("Navegação amigável (web)" em
   Q4/2027 sugere que outro canal vem antes.)
2. **Identidade visual:** manual de marca Gi Group (cores, tipografia, logo) para os tokens de `shared/ui`.
3. **Status da admissão:** no slide revisado aparece no Básico com marca ↓ (postergado); na tabela inicial, em
   Desempenho. Em qual fase entra? (Esta spec considera Básico.)
4. **Sistemas de origem:** quais sistemas alimentam folha, admissão, ponto e BOT (define latência e se o PDF é
   gerado ou repassado).
5. **Primeiro acesso:** o código vai por SMS, e-mail ou ambos? Existe base de contato confiável do worker?
6. **Retenção:** quantos meses de holerite e quantos anos de informe ficam disponíveis? (Premissa: 24 meses.)
7. **Dados cadastrais:** alteração passa mesmo por aprovação do RH?
8. **Programa Acolhendo e BOT:** são produtos existentes com URL/widget próprios?
9. **Multi-país:** o portal atende só a operação Brasil?

---

**Pronto para orquestração!** 🚀

```
/inicia-orquestracao frontend
```
