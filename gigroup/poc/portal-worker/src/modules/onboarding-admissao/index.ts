import type { ModuleDefinition } from '../../shared/types';

export const onboardingAdmissao: ModuleDefinition = {
  id: 'onboarding',
  trilha: 'Onboarding & Admissão',
  features: [
    { id: 'onboarding.admissao', titulo: 'Minha admissão', fase: 'basico', rota: '/admissao', page: () => import('./AdmissaoPage') },
    { id: 'onboarding.agendamento', titulo: 'Agendamento de integração', fase: 'desempenho' },
    { id: 'onboarding.upload', titulo: 'Upload de documentos', fase: 'desempenho' },
    { id: 'onboarding.checkin', titulo: 'Check-in do 1º dia', fase: 'desempenho' },
    { id: 'onboarding.assinatura', titulo: 'Contrato para assinatura', fase: 'otimizacao' },
    { id: 'onboarding.declinio', titulo: 'Declínio da admissão', fase: 'otimizacao' },
  ],
};
