import type { ModuleDefinition } from '../../shared/types';

export const financeiro: ModuleDefinition = {
  id: 'financeiro',
  trilha: 'Financeiro do Trabalhador',
  features: [
    { id: 'financeiro.holerite', titulo: 'Holerites', fase: 'basico', rota: '/holerites', page: () => import('./HoleritesPage') },
    { id: 'financeiro.informe', titulo: 'Informe de rendimentos', fase: 'basico', rota: '/informe-rendimentos', page: () => import('./InformePage') },
    { id: 'financeiro.comprovantes', titulo: 'Comprovantes de pagamento', fase: 'basico', rota: '/comprovantes', page: () => import('./ComprovantesPage') },
    { id: 'financeiro.recibos-ferias', titulo: 'Recibos de férias', fase: 'basico', rota: '/recibos-ferias', page: () => import('./RecibosFeriasPage') },
    { id: 'financeiro.aviso-pagamento', titulo: 'Aviso de novo pagamento', fase: 'desempenho' },
    { id: 'financeiro.extrato-beneficios', titulo: 'Extrato de benefícios', fase: 'desempenho' },
    { id: 'financeiro.adiantamento', titulo: 'Adiantamento salarial', fase: 'encantamento' },
    { id: 'financeiro.consignado', titulo: 'Consignado', fase: 'otimizacao' },
  ],
};
