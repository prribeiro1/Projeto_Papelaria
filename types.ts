
export enum OrderStatus {
  PENDING = 'Pendente',
  IN_PRODUCTION = 'Em Produção',
  WAITING_ART = 'Aguardando Arte',
  READY = 'Pronto p/ Retirada',
  DELIVERED = 'Entregue'
}

export interface Order {
  id: string;
  clientName: string;
  clientEmail: string;
  productName: string;
  value: number;
  costValue?: number;
  status: OrderStatus;
  createdAt: string;
  deadline: string;
  items?: any[];
}

export interface Quote {
  id: string;
  clientName?: string;
  clientId: string;
  description: string;
  value: number;
  items: any[];
  status: 'Rascunho' | 'Enviado' | 'Aprovado' | 'Recusado';
  validUntil: string;
  eventDate?: string;
  theme?: string;
  notes?: string;
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

export interface CompanySettings {
  id: string;
  name: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  pixKey?: string;
  quoteMessageTemplate?: string;
}
