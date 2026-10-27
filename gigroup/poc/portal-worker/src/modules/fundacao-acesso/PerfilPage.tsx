import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { dataBR, iniciais } from '../../shared/lib/format';
import { sair, useMe } from '../../shared/session/session';
import { PageHeader } from '../../shared/ui/ui';

export default function PerfilPage() {
  const me = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader titulo="Perfil e privacidade" />
      <section className="profile">
        <span className="avatar avatar--lg" aria-hidden>{iniciais(me.nome)}</span>
        <dl className="data-list">
          <dt>Nome</dt><dd>{me.nome}</dd>
          <dt>CPF</dt><dd>{me.cpfMascarado}</dd>
          <dt>E-mail</dt><dd>{me.email}</dd>
          <dt>Celular</dt><dd>{me.celular}</dd>
        </dl>
      </section>
      <section className="section">
        <h2>Privacidade</h2>
        <p>
          Você aceitou o termo de privacidade versão 2026.1
          {me.termoAceitoEm && ` em ${dataBR(me.termoAceitoEm)}`}. Para pedir acesso, correção ou exclusão dos seus
          dados, fale com o encarregado de dados pelo e-mail <a href="mailto:privacidade@example.com">privacidade@example.com</a>.
        </p>
      </section>
      <button className="btn btn--ghost" onClick={async () => { await sair(qc); navigate('/entrar', { replace: true }); }}>
        Sair do portal
      </button>
    </>
  );
}
