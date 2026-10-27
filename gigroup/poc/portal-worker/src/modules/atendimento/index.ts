import type { ModuleDefinition } from '../../shared/types';

export const atendimento: ModuleDefinition = {
  id: 'atendimento',
  trilha: 'Atendimento & Suporte',
  features: [
    { id: 'atendimento.faq', titulo: 'Dúvidas e assistente', fase: 'basico', rota: '/ajuda', page: () => import('./AjudaPage') },
    { id: 'atendimento.contato', titulo: 'Canais de contato', fase: 'basico', rota: '/contato', page: () => import('./ContatoPage') },
    { id: 'atendimento.ouvidoria', titulo: 'Ouvidoria e sugestões', fase: 'basico', rota: '/ouvidoria', page: () => import('./OuvidoriaPage') },
    { id: 'atendimento.historico', titulo: 'Histórico de chamados', fase: 'desempenho' },
  ],
};
