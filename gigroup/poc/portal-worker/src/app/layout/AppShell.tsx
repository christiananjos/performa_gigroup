import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { iniciais } from '../../shared/lib/format';
import { sair, useContrato, useFeatures, useMe } from '../../shared/session/session';
import { track } from '../../shared/telemetry';
import { features, modulos } from '../modules';

// Destinos da barra inferior no celular, em ordem de prioridade. Entram os 4 primeiros liberados.
const PRIORIDADE_MOBILE: Record<string, string> = {
  'fundacao.inicio': 'Início',
  'financeiro.holerite': 'Holerites',
  'onboarding.admissao': 'Admissão',
  'gestao.ferias': 'Férias',
  'gestao.trct': 'Rescisão',
  'atendimento.faq': 'Ajuda',
};

export function AppShell() {
  const me = useMe();
  const { contrato, contratos, selecionar } = useContrato();
  const liberadas = useFeatures().data ?? [];
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const f = features.find((x) => x.rota === location.pathname);
    track('page_view', { feature: f?.id ?? location.pathname });
    setMenuAberto(false);
  }, [location.pathname]);

  const visiveis = features.filter((f) => f.page && liberadas.includes(f.id));
  const grupos = modulos
    .map((m) => ({ trilha: m.trilha, itens: visiveis.filter((f) => f.trilha === m.trilha && f.id !== 'fundacao.inicio') }))
    .filter((g) => g.itens.length);
  const barra = Object.keys(PRIORIDADE_MOBILE).map((id) => visiveis.find((f) => f.id === id)).filter((f) => f !== undefined).slice(0, 4);

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="logo">Gi Group <small>Portal do Worker</small></Link>
        <label className="contract-picker">
          <span className="sr-only">Contrato</span>
          <select value={contrato.id} onChange={(e) => { selecionar(e.target.value); navigate('/'); }}>
            {contratos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.tomadora}{c.situacao === 'Encerrado' ? ' (encerrado)' : c.situacao === 'EmAdmissao' ? ' (em admissão)' : ''}
              </option>
            ))}
          </select>
        </label>
        <Link to="/perfil" className="avatar" aria-label="Perfil">{iniciais(me.nome)}</Link>
      </header>

      <nav className={`sidebar ${menuAberto ? 'sidebar--open' : ''}`} aria-label="Menu">
        <NavLink to="/" end className="sidebar__link">Início</NavLink>
        {grupos.map((g) => (
          <div key={g.trilha} className="sidebar__group">
            <p className="sidebar__trilha">{g.trilha}</p>
            {g.itens.map((f) => <NavLink key={f.id} to={f.rota!} className="sidebar__link">{f.titulo}</NavLink>)}
          </div>
        ))}
        <div className="sidebar__group sidebar__foot">
          <NavLink to="/roadmap" className="sidebar__link">O que vem por aí</NavLink>
          <button className="sidebar__link" onClick={async () => { await sair(qc); navigate('/entrar', { replace: true }); }}>Sair</button>
        </div>
      </nav>
      {menuAberto && <div className="scrim" onClick={() => setMenuAberto(false)} />}

      <main className="content" key={contrato.id}>
        <Outlet />
      </main>

      <nav className="bottombar" aria-label="Atalhos">
        {barra.map((f) => (
          <NavLink key={f.id} to={f.rota!} end={f.rota === '/'}>{PRIORIDADE_MOBILE[f.id]}</NavLink>
        ))}
        <button onClick={() => setMenuAberto(true)} aria-expanded={menuAberto}>Menu</button>
      </nav>
    </div>
  );
}
