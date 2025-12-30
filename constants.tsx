
import { OrderStatus, Order, Client, KanbanTask, Quote, Product, Transaction } from './types';

export const INITIAL_ORDERS: Order[] = [
  { id: '4582', clientName: 'Mariana Silva', clientEmail: 'mariana.silva@email.com', productName: '100x Convites Luxo', value: 450.00, status: OrderStatus.WAITING_ART, createdAt: '12/10/2023', deadline: '20/10/2023' },
  { id: '4581', clientName: 'João Souza', clientEmail: 'joao.souza@email.com', productName: 'Banner Lona 2x1', value: 120.00, status: OrderStatus.IN_PRODUCTION, createdAt: '10/10/2023', deadline: '15/10/2023' },
  { id: '4580', clientName: 'Empresa Tech', clientEmail: 'contato@tech.com', productName: '500x Cartões Visita', value: 89.90, status: OrderStatus.READY, createdAt: '08/10/2023', deadline: '12/10/2023' },
];

export const INITIAL_QUOTES: Quote[] = [
  { id: 'Q-901', clientId: '4092', clientName: 'Clínica Sorriso', description: 'Reforma de Fachada + Adesivagem', value: 1250.00, items: [], status: 'Enviado', validUntil: '30/10/2023' },
  { id: 'Q-902', clientId: '4094', clientName: 'Escola ABC', description: '50x Agendas Escolares 2024', value: 2400.00, items: [], status: 'Aprovado', validUntil: '25/10/2023' },
  { id: 'Q-903', clientId: '4092', clientName: 'Padaria Pão Quente', description: '1000x Panfletos Couchê', value: 180.00, items: [], status: 'Rascunho', validUntil: '01/11/2023' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'P01', name: 'Papel A4 75g (Resma)', category: 'Papelaria', price: 32.50, stock: 45, unit: 'un' },
  { id: 'P02', name: 'Impressão Colorida Laser', category: 'Impressão', price: 2.50, stock: 999, unit: 'un' },
  { id: 'P03', name: 'Banner Lona 440g', category: 'Impressão', price: 65.00, stock: 120, unit: 'm²' },
  { id: 'P04', name: 'Plastificação A4', category: 'Serviço', price: 5.00, stock: 0, unit: 'un' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'T01', description: 'Venda Balcão #4578', value: 210.00, date: '23/10/2023', category: 'Vendas', type: 'Entrada' },
  { id: 'T02', description: 'Compra Papel Fotográfico', value: 350.00, date: '22/10/2023', category: 'Matéria Prima', type: 'Saída' },
  { id: 'T03', description: 'Energia Elétrica Outubro', value: 450.00, date: '20/10/2023', category: 'Custos Fixos', type: 'Saída' },
  { id: 'T04', description: 'Pagamento Pró-labore (Ana)', value: 3000.00, date: '05/10/2023', category: 'Pró-labore', type: 'Saída' },
];

export const INITIAL_CLIENTS: Client[] = [
  { id: '4092', name: 'Maria Silva', email: 'maria@email.com', phone: '(11) 99999-9999', address: 'Rua das Flores, 123, SP', totalSpent: 1250.00, orderCount: 5, status: 'Ativo' },
  { id: '4094', name: 'Ana Pereira', email: 'ana@email.com', phone: '(31) 97777-7777', address: 'Praça da Liberdade, 45, MG', totalSpent: 3890.00, orderCount: 12, status: 'VIP' },
];

export const INITIAL_KANBAN: KanbanTask[] = [
  { id: '1', title: 'Convites de Casamento', client: 'Mariana Silva', details: '150 unidades', deadline: '12 Out', priority: 'Urgente', stage: 'A Fazer' },
  { id: '3', title: 'Banner Promocional', client: 'Loja Tech', details: 'Lona 440g', deadline: 'Hoje, 14:00', priority: 'Normal', stage: 'Em Produção', operator: 'Ana Clara' },
];
