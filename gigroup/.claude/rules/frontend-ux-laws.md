---
paths:
  - "frontend/src/**/*.ts"
  - "frontend/src/**/*.tsx"
---

# 7 Leis de UX — React 18 + TypeScript

Base: lawsofux.com. Regra central: **tela boa faz o cliente pensar menos.** Aplique ao criar ou revisar
qualquer tela, formulário ou fluxo. Complementa a Direção de Arte (`frontend-design-direction.md`): onde as
duas divergirem, a criatividade vale para a apresentação e o padrão de interação segue a convenção.

## 1. Fitts — a ação principal é grande e fácil de alcançar
- Cada tela tem uma ação principal (comprar, enviar, continuar). Ela é o maior alvo clicável da tela, com
  contraste claro e posição previsível; no mobile, ao alcance do polegar.
- Ações secundárias e destrutivas ficam menores e afastadas da principal.

## 2. Hick — poucas opções por tela
- Não apresente 12 escolhas de uma vez. Passe de 7 opções no mesmo nível: agrupe, esconda atrás de "mais" ou
  divida em etapas.
- Prefira uma recomendação padrão pré-selecionada quando houver uma escolha óbvia.

## 3. Zeigarnik — mostre o progresso
- Fluxo com 2 ou mais etapas mostra onde o usuário está ("4 de 5 passos"): tarefa começada e visivelmente
  incompleta puxa o usuário a terminar.

## 4. Jakob — não reinvente padrões
- Busca, carrinho, login, filtros, paginação, menu e ícones seguem o que os usuários já conhecem de outros
  sites. Inove na apresentação, não na interação.

## 5. Gradiente de meta — barra de progresso
- Quanto mais perto da meta, mais motivado o usuário fica: use barra de progresso, contador de etapas ou
  checklist de conclusão em onboarding, checkout e formulários longos.

## 6. Von Restorff — destaque só o que importa
- Se tudo grita, nada aparece. Um destaque visual (cor, tamanho, movimento) por região da tela, reservado ao que
  o usuário precisa notar primeiro.

## 7. Miller — agrupe e peça uma decisão por vez
- Agrupe opções e campos relacionados em blocos com título; divida formulários longos em etapas curtas, com uma
  decisão por vez.

## Revisão Crítica de UX (obrigatória antes de salvar o output)
Depois de gerar qualquer tela, responda a si mesmo — se apontar problema, corrija antes de salvar:
- Qual é a ação principal desta tela, e ela é a coisa mais fácil de achar e clicar?
- Há mais de 7 opções no mesmo nível sem agrupamento?
- Todo fluxo de várias etapas mostra o progresso?
- Algum padrão conhecido (busca, carrinho, login) foi reinventado sem necessidade?
- Mais de um elemento disputa o destaque na mesma região?
