# Checklist de Revisão — React

## Estado
- [ ] Dado vindo de API está em biblioteca de estado de servidor, não em `useState` + `useEffect`.
- [ ] Filtro, aba e paginação estão na URL, não em estado local.
- [ ] Estado mora no componente mais próximo de quem usa (não subiu sem necessidade).
- [ ] Nada que possa ser derivado no render está duplicado em estado.
- [ ] Nenhuma mutação direta de array/objeto em estado.

## Efeitos
- [ ] Cada `useEffect` sincroniza com sistema externo de verdade.
- [ ] Nenhum efeito só para derivar estado de prop/estado.
- [ ] Nenhum efeito reagindo a evento do usuário (lógica está no handler).
- [ ] Efeito com assinatura/timer/listener tem função de limpeza.
- [ ] Busca de dado cancela requisição anterior (`AbortController`) ou usa biblioteca própria.
- [ ] Array de dependências completo (sem omissão para "não rodar de novo").

## Render
- [ ] Nenhum objeto/array/função inline passado como `value` de Context.
- [ ] `memo`/`useMemo`/`useCallback` usados por medição, não por reflexo.
- [ ] Lista longa virtualizada.
- [ ] Nenhum trabalho pesado no corpo do componente.

## Listas e formulários
- [ ] `key` usa id estável do dado, não índice (em lista que reordena/filtra).
- [ ] Atualização dependente do valor anterior usa a forma de função.
- [ ] Formulário grande não re-renderiza tudo a cada tecla.

## Componentes
- [ ] Componente tem uma responsabilidade clara.
- [ ] Lógica reutilizada extraída em hook customizado.
- [ ] Sem excesso de props booleanas de variação.
