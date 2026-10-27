import { DocumentosPage } from '../../shared/documentos/DocumentosPage';

export default function RescisaoPage() {
  return (
    <DocumentosPage
      tipos={['TRCT', 'ComprovanteRescisao']}
      titulo="TRCT e comprovante"
      descricao="Termo de rescisão do contrato e comprovante do pagamento das verbas rescisórias."
    />
  );
}
