import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, type QueryClient } from '@tanstack/react-query';
import { api } from '../api/http';
import type { Contrato, Worker } from '../types';
import { Carregando } from '../ui/ui';

export const meQuery = { queryKey: ['me'], queryFn: () => api<Worker>('/me') };

/** Só use dentro de rotas privadas: o loader já garantiu que /me existe. */
export function useMe() {
  return useQuery(meQuery).data as Worker;
}

interface ContratoCtx {
  contrato: Contrato;
  contratos: Contrato[];
  selecionar: (id: string) => void;
}

const Ctx = createContext<ContratoCtx | null>(null);

/** Contrato ativo: toda query de dado contratual leva contrato.id na query key. */
export function ContratoProvider({ children }: { children: ReactNode }) {
  const { data: contratos } = useQuery({ queryKey: ['contratos'], queryFn: () => api<Contrato[]>('/contratos') });
  const [id, selecionar] = useState<string>();
  if (!contratos) return <Carregando />;
  const contrato =
    contratos.find((c) => c.id === id) ?? contratos.find((c) => c.situacao === 'Ativo') ?? contratos[0];
  return <Ctx.Provider value={{ contrato, contratos, selecionar }}>{children}</Ctx.Provider>;
}

export function useContrato() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useContrato fora do ContratoProvider');
  return ctx;
}

/** Ids de features liberadas pelo backend para o contrato ativo. */
export function useFeatures() {
  const { contrato } = useContrato();
  return useQuery({
    queryKey: ['features', contrato.id],
    queryFn: () => api<string[]>(`/me/features?contratoId=${contrato.id}`),
  });
}

export async function sair(qc: QueryClient) {
  await api('/auth/logout', { method: 'POST' });
  qc.clear();
}
