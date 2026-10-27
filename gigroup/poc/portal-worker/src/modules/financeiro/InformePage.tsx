import { DocumentosPage } from '../../shared/documentos/DocumentosPage';

export default function InformePage() {
  return <DocumentosPage tipos={['InformeRendimentos']} titulo="Informe de rendimentos" descricao="Use na declaração do Imposto de Renda. Inclui todos os seus contratos no ano." />;
}
