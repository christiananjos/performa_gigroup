type Evento = 'page_view' | 'document_download' | 'form_submit' | 'link_out';

/**
 * Base do "Dashboard de uso" (fase Otimização). Nunca envie dado pessoal nas props.
 * ponytail: no POC só loga; no produto acumula e envia em lote para POST /api/telemetria.
 */
export function track(evento: Evento, props: Record<string, string> = {}) {
  console.debug('[telemetria]', evento, props);
}
