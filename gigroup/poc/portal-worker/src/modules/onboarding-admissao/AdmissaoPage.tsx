import { useQuery } from '@tanstack/react-query';
import { api } from '../../shared/api/http';
import { useContrato } from '../../shared/session/session';
import { track } from '../../shared/telemetry';
import type { Admissao } from '../../shared/types';
import { Carregando, Erro, PageHeader } from '../../shared/ui/ui';

const statusTexto = { Concluida: 'Concluída', Atual: 'Agora', Pendente: 'A seguir' } as const;

export default function AdmissaoPage() {
  const { contrato } = useContrato();
  const { data, isError, refetch } = useQuery({
    queryKey: ['admissao', contrato.id],
    queryFn: () => api<Admissao>(`/contratos/${contrato.id}/admissao`),
  });

  if (isError) return <Erro onTentar={refetch} />;
  if (!data) return <Carregando />;
  const concluidas = data.etapas.filter((e) => e.status === 'Concluida').length;

  return (
    <>
      <PageHeader titulo="Minha admissão" descricao={`${contrato.cargo} em ${contrato.tomadora}`} />
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={data.etapas.length} aria-valuenow={concluidas}>
        <span style={{ width: `${(concluidas / data.etapas.length) * 100}%` }} />
      </div>
      <p className="muted small">{concluidas} de {data.etapas.length} etapas concluídas</p>

      <ol className="timeline">
        {data.etapas.map((e) => (
          <li key={e.titulo} className={`timeline__item timeline__item--${e.status}`}>
            <strong>{e.titulo}</strong>
            <span className="muted small">{statusTexto[e.status]}</span>
            {e.acaoEsperada && <p className="timeline__acao">{e.acaoEsperada}</p>}
          </li>
        ))}
      </ol>

      <section className="callout">
        <div>
          <h2>Programa Acolhendo</h2>
          <p>Conheça a Gi Group, seus direitos e o que esperar das primeiras semanas antes de começar.</p>
        </div>
        <a className="btn btn--ghost" href={data.acolhendoUrl} target="_blank" rel="noopener noreferrer" onClick={() => track('link_out', { link: 'acolhendo' })}>
          Abrir o programa
        </a>
      </section>
    </>
  );
}
