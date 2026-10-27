import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../shared/api/http';
import { baixar, useDocumentos } from '../../shared/documentos/DocumentosPage';
import { brl, competencia } from '../../shared/lib/format';
import { useContrato } from '../../shared/session/session';
import type { Documento, HoleriteDetalhe } from '../../shared/types';
import { Carregando, Erro, PageHeader, Vazio } from '../../shared/ui/ui';

export default function HoleritesPage() {
  const { data, isLoading, isError, refetch } = useDocumentos('Holerite');
  const [aberto, setAberto] = useState<string>();

  return (
    <>
      <PageHeader titulo="Holerites" descricao="Toque em um mês para ver proventos e descontos." />
      {isLoading && <Carregando />}
      {isError && <Erro onTentar={refetch} />}
      {data && !data.length && <Vazio>O primeiro holerite aparece aqui no dia do pagamento.</Vazio>}
      <ul className="payslip-list">
        {data?.map((d) => (
          <li key={d.id}>
            <button className="payslip-list__head" aria-expanded={aberto === d.id} onClick={() => setAberto(aberto === d.id ? undefined : d.id)}>
              <span className="payslip-list__mes">{competencia(d.referencia)}</span>
              <span className="payslip-list__valor">{brl(d.valorLiquido!)}</span>
            </button>
            {aberto === d.id && <Detalhe doc={d} />}
          </li>
        ))}
      </ul>
    </>
  );
}

function Detalhe({ doc }: { doc: Documento }) {
  const { contrato } = useContrato();
  const { data } = useQuery({
    queryKey: ['holerite', contrato.id, doc.referencia],
    queryFn: () => api<HoleriteDetalhe>(`/contratos/${contrato.id}/holerites/${doc.referencia}`),
  });
  if (!data) return <Carregando linhas={2} />;

  return (
    <div className="payslip">
      <table>
        <tbody>
          {data.proventos.map((p) => <tr key={p.descricao}><td>{p.descricao}</td><td className="num">{brl(p.valor)}</td></tr>)}
          {data.descontos.map((p) => <tr key={p.descricao} className="neg"><td>{p.descricao}</td><td className="num">− {brl(p.valor)}</td></tr>)}
        </tbody>
        <tfoot>
          <tr><td>Líquido</td><td className="num">{brl(data.liquido)}</td></tr>
        </tfoot>
      </table>
      <button className="btn btn--ghost" onClick={() => baixar(doc)}>Baixar PDF</button>
    </div>
  );
}
