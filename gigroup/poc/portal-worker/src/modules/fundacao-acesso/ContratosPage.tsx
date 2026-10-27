import { useNavigate } from 'react-router-dom';
import { dataBR } from '../../shared/lib/format';
import { useContrato } from '../../shared/session/session';
import type { SituacaoContrato } from '../../shared/types';
import { PageHeader } from '../../shared/ui/ui';

const rotulo: Record<SituacaoContrato, string> = { Ativo: 'Ativo', EmAdmissao: 'Em admissão', Encerrado: 'Encerrado' };

export default function ContratosPage() {
  const { contrato: atual, contratos, selecionar } = useContrato();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader titulo="Meus contratos" descricao="Escolha o contrato que você quer consultar. Contratos encerrados continuam com os documentos disponíveis." />
      <ul className="contract-list">
        {contratos.map((c) => (
          <li key={c.id} aria-current={c.id === atual.id}>
            <div>
              <span className={`badge badge--${c.situacao}`}>{rotulo[c.situacao]}</span>
              <strong>{c.tomadora}</strong>
              <span>{c.cargo}, {c.tipo.toLowerCase()}</span>
              <span className="muted">
                {c.situacao === 'EmAdmissao' ? `Início previsto em ${dataBR(c.inicio)}` : `Desde ${dataBR(c.inicio)}`}
                {c.fim && c.situacao !== 'EmAdmissao' && ` até ${dataBR(c.fim)}`}
              </span>
            </div>
            {c.id === atual.id ? (
              <span className="muted small">Selecionado</span>
            ) : (
              <button className="btn btn--ghost" onClick={() => { selecionar(c.id); navigate('/'); }}>Consultar</button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
