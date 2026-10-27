const brlFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dataFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });
const mesFmt = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export const brl = (v: number) => brlFmt.format(v);
export const dataBR = (iso: string) => dataFmt.format(new Date(iso));

/** '2026-09' vira 'setembro de 2026'. Ano solto ('2025') volta como está. */
export const competencia = (ref: string) => (ref.length === 7 ? mesFmt.format(new Date(`${ref}-01`)) : ref);

export const iniciais = (nome: string) =>
  nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
