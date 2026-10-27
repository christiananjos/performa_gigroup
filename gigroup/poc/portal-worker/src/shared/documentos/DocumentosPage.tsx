import { useQuery } from '@tanstack/react-query';
import { api } from '../api/http';
import { useContrato } from '../session/session';
import type { Documento, TipoDocumento } from '../types';
import { brl, competencia, dataBR } from '../lib/format';
import { track } from '../telemetry';
import { Carregando, Erro, PageHeader, Vazio } from '../ui/ui';

/** Abre o PDF do documento. No produto: GET /api/documentos/{id}/pdf devolve o blob do PDF. */
export async function baixar(doc: Documento) {
  const html = await api<string>(`/documentos/${doc.id}/pdf`);
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  track('document_download', { tipo: doc.tipo });
}

export function useDocumentos(tipo: TipoDocumento) {
  const { contrato } = useContrato();
  return useQuery({
    queryKey: ['documentos', contrato.id, tipo],
    queryFn: () => api<Documento[]>(`/contratos/${contrato.id}/documentos?tipo=${tipo}`),
  });
}

/** Página genérica de documentos: informes, comprovantes, recibos, TRCT, guias, ficha. */
export function DocumentosPage({ tipos, titulo, descricao }: { tipos: TipoDocumento[]; titulo: string; descricao: string }) {
  return (
    <>
      <PageHeader titulo={titulo} descricao={descricao} />
      {tipos.map((t) => <ListaDocumentos key={t} tipo={t} />)}
    </>
  );
}

function ListaDocumentos({ tipo }: { tipo: TipoDocumento }) {
  const { data, isLoading, isError, refetch } = useDocumentos(tipo);
  if (isLoading) return <Carregando />;
  if (isError) return <Erro onTentar={refetch} />;
  if (!data?.length) return <Vazio>Nenhum documento disponível ainda para este contrato.</Vazio>;
  return (
    <ul className="doc-list">
      {data.map((d) => (
        <li key={d.id}>
          <div>
            <strong>{d.titulo}</strong>
            <span className="muted">
              {competencia(d.referencia)}, emitido em {dataBR(d.dataEmissao)}
            </span>
          </div>
          {d.valorLiquido !== undefined && <span className="doc-list__valor">{brl(d.valorLiquido)}</span>}
          <button className="btn btn--ghost" onClick={() => baixar(d)}>Baixar PDF</button>
        </li>
      ))}
    </ul>
  );
}
