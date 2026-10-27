import type { ModuleDefinition } from '../shared/types';

// Trilhas que ainda não têm nenhuma tela. Quando a primeira feature ganhar página,
// a trilha vira pasta própria em src/modules/, como as demais.
export const trilhasFuturas: ModuleDefinition[] = [
  {
    id: 'ponto',
    trilha: 'Ponto & Frequência',
    features: [
      { id: 'ponto.gestao', titulo: 'Gestão de ponto', fase: 'otimizacao' },
      { id: 'ponto.pendencias', titulo: 'Pendências de marcação', fase: 'otimizacao' },
    ],
  },
  {
    id: 'comunicacao',
    trilha: 'Comunicação & Cultura',
    features: [
      { id: 'comunicacao.mural', titulo: 'Mural de comunicados', fase: 'desempenho' },
      { id: 'comunicacao.manual', titulo: 'Manual e políticas', fase: 'otimizacao' },
      { id: 'comunicacao.lideranca', titulo: 'Mensagens da liderança', fase: 'otimizacao' },
      { id: 'comunicacao.aniversarios', titulo: 'Aniversários e boas-vindas', fase: 'otimizacao' },
      { id: 'comunicacao.biblioteca', titulo: 'Biblioteca de documentos', fase: 'otimizacao' },
    ],
  },
  {
    id: 'treinamento',
    trilha: 'Treinamento & Desenvolvimento',
    features: [
      { id: 'treinamento.trilhas', titulo: 'Trilhas de capacitação', fase: 'encantamento' },
      { id: 'treinamento.certificados', titulo: 'Certificados digitais', fase: 'encantamento' },
      { id: 'treinamento.avaliacao', titulo: 'Avaliação e metas', fase: 'encantamento' },
      { id: 'treinamento.cursos', titulo: 'Cursos recomendados', fase: 'otimizacao' },
    ],
  },
  {
    id: 'beneficios',
    trilha: 'Benefícios & Saúde',
    features: [
      { id: 'beneficios.lista', titulo: 'Lista de benefícios', fase: 'desempenho' },
      { id: 'beneficios.acidente', titulo: 'Acidente de trabalho', fase: 'desempenho' },
      { id: 'beneficios.aso', titulo: 'Acesso ao ASO', fase: 'otimizacao' },
    ],
  },
  {
    id: 'engajamento',
    trilha: 'Engajamento & Rehiring',
    features: [
      { id: 'engajamento.satisfacao', titulo: 'Pesquisa de satisfação', fase: 'desempenho' },
      { id: 'engajamento.clima', titulo: 'Pesquisa de clima', fase: 'desempenho' },
      { id: 'engajamento.indique', titulo: 'Indique um amigo', fase: 'otimizacao' },
      { id: 'engajamento.gamificacao', titulo: 'Gamificação', fase: 'otimizacao' },
      { id: 'engajamento.rehiring', titulo: 'Vagas para rehiring', fase: 'otimizacao' },
    ],
  },
];
