import type { ComponentType } from 'react';

export type Fase = 'basico' | 'desempenho' | 'encantamento' | 'otimizacao';

export const FASES: { id: Fase; nome: string; periodo: string }[] = [
  { id: 'basico', nome: 'Básico', periodo: 'Q4/2026 – Q1/2027' },
  { id: 'desempenho', nome: 'Desempenho', periodo: 'Q2/2027' },
  { id: 'encantamento', nome: 'Encantamento', periodo: 'Q3/2027' },
  { id: 'otimizacao', nome: 'Otimização', periodo: 'Q4/2027' },
];

/** Uma funcionalidade do roadmap. Sem `page` = ainda não tem tela (fase futura). */
export interface Feature {
  id: string;
  titulo: string;
  fase: Fase;
  rota?: string;
  page?: () => Promise<{ default: ComponentType }>;
}

/** Uma trilha do roadmap. Cada pasta de src/modules exporta uma. */
export interface ModuleDefinition {
  id: string;
  trilha: string;
  features: Feature[];
}

export type SituacaoContrato = 'EmAdmissao' | 'Ativo' | 'Encerrado';

export interface Contrato {
  id: string;
  tomadora: string;
  cargo: string;
  tipo: 'Temporário' | 'Efetivo';
  situacao: SituacaoContrato;
  inicio: string;
  fim: string | null;
}

export interface Worker {
  nome: string;
  cpfMascarado: string;
  email: string;
  celular: string;
  consentimentoPendente: boolean;
  termoAceitoEm: string | null;
}

export type TipoDocumento =
  | 'Holerite'
  | 'InformeRendimentos'
  | 'ComprovantePagamento'
  | 'ReciboFerias'
  | 'TRCT'
  | 'ComprovanteRescisao'
  | 'GuiaSeguroDesemprego'
  | 'FichaRegistro';

export interface Documento {
  id: string;
  tipo: TipoDocumento;
  titulo: string;
  referencia: string;
  dataEmissao: string;
  valorLiquido?: number;
}

export interface Lancamento {
  descricao: string;
  valor: number;
}

export interface HoleriteDetalhe {
  competencia: string;
  proventos: Lancamento[];
  descontos: Lancamento[];
  liquido: number;
}

export interface EtapaAdmissao {
  titulo: string;
  status: 'Concluida' | 'Atual' | 'Pendente';
  acaoEsperada?: string;
}

export interface Admissao {
  etapas: EtapaAdmissao[];
  acolhendoUrl: string;
}
