import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../shared/api/http';
import { sair } from '../../shared/session/session';

export default function ConsentimentoPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function aceitar() {
    await api('/lgpd/aceite', { method: 'POST', body: { versao: '2026.1' } });
    await qc.invalidateQueries({ queryKey: ['me'] });
    navigate('/', { replace: true });
  }

  async function recusar() {
    await sair(qc);
    navigate('/entrar', { replace: true });
  }

  return (
    <main className="consent">
      <span className="logo">Gi Group <small>Portal do Worker</small></span>
      <h1>Como usamos seus dados</h1>
      <p className="muted">Termo de privacidade, versão 2026.1</p>
      <div className="consent__termo" tabIndex={0}>
        <p>Para mostrar seus contratos, holerites e documentos, o portal trata os dados da sua relação de trabalho com a Gi Group: identificação, contrato, pagamentos e documentos trabalhistas.</p>
        <p>Usamos esses dados só para cumprir o contrato e obrigações legais. Eles não são vendidos nem usados para publicidade.</p>
        <p>Você pode pedir acesso, correção ou exclusão a qualquer momento pelo canal do encarregado de dados, em Perfil e privacidade.</p>
      </div>
      <div className="consent__acoes">
        <button className="btn btn--primary" onClick={aceitar}>Aceitar e continuar</button>
        <button className="btn btn--ghost" onClick={recusar}>Não aceito, sair</button>
      </div>
    </main>
  );
}
