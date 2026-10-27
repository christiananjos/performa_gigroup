import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../shared/api/http';
import { ApiError } from '../../shared/api/ApiError';

const mascararCpf = (v: string) =>
  v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

export default function LoginPage() {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string>();
  const [aviso, setAviso] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    setErro(undefined);
    setEnviando(true);
    try {
      await api('/auth/login', { method: 'POST', body: { cpf, senha } });
      navigate('/', { replace: true });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível entrar agora. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      <section className="login__brand">
        <span className="logo logo--light">Gi Group <small>Portal do Worker</small></span>
        <p className="login__claim">Seu holerite, suas férias e seus documentos da Gi&nbsp;Group, num lugar só.</p>
      </section>
      <form className="login__form" onSubmit={entrar} noValidate>
        <h1>Entrar</h1>
        <label>
          CPF
          <input inputMode="numeric" autoComplete="username" value={cpf} onChange={(e) => setCpf(mascararCpf(e.target.value))} placeholder="000.000.000-00" required />
        </label>
        <label>
          Senha
          <input type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </label>
        {erro && <p className="form-error" role="alert">{erro}</p>}
        <button className="btn btn--primary btn--block" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
        <div className="login__links">
          <button type="button" className="link" onClick={() => setAviso('Primeiro acesso: CPF e data de nascimento, código no celular e criação da senha, em 3 passos.')}>Primeiro acesso</button>
          <button type="button" className="link" onClick={() => setAviso('Enviaremos um código para o celular cadastrado para você criar uma nova senha.')}>Esqueci minha senha</button>
        </div>
        {aviso && <p className="muted" role="status">{aviso}</p>}
        <p className="muted small">Demonstração: qualquer CPF com 11 dígitos e senha com 6 caracteres.</p>
      </form>
    </div>
  );
}
