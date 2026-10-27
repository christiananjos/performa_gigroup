import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, redirect, useRouteError, type RouteObject } from 'react-router-dom';
import type { QueryClient } from '@tanstack/react-query';
import ConsentimentoPage from '../modules/fundacao-acesso/ConsentimentoPage';
import LoginPage from '../modules/fundacao-acesso/LoginPage';
import { ContratoProvider, meQuery, useFeatures } from '../shared/session/session';
import { Carregando, Erro, Indisponivel } from '../shared/ui/ui';
import { AppShell } from './layout/AppShell';
import { features } from './modules';
import RoadmapPage from './RoadmapPage';

/** Só renderiza a feature se o backend a liberou para o contrato ativo. */
function FeatureGate({ id, children }: { id: string; children: ReactNode }) {
  const { data, isLoading } = useFeatures();
  if (isLoading) return <Carregando />;
  if (!data?.includes(id)) return <Indisponivel />;
  return <Suspense fallback={<Carregando />}>{children}</Suspense>;
}

/** Erro numa trilha não derruba o portal: o shell continua de pé. */
function FalhaModulo() {
  console.error(useRouteError());
  return <Erro onTentar={() => location.reload()} />;
}

export function criarRouter(qc: QueryClient) {
  // Portões na ordem da spec: sessão válida, depois consentimento LGPD. Roda ANTES de renderizar.
  const sessao = async () => qc.fetchQuery(meQuery).catch(() => null);

  const rotasDeFeature: RouteObject[] = features
    .filter((f) => f.rota && f.page)
    .map((f) => {
      const Page = lazy(f.page!);
      const element = <FeatureGate id={f.id}><Page /></FeatureGate>;
      return f.rota === '/'
        ? { index: true, element, errorElement: <FalhaModulo /> }
        : { path: f.rota!.slice(1), element, errorElement: <FalhaModulo /> };
    });

  return createBrowserRouter([
    { path: '/entrar', element: <LoginPage /> },
    {
      path: '/consentimento',
      element: <ConsentimentoPage />,
      loader: async () => ((await sessao()) ? null : redirect('/entrar')),
    },
    {
      path: '/',
      element: <ContratoProvider><AppShell /></ContratoProvider>,
      loader: async () => {
        const me = await sessao();
        if (!me) return redirect('/entrar');
        if (me.consentimentoPendente) return redirect('/consentimento');
        return null;
      },
      children: [
        ...rotasDeFeature,
        { path: 'roadmap', element: <RoadmapPage /> },
        { path: '*', element: <Indisponivel /> },
      ],
    },
  ]);
}
