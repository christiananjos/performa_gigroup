// Simula o BFF (.NET) do Portal do Worker. Todos os dados são fictícios.
// ponytail: mock em memória para o POC; no produto isso vira handlers MSW (src/mocks/handlers.ts).
import { ApiError } from '../shared/api/ApiError';
import type { ApiInit } from '../shared/api/http';
import type {
  Admissao, Contrato, Documento, HoleriteDetalhe, SituacaoContrato, TipoDocumento, Worker,
} from '../shared/types';

const contratos: Contrato[] = [
  { id: 'c1', tomadora: 'Metalúrgica Vale Azul', cargo: 'Operadora de empilhadeira', tipo: 'Efetivo', situacao: 'Ativo', inicio: '2025-03-10', fim: null },
  { id: 'c3', tomadora: 'Hospital Santa Clara', cargo: 'Recepcionista', tipo: 'Temporário', situacao: 'EmAdmissao', inicio: '2026-11-16', fim: '2027-05-15' },
  { id: 'c2', tomadora: 'Distribuidora Rota Sul', cargo: 'Auxiliar de logística', tipo: 'Efetivo', situacao: 'Encerrado', inicio: '2023-08-01', fim: '2025-02-14' },
];

const worker: Omit<Worker, 'consentimentoPendente' | 'termoAceitoEm'> = {
  nome: 'Juliana Prado',
  cpfMascarado: '***.482.317-**',
  email: 'juliana.prado@email.com',
  celular: '(11) 9****-4471',
};

const comuns = ['fundacao.inicio', 'fundacao.perfil', 'fundacao.contratos', 'atendimento.faq', 'atendimento.contato', 'atendimento.ouvidoria'];

// BR-004: o backend decide o que cada situação de contrato enxerga.
const featuresPorSituacao: Record<SituacaoContrato, string[]> = {
  EmAdmissao: [...comuns, 'onboarding.admissao'],
  Ativo: [...comuns, 'fundacao.links', 'gestao.ficha', 'gestao.ferias', 'gestao.dados',
    'financeiro.holerite', 'financeiro.informe', 'financeiro.comprovantes', 'financeiro.recibos-ferias'],
  Encerrado: [...comuns, 'gestao.ficha', 'gestao.trct', 'gestao.seguro',
    'financeiro.holerite', 'financeiro.informe', 'financeiro.comprovantes'],
};

function holerite(competencia: string, horasExtras: number): HoleriteDetalhe {
  const proventos = [{ descricao: 'Salário base', valor: 2650 }];
  if (horasExtras) proventos.push({ descricao: 'Horas extras 50%', valor: horasExtras });
  const bruto = proventos.reduce((s, p) => s + p.valor, 0);
  const descontos = [
    { descricao: 'INSS', valor: Math.round(bruto * 0.09 * 100) / 100 },
    { descricao: 'Vale-transporte', valor: 159 },
  ];
  const liquido = Math.round((bruto - descontos.reduce((s, d) => s + d.valor, 0)) * 100) / 100;
  return { competencia, proventos, descontos, liquido };
}

const holerites: Record<string, HoleriteDetalhe[]> = {
  c1: [holerite('2026-09', 281.4), holerite('2026-08', 187.6), holerite('2026-07', 0), holerite('2026-06', 93.8)],
  c2: [holerite('2025-01', 0), holerite('2024-12', 187.6)],
};

const proximoMes = (ref: string) => {
  const [a, m] = ref.split('-').map(Number);
  return m === 12 ? `${a + 1}-01-05` : `${a}-${String(m + 1).padStart(2, '0')}-05`;
};

