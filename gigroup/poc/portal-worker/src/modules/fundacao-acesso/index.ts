import type { ModuleDefinition } from '../../shared/types';

export const fundacaoAcesso: ModuleDefinition = {
  id: 'fundacao',
  trilha: 'Fundação & Acesso',
  features: [
    { id: 'fundacao.inicio', titulo: 'Início', fase: 'basico', rota: '/', page: () => import('./InicioPage') },
    { id: 'fundacao.contratos', titulo: 'Meus contratos', fase: 'basico', rota: '/contratos', page: () => import('./ContratosPage') },
    { id: 'fundacao.links', titulo: 'Links de sistemas', fase: 'basico', rota: '/links', page: () => import('./LinksPage') },
    { id: 'fundacao.perfil', titulo: 'Perfil e privacidade', fase: 'basico', rota: '/perfil', page: () => import('./PerfilPage') },
    { id: 'fundacao.biometria', titulo: 'Autenticação biométrica', fase: 'desempenho' },
    { id: 'fundacao.navegacao-web', titulo: 'Navegação amigável (web)', fase: 'otimizacao' },
    { id: 'fundacao.dashboard-uso', titulo: 'Dashboard de uso', fase: 'otimizacao' },
  ],
};
