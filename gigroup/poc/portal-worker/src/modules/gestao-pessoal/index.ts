import type { ModuleDefinition } from '../../shared/types';

export const gestaoPessoal: ModuleDefinition = {
  id: 'gestao',
  trilha: 'Gestão Pessoal',
  features: [
    { id: 'gestao.ferias', titulo: 'Férias', fase: 'basico', rota: '/ferias', page: () => import('./FeriasPage') },
    { id: 'gestao.dados', titulo: 'Dados cadastrais', fase: 'basico', rota: '/dados-cadastrais', page: () => import('./DadosCadastraisPage') },
    { id: 'gestao.ficha', titulo: 'Ficha de registro', fase: 'basico', rota: '/ficha-registro', page: () => import('./FichaRegistroPage') },
    { id: 'gestao.trct', titulo: 'TRCT e comprovante', fase: 'basico', rota: '/rescisao', page: () => import('./RescisaoPage') },
    { id: 'gestao.seguro', titulo: 'Guia do seguro-desemprego', fase: 'basico', rota: '/seguro-desemprego', page: () => import('./SeguroDesempregoPage') },
    { id: 'gestao.vencimento', titulo: 'Vencimento de contrato', fase: 'desempenho' },
    { id: 'gestao.aditivos', titulo: 'Prorrogações e aditivos', fase: 'desempenho' },
    { id: 'gestao.afastamento', titulo: 'Aba de afastamento', fase: 'encantamento' },
    { id: 'gestao.promocoes', titulo: 'Promoções e méritos', fase: 'encantamento' },
    { id: 'gestao.desligamento', titulo: 'Aba de desligamento', fase: 'encantamento' },
  ],
};
