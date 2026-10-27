---
paths:
  - "frontend/src/**/*.ts"
  - "frontend/src/**/*.tsx"
---

# Direção de Arte — React 18 + TypeScript

Objetivo: sair de layout genérico de IA (cards iguais, hero previsível, fontes óbvias, grid sem hierarquia)
para algo com direção de arte real. Siga isto ao criar ou revisar qualquer tela.

**Precedência com UX:** a criatividade vale para a *apresentação* (tipografia, cor, composição, motion). Os
*padrões de interação* (busca, carrinho, login, filtros, navegação) seguem as convenções que o usuário já conhece
— veja `.claude/rules/frontend-ux-laws.md`. Quebrar a grade não pode esconder a ação principal nem espalhar
destaque por tudo.

**Sempre use a skill `frontend-design`** (plugin oficial da Anthropic, `frontend-design@claude-plugins-official`,
já habilitado em `.claude/settings.json`) ao criar ou redesenhar tela/componente, e sugira ao usuário usá-la
sempre que o pedido envolver interface. Se o plugin não estiver instalado, sugira
`claude plugin install frontend-design@claude-plugins-official`.

## 1. Hierarquia e Tipografia
- No máximo 2 famílias de fonte, com contraste real de peso/tamanho entre título, subtítulo e corpo.
- Nunca use títulos genéricos tipo "Bem-vindo ao nosso site" — escreva copy específica, com voz própria, baseada
  no conteúdo real da spec.

## 2. Layout
- Quebre a grade padrão — nem tudo em cards iguais de 3 colunas.
- Use variação de espaçamento, sobreposição de elementos e assimetria proposital.
- Cada seção deve ter uma composição diferente da anterior, não o mesmo padrão repetido.

## 3. Movimento e Interação
- Use a biblioteca de motion definida na Direção de Arte da especificação técnica (GSAP, ou Framer Motion em
  React) para animações disparadas por scroll.
- Considere sticky sections e parallax sutil no hero e nas transições entre blocos.
- Só avalie um elemento 3D (Three.js) se fizer sentido pro produto e não pesar a performance — não é padrão,
  é exceção.

## 4. Cor e Atmosfera
- Defina uma paleta com propósito — nunca a paleta default de IA (azul genérico + cinza) sem justificativa.
- Use contraste alto entre fundo escuro/claro conforme a seção, pra criar ritmo visual.

## 5. Revisão Crítica (obrigatória antes de salvar o output)
Depois de gerar qualquer tela, responda a si mesmo antes de entregar — se a resposta apontar problema, corrija
antes de salvar, não apenas relate:
- Isso pareceria um template comprado por R$50 ou algo com direção de arte?
- Algum elemento está repetido sem necessidade (mesmo card, mesmo ícone, mesmo espaçamento)?
- O scroll conta uma história ou é só uma lista de seções empilhadas?
