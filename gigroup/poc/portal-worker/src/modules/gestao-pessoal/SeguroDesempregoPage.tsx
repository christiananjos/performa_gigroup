import { DocumentosPage } from '../../shared/documentos/DocumentosPage';

export default function SeguroDesempregoPage() {
  return (
    <>
      <DocumentosPage
        tipos={['GuiaSeguroDesemprego']}
        titulo="Guia do seguro-desemprego"
        descricao="Baixe o requerimento e dê entrada pelo gov.br ou pela Carteira de Trabalho Digital."
      />
      <a className="btn btn--ghost" href="https://www.gov.br/pt-br/servicos/solicitar-o-seguro-desemprego" target="_blank" rel="noopener noreferrer">
        Como dar entrada no gov.br
      </a>
    </>
  );
}
