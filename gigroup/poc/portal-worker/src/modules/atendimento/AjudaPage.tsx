import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../shared/api/http';
import { Carregando, PageHeader, Vazio } from '../../shared/ui/ui';

interface FaqItem { id: string; tema: string; pergunta: string; resposta: string }

export default function AjudaPage() {
  const { data } = useQuery({ queryKey: ['faq'], queryFn: () => api<FaqItem[]>('/faq') });
  const [busca, setBusca] = useState('');
  const [bot, setBot] = useState(false);

  const termo = busca.trim().toLowerCase();
  const itens = data?.filter((f) => !termo || `${f.pergunta} ${f.resposta}`.toLowerCase().includes(termo)) ?? [];
  const temas = [...new Set(itens.map((f) => f.tema))];

  return (
    <>
      <PageHeader titulo="Dúvidas" descricao="Procure sua dúvida ou converse com o assistente virtual.">
        <button className="btn btn--primary" onClick={() => setBot(true)}>Falar com o assistente</button>
      </PageHeader>

      {bot && (
        <aside className="bot" aria-label="Assistente virtual">
          <p><strong>Assistente Gi</strong></p>
          <p className="bot__msg">Oi! Posso ajudar com holerite, férias, documentos e acesso. O que você precisa?</p>
          <p className="muted small">No produto, o widget do BOT da Gi Group carrega aqui.</p>
          <button className="link" onClick={() => setBot(false)}>Fechar</button>
        </aside>
      )}

      <input className="search" type="search" placeholder="Ex.: informe de rendimentos" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar dúvida" />

      {!data && <Carregando />}
      {data && !itens.length && <Vazio>Nada encontrado para “{busca}”. Tente outra palavra ou fale com o assistente.</Vazio>}
      {temas.map((t) => (
        <section key={t} className="section">
          <h2>{t}</h2>
          {itens.filter((f) => f.tema === t).map((f) => (
            <details key={f.id} className="faq">
              <summary>{f.pergunta}</summary>
              <p>{f.resposta}</p>
            </details>
          ))}
        </section>
      ))}
    </>
  );
}