function documentos(contratoId: string, tipo: TipoDocumento): Documento[] {
  const hs = holerites[contratoId] ?? [];
  switch (tipo) {
    case 'Holerite':
      return hs.map((h) => ({ id: `${contratoId}-hol-${h.competencia}`, tipo, titulo: 'Holerite mensal', referencia: h.competencia, dataEmissao: proximoMes(h.competencia), valorLiquido: h.liquido }));
    case 'ComprovantePagamento':
      return hs.map((h) => ({ id: `${contratoId}-cmp-${h.competencia}`, tipo, titulo: 'Crédito de salário', referencia: h.competencia, dataEmissao: proximoMes(h.competencia), valorLiquido: h.liquido }));
    case 'InformeRendimentos':
      return [
        { id: 'inf-2025', tipo, titulo: 'Informe de rendimentos', referencia: '2025', dataEmissao: '2026-02-27' },
        { id: 'inf-2024', tipo, titulo: 'Informe de rendimentos', referencia: '2024', dataEmissao: '2025-02-28' },
      ];
    case 'ReciboFerias':
      return contratoId === 'c1' ? [{ id: 'c1-fer-2026', tipo, titulo: 'Recibo de férias (15 dias)', referencia: '2026-04', dataEmissao: '2026-03-30', valorLiquido: 1798.22 }] : [];
    case 'FichaRegistro':
      return [{ id: `${contratoId}-ficha`, tipo, titulo: 'Ficha de registro do empregado', referencia: contratos.find((c) => c.id === contratoId)!.inicio.slice(0, 7), dataEmissao: contratos.find((c) => c.id === contratoId)!.inicio }];
    case 'TRCT':
      return contratoId === 'c2' ? [{ id: 'c2-trct', tipo, titulo: 'Termo de rescisão (TRCT)', referencia: '2025-02', dataEmissao: '2025-02-20', valorLiquido: 6412.9 }] : [];
    case 'ComprovanteRescisao':
      return contratoId === 'c2' ? [{ id: 'c2-cres', tipo, titulo: 'Comprovante de pagamento da rescisão', referencia: '2025-02', dataEmissao: '2025-02-24', valorLiquido: 6412.9 }] : [];
    case 'GuiaSeguroDesemprego':
      return contratoId === 'c2' ? [{ id: 'c2-sd', tipo, titulo: 'Requerimento do seguro-desemprego', referencia: '2025-02', dataEmissao: '2025-02-20' }] : [];
  }
}

const admissao: Admissao = {
  acolhendoUrl: 'https://example.com/programa-acolhendo',
  etapas: [
    { titulo: 'Documentos recebidos', status: 'Concluida' },
    { titulo: 'Exame admissional', status: 'Atual', acaoEsperada: 'Compareça à clínica Vida Plena até 07/11, das 7h às 11h, em jejum.' },
    { titulo: 'Assinatura do contrato', status: 'Pendente' },
    { titulo: 'Integração na tomadora', status: 'Pendente' },
    { titulo: 'Primeiro dia de trabalho', status: 'Pendente' },
  ],
};

const faq = [
  { id: 'f1', tema: 'Pagamento', pergunta: 'Quando o salário cai na conta?', resposta: 'Até o 5º dia útil do mês seguinte ao trabalhado. O holerite fica disponível no portal no mesmo dia.' },
  { id: 'f2', tema: 'Pagamento', pergunta: 'Encontrei um erro no meu holerite. O que faço?', resposta: 'Abra uma manifestação em Ouvidoria e sugestões, tipo Reclamação, informando o mês e o item.' },
  { id: 'f3', tema: 'Férias', pergunta: 'Como sei quantos dias de férias tenho?', resposta: 'Em Férias você vê o saldo do período aquisitivo atual e as férias já programadas.' },
  { id: 'f4', tema: 'Documentos', pergunta: 'Onde pego o informe de rendimentos para o Imposto de Renda?', resposta: 'Em Informe de rendimentos. Ele fica disponível até o fim de fevereiro de cada ano.' },
  { id: 'f5', tema: 'Acesso', pergunta: 'Esqueci minha senha.', resposta: 'Na tela de entrada, toque em Esqueci minha senha. Enviamos um código para o celular cadastrado.' },
];

const canais = [
  { id: 'tel', titulo: 'Central de atendimento', valor: '0800 000 0000', href: 'tel:08000000000', detalhe: 'Segunda a sexta, das 8h às 18h' },
  { id: 'wa', titulo: 'WhatsApp', valor: '(11) 90000-0000', href: 'https://wa.me/5511900000000', detalhe: 'Atendimento 24h com o assistente virtual' },
  { id: 'mail', titulo: 'E-mail da filial', valor: 'atendimento.filial@example.com', href: 'mailto:atendimento.filial@example.com', detalhe: 'Resposta em até 2 dias úteis' },
];

