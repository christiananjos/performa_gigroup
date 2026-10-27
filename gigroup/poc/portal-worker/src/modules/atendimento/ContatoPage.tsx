import { useQuery } from '@tanstack/react-query';
import { api } from '../../shared/api/http';
import { useContrato } from '../../shared/session/session';
import { Carregando, PageHeader } from '../../shared/ui/ui';

interface Canal { id: string; titulo: string; valor: string; href: string; detalhe: string }

export default function ContatoPage() {
  const { contrato } = useContrato();
  const { data } = useQuery({
    queryKey: ['canais', contrato.id],
    queryFn: () => api<Canal[]>(`/contratos/${contrato.id}/canais-contato`),
  });

  return (
    <>
      <PageHeader titulo="Canais de contato" descricao="Atendimento da filial responsável pelo seu contrato." />
      {!data ? <Carregando /> : (
        <ul className="doc-list">
          {data.map((c) => (
            <li key={c.id}>
              <div>
                <strong>{c.titulo}</strong>
                <span className="muted">{c.detalhe}</span>
              </div>
              <a className="btn btn--ghost" href={c.href} target="_blank" rel="noopener noreferrer">{c.valor}</a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
