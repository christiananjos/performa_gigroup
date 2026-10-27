import { useQuery } from '@tanstack/react-query';
import { api } from '../../shared/api/http';
import { useContrato } from '../../shared/session/session';
import { track } from '../../shared/telemetry';
import { Carregando, PageHeader } from '../../shared/ui/ui';

interface LinkSistema { id: string; titulo: string; descricao: string; url: string }

export default function LinksPage() {
  const { contrato } = useContrato();
  const { data } = useQuery({
    queryKey: ['links', contrato.id],
    queryFn: () => api<LinkSistema[]>(`/contratos/${contrato.id}/links`),
  });

  return (
    <>
      <PageHeader titulo="Links de sistemas" descricao={`Sistemas que você usa no dia a dia em ${contrato.tomadora}. Eles abrem fora do portal.`} />
      {!data ? <Carregando /> : (
        <ul className="doc-list">
          {data.map((l) => (
            <li key={l.id}>
              <div>
                <strong>{l.titulo}</strong>
                <span className="muted">{l.descricao}</span>
              </div>
              <a className="btn btn--ghost" href={l.url} target="_blank" rel="noopener noreferrer" onClick={() => track('link_out', { link: l.id })}>
                Abrir
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
