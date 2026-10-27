import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../shared/api/http';
import { dataBR } from '../../shared/lib/format';
import { useContrato } from '../../shared/session/session';
import { Carregando, PageHeader } from '../../shared/ui/ui';

interface Periodo { inicio: string; fim: string; dias: number }
interface Ferias {
  periodoAquisitivo: { inicio: string; fim: string };
  saldoDias: number;
  programadas: Periodo[];
  historico: Periodo[];
}

export default function FeriasPage() {
  const { contrato } = useContrato();
  const { data } = useQuery({
    queryKey: ['ferias', contrato.id],
    queryFn: () => api<Ferias>(`/contratos/${contrato.id}/ferias`),
  });
  if (!data) return <Carregando />;

  return (
    <>
      <PageHeader titulo="Férias" />
      <section className="stat">
        <p className="stat__valor">{data.saldoDias} dias</p>
        <p className="muted">
          de saldo no período de {dataBR(data.periodoAquisitivo.inicio)} a {dataBR(data.periodoAquisitivo.fim)}
        </p>
      </section>

      <section className="section">
        <h2>Programadas</h2>
        <ul className="doc-list">
          {data.programadas.map((p) => (
            <li key={p.inicio}>
              <div><strong>{dataBR(p.inicio)} a {dataBR(p.fim)}</strong><span className="muted">{p.dias} dias</span></div>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>Já tiradas</h2>
        <ul className="doc-list">
          {data.historico.map((p) => (
            <li key={p.inicio}>
              <div><strong>{dataBR(p.inicio)} a {dataBR(p.fim)}</strong><span className="muted">{p.dias} dias</span></div>
              <Link className="btn btn--ghost" to="/recibos-ferias">Ver recibo</Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
