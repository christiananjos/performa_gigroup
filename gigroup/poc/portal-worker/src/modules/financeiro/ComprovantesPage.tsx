import { DocumentosPage } from '../../shared/documentos/DocumentosPage';

export default function ComprovantesPage() {
  return <DocumentosPage tipos={['ComprovantePagamento']} titulo="Comprovantes de pagamento" descricao="Comprovantes dos créditos feitos na sua conta." />;
}
