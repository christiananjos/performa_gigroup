import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function PageHeader({ titulo, descricao, children }: { titulo: string; descricao?: string; children?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <h1>{titulo}</h1>
        {descricao && <p className="muted">{descricao}</p>}
      </div>
      {children}
    </header>
  );
}

export function Carregando({ linhas = 3 }: { linhas?: number }) {
  return (
    <div className="stack" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} className="skeleton" />
      ))}
    </div>
  );
}

export function Erro({ onTentar }: { onTentar: () => void }) {
  return (
    <div className="state">
      <p>Não conseguimos carregar estas informações.</p>
      <button className="btn btn--ghost" onClick={onTentar}>Tentar de novo</button>
    </div>
  );
}

export function Vazio({ children }: { children: ReactNode }) {
  return <div className="state"><p>{children}</p></div>;
}

export function Indisponivel() {
  return (
    <div className="state">
      <h1>Esta área não está disponível</h1>
      <p className="muted">Ela não se aplica ao contrato selecionado ou ainda não foi liberada.</p>
      <Link className="btn" to="/">Voltar ao início</Link>
    </div>
  );
}
