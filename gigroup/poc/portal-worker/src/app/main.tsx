import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '../shared/api/ApiError';
import { criarRouter } from './router';
import './styles.css';

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (falhas, erro) => !(erro instanceof ApiError && erro.status < 500) && falhas < 2,
    },
  },
});
const router = criarRouter(qc);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
