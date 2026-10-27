import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../shared/api/http';
import { dataBR } from '../../shared/lib/format';
import { useContrato } from '../../shared/session/session';
import { track } from '../../shared/telemetry';
import { Carregando, PageHeader } from '../../shared/ui/ui';

interface Dados {
  endereco: string;
  banco: string;
  dependentes: string[];
  solicitacoes: { id: string; campo: string; status: string; criadaEm: string }[];
}

export default function DadosCadastraisPage() {
  const { contrato } = useContrato();
  const [abrindo, setAbrindo] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const { data } = useQuery({
    queryKey: ['dados-cadastrais', contrato.id],
    queryFn: () => api<Dados>(`/contratos/${contrato.id}/dados-cadastrais`),
  });
  if (!data) return <Carregando />;

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await api(`/contratos/${contrato.id}/solicitacoes-cadastrais`, { method: 'POST', body: Object.fromEntries(form) });
    track('form_submit', { form: 'solicitacao-cadastral' });
    setAbrindo(false);
    setEnviada(true);
  }

  return (
    <>
      <PageHeader titulo="Dados cadastrais" descricao="Alterações passam pela análise do RH antes de valer.">
        {!abrindo && <button className="btn btn--primary" onClick={() => setAbrindo(true)}>Solicitar alteração</button>}
      </PageHeader>

      {enviada && <p className="notice" role="status">Solicitação enviada. Você acompanha o andamento aqui.</p>}

      {abrindo && (
        <form className="form-card" onSubmit={enviar}>
          <label>
            O que mudou?
            <select name="campo" required defaultValue="Endereço">
              <option>Endereço</option>
              <option>Dados bancários</option>
              <option>Dependentes</option>
            </select>
          </label>
          <label>
            Novo dado
            <textarea name="valor" rows={3} required minLength={5} />
          </label>
          <label>
            Comprovante (PDF ou foto)
            <input name="comprovante" type="file" accept="application/pdf,image/*" required />
          </label>
          <div className="row">
            <button className="btn btn--primary">Enviar solicitação</button>
            <button type="button" className="btn btn--ghost" onClick={() => setAbrindo(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <dl className="data-list">
        <dt>Endereço</dt><dd>{data.endereco}</dd>
        <dt>Conta para pagamento</dt><dd>{data.banco}</dd>
        <dt>Dependentes</dt><dd>{data.dependentes.join(', ')}</dd>
      </dl>

      <section className="section">
        <h2>Solicitações</h2>
        <ul className="doc-list">
          {enviada && <li><div><strong>Nova solicitação</strong><span className="muted">Hoje</span></div><span className="badge badge--EmAdmissao">Enviada</span></li>}
          {data.solicitacoes.map((s) => (
            <li key={s.id}>
              <div><strong>{s.campo}</strong><span className="muted">Pedida em {dataBR(s.criadaEm)}</span></div>
              <span className="badge badge--Ativo">{s.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
