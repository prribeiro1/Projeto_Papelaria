
export enum OrderStatus {
  PENDING = 'Pendente',
  IN_PRODUCTION = 'Em Produção',
  WAITING_ART = 'Aguardando Arte',
  FINISHING = 'Acabamento',
  READY = 'Pronto p/ Retirada',
  DELIVERED = 'Entregue'
}

export interface Order {
  id: string;
  clientName: string;
  clientEmail: string;
  productName: string;
  value: number;
  status: OrderStatus;
  createdAt: string;
  deadline: string;
}

export interface Quote {
  id: string;
  clientName: string;
  description: string;
  value: number;
  status: 'Rascunho' | 'Enviado' | 'Aprovado' | 'Recusado';
  validUntil: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalSpent: number;
  orderCount: number;
  status: 'Ativo' | 'Inativo' | 'VIP' | 'Novo';
}

export interface KanbanTask {
  id: string;
  title: string;
  client: string;
  details: string;
  deadline: string;
  priority: 'Urgente' | 'Novo' | 'Normal';
  stage: 'A Fazer' | 'Em Produção' | 'Revisão' | 'Pronto';
  operator?: string;
  warning?: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Impressão' | 'Papelaria' | 'Serviço';
  price: number;
  stock: number;
  unit: 'un' | 'm²' | 'cento';
}

export interface Transaction {
  id: string;
  description: string;
  value: number;
  date: string;
  category: string;
  type: 'Entrada' | 'Saída';
}
