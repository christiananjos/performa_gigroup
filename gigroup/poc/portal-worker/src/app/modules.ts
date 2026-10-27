import { atendimento } from '../modules/atendimento';
import { financeiro } from '../modules/financeiro';
import { fundacaoAcesso } from '../modules/fundacao-acesso';
import { trilhasFuturas } from '../modules/futuras';
import { gestaoPessoal } from '../modules/gestao-pessoal';
import { onboardingAdmissao } from '../modules/onboarding-admissao';
import type { ModuleDefinition } from '../shared/types';

/** REGISTRO: a única lista de trilhas do portal. Menu, rotas e roadmap saem daqui. */
export const modulos: ModuleDefinition[] = [
  fundacaoAcesso,
  onboardingAdmissao,
  gestaoPessoal,
  financeiro,
  atendimento,
  ...trilhasFuturas,
];

export const features = modulos.flatMap((m) => m.features.map((f) => ({ ...f, trilha: m.trilha })));
