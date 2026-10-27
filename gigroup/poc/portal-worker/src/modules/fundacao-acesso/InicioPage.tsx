import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { features } from '../../app/modules';
import { api } from '../../shared/api/http';
import { baixar, useDocumentos } from '../../shared/documentos/DocumentosPage';
import { brl, competencia, dataBR } from '../../shared/lib/format';
import { useContrato, useFeatures, useMe } from '../../shared/session/session';
import type { Admissao } from '../../shared/types';
import { Carregando } from '../../shared/ui/ui';

export default function InicioPage() {
  const me = useMe();
  const { contrato, contratos, selecionar } = useContrato();
  const liberadas = useFeatures().data ?? [];
  const atalhos = features.filter((f) => f.page && f.id !== 'fundacao.inicio' && liberadas.includes(f.id));
  const admissoes = contratos.filter((c) => c.situacao === 'EmAdmissao' && c.id !== contrato.id);

  return (
    <>
      <p className="hello">Olá, {me.nome.split(' ')[0]}</p>

      {contrato.situacao === 'Ativo' && <UltimoPagamento />}
      {contrato.situacao === 'EmAdmissao' && <AdmissaoResumo />}
      {contrato.situacao === 'Encerrado' && <Rescisao />}

      {admissoes.length > 0 && (
        <section className="section">
          <h2>Pendências</h2>
          <ul className="pend-list">
            {admissoes.map((c) => (
              <li key={c.id}>
                <span>Sua admissão em <strong>{c.tomadora}</strong> está em andamento.</span>
                <button className="btn btn--ghost" onClick={() => selecionar(c.id)}>Acompanhar</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="section">
        <h2>Atalhos</h2>
        <ul className="shortcut-list">
          {atalhos.map((f) => (
            <li key={f.id}>
              <Link to={f.rota!}>
                <strong>{f.titulo}</strong>
                <span className="muted">{f.trilha}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function UltimoPagamento() {
  const { data, isLoading } = useDocumentos('Holerite');
  if (isLoading) return <Carregando linhas={2} />;
  const ultimo = data?.[0];
  if (!ultimo) return null;
  return (
    <article className="stub" aria-label="Último pagamento">
      <div className="stub__top">
        <span>Último pagamento</span>
        <span className="stub__tag">Pago em {dataBR(ultimo.dataEmissao)}</span>
      </div>
      <div className="stub__body">
        <p className="stub__valor">{brl(ultimo.valorLiquido!)}</p>
        <p className="muted">Líquido de {competencia(ultimo.referencia)}</p>
        <Link className="btn btn--primary" to="/holerites">Ver holerite</Link>
      </div>
    </article>
  );
}

function AdmissaoResumo() {
  const { contrato } = useContrato();
  const { data } = useQuery({
    queryKey: ['admissao', contrato.id],
    queryFn: () => api<Admissao>(`/contratos/${contrato.id}/admissao`),
  });
  if (!data) return <Carregando linhas={2} />;
  const atual = data.etapas.findIndex((e) => e.status === 'Atual');
  return (
    <article className="stub" aria-label="Sua admissão">
      <div className="stub__top">
        <span>Sua admissão em {contrato.tomadora}</span>
        <span className="stub__tag">Etapa {atual + 1} de {data.etapas.length}</span>
      </div>
      <div className="stub__body">
        <p className="stub__titulo">{data.etapas[atual].titulo}</p>
        <p className="muted">{data.etapas[atual].acaoEsperada}</p>
        <Link className="btn btn--primary" to="/admissao">Acompanhar admissão</Link>
      </div>
    </article>
  );
}

function Rescisao() {
  const { contrato } = useContrato();
  const { data } = useDocumentos('TRCT');
  const trct = data?.[0];
  return (
    <article className="stub" aria-label="Contrato encerrado">
      <div className="stub__top">
        <span>Contrato encerrado</span>
        <span className="stub__tag">{contrato.fim && dataBR(contrato.fim)}</span>
      </div>
      <div className="stub__body">
        <p className="stub__valor">{trct ? brl(trct.valorLiquido!) : '—'}</p>
        <p className="muted">Valor líquido da rescisão</p>
        {trct && <button className="btn btn--primary" onClick={() => baixar(trct)}>Baixar TRCT</button>}
      </div>
    </article>
  );
}
