import { mockApi } from '../../mocks/api';

export interface ApiInit {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
}

/**
 * Cliente HTTP único do portal. Toda chamada de API passa por aqui.
 * ponytail: no POC resolve no mock em memória; no produto vira
 * fetch(`/api${path}`, { credentials: 'include', headers: { 'X-CSRF': ... } }) com MSW nos testes.
 */
export function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  return mockApi(path, init) as Promise<T>;
}
