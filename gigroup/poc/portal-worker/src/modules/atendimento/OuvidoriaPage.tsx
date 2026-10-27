import { useState, type FormEvent } from 'react';
import { api } from '../../shared/api/http';
import { track } from '../../shared/telemetry';
import { PageHeader } from '../../shared/ui/ui';

const tipos = ['Elogio', 'Sugestão', 'Reclamação', 'Denúncia'];

export default function OuvidoriaPage() {
  const [protocolo, setProtocolo] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEnviando(true);
    const r = await api<{ protocolo: string }>('/ouvidoria', {
      method: 'POST',
      body: { tipo: form.get('tipo'), mensagem: form.get('mensagem'), anonima: form.get('anonima') === 'on' },
    });
    track('form_submit', { form: 'ouvidoria' });
    setProtocolo(r.protocolo);
    setEnviando(false);
  }

  if (protocolo) {
    return (
      <div className="state">
        <h1>Manifestação enviada</h1>
        <p>Seu protocolo é <strong className="protocolo">{protocolo}</strong>. Guarde este número para acompanhar.</p>
        <button className="btn btn--ghost" onClick={() => setProtocolo(undefined)}>Enviar outra</button>
      </div>
    );
  }

  return (
    <>
      <PageHeader titulo="Ouvidoria e sugestões" descricao="Conte o que aconteceu. Você pode enviar sem se identificar." />
      <form className="form-card" onSubmit={enviar}>
        <fieldset className="chips">
          <legend>Tipo</legend>
          {tipos.map((t, i) => (
            <label key={t} className="chip">
              <input type="radio" name="tipo" value={t} defaultChecked={i === 1} />
              {t}
            </label>
          ))}
        </fieldset>
        <label>
          Mensagem
          <textarea name="mensagem" rows={5} required minLength={10} maxLength={2000} />
        </label>
        <label className="check">
          <input type="checkbox" name="anonima" />
          Enviar de forma anônima
        </label>
        <button className="btn btn--primary" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar manifestação'}</button>
      </form>
    </>
  );
}