const links = [
  { id: 'l1', titulo: 'Ponto eletrônico da tomadora', descricao: 'Registre e consulte suas marcações', url: 'https://example.com/ponto' },
  { id: 'l2', titulo: 'Cartão de benefícios', descricao: 'Saldo de vale-refeição e vale-alimentação', url: 'https://example.com/beneficios' },
  { id: 'l3', titulo: 'Universidade corporativa', descricao: 'Cursos obrigatórios da tomadora', url: 'https://example.com/cursos' },
];

// ponytail: sessionStorage aqui SIMULA o cookie HttpOnly do BFF; o app de verdade nunca guarda sessão no cliente.
const sessao = {
  get logado() { return sessionStorage.getItem('poc.sessao') !== null; },
  get termoAceitoEm() { return sessionStorage.getItem('poc.sessao') || null; },
  entrar() { sessionStorage.setItem('poc.sessao', ''); },
  aceitar() { sessionStorage.setItem('poc.sessao', new Date().toISOString()); },
  sair() { sessionStorage.removeItem('poc.sessao'); },
};

// Atalho de demonstração: ?demo entra já logado e com o termo aceito (usado nas capturas de tela).
if (new URLSearchParams(location.search).has('demo')) sessao.aceitar();

const espera = () => new Promise((r) => setTimeout(r, 250));

export async function mockApi(path: string, init: ApiInit): Promise<unknown> {
  await espera();
  const metodo = init.method ?? 'GET';
  const [rota, qs] = path.split('?');
  const query = new URLSearchParams(qs);
  const body = (init.body ?? {}) as Record<string, string>;

  if (rota === '/auth/login' && metodo === 'POST') {
    if (body.cpf?.replace(/\D/g, '').length !== 11 || (body.senha ?? '').length < 6) {
      throw new ApiError(401, 'CPF ou senha incorretos. Confira e tente de novo.');
    }
    sessao.entrar();
    return null;
  }
  if (!sessao.logado) throw new ApiError(401, 'Sua sessão expirou. Entre de novo.');
  if (rota === '/auth/logout') return sessao.sair();
  if (rota === '/me') return { ...worker, termoAceitoEm: sessao.termoAceitoEm, consentimentoPendente: !sessao.termoAceitoEm };
  if (rota === '/lgpd/aceite') return sessao.aceitar();
  if (rota === '/contratos') return contratos;
  if (rota === '/me/features') {
    const c = contratos.find((x) => x.id === query.get('contratoId'));
    return c ? featuresPorSituacao[c.situacao] : [];
  }
  if (rota === '/faq') return faq;
  if (rota === '/ouvidoria') return { protocolo: `OUV-2026-${String(Math.floor(Math.random() * 90000) + 10000)}` };

  let m = rota.match(/^\/documentos\/(.+)\/pdf$/);
  if (m) return `<title>${m[1]}</title><body style="font-family:sans-serif;padding:40px"><h1>Documento ${m[1]}</h1><p>No produto, este é o PDF gerado pelo sistema de folha e entregue pelo BFF.</p></body>`;

  m = rota.match(/^\/contratos\/(\w+)\/(.+)$/);
  if (m) {
    const [, id, recurso] = m;
    if (recurso === 'documentos') return documentos(id, query.get('tipo') as TipoDocumento);
    if (recurso.startsWith('holerites/')) return holerites[id]?.find((h) => h.competencia === recurso.split('/')[1]);
    if (recurso === 'admissao') return admissao;
    if (recurso === 'links') return links;
    if (recurso === 'canais-contato') return canais;
    if (recurso === 'ferias') {
      return {
        periodoAquisitivo: { inicio: '2026-03-10', fim: '2027-03-09' },
        saldoDias: 15,
        programadas: [{ inicio: '2026-12-21', fim: '2027-01-04', dias: 15 }],
        historico: [{ inicio: '2026-04-06', fim: '2026-04-20', dias: 15 }],
      };
    }
    if (recurso === 'dados-cadastrais') {
      return {
        endereco: 'Rua das Acácias, 120, apto 34, Jardim Primavera, Osasco/SP',
        banco: 'Banco 341, agência 0***, conta ****-7',
        dependentes: ['Lucas Prado (filho, 7 anos)'],
        solicitacoes: [{ id: 's1', campo: 'Endereço', status: 'Aprovada', criadaEm: '2026-08-14' }],
      };
    }
    if (recurso === 'solicitacoes-cadastrais') return { id: 's2', status: 'Enviada' };
  }
  throw new ApiError(404, `Rota não encontrada no mock: ${metodo} ${path}`);
}
