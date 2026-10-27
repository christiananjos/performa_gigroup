import { FASES } from '../shared/types';
import { PageHeader } from '../shared/ui/ui';
import { features, modulos } from './modules';

/** Gerado direto do registro de módulos: o roadmap mostrado é o mesmo que o código conhece. */
export default function RoadmapPage() {
  return (
    <>
      <PageHeader titulo="O que vem por aí" descricao="O portal cresce em quatro fases até o fim de 2027." />
      <div className="roadmap">
        {FASES.map((fase, i) => (
          <section key={fase.id} className={`roadmap__fase ${i === 0 ? 'roadmap__fase--atual' : ''}`}>
            <h2>{fase.nome}</h2>
            <p className="muted small">{i === 0 ? 'Disponível agora' : fase.periodo}</p>
            {modulos.map((m) => {
              const itens = features.filter((f) => f.fase === fase.id && f.trilha === m.trilha);
              return itens.length ? (
                <div key={m.id} className="roadmap__trilha">
                  <p>{m.trilha}</p>
                  <ul>{itens.map((f) => <li key={f.id}>{f.titulo}</li>)}</ul>
                </div>
              ) : null;
            })}
          </section>
        ))}
      </div>
    </>
  );
}
