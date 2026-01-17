
export type UserRole = 'ADMIN' | 'AGENT';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  photoURL?: string;
  lastLogin: string;
  active: boolean;
}

export enum ClientStatus {
  EN_COURS = 'en cours',
  CLIENT_CONFIRME = 'client confirmé',
  VENTE_CONCLUE = 'vente conclue'
}

export interface Client {
  id: string;
  name: string;
  status: ClientStatus;
  createdAt: string;
  agentId: string;
  phonePrefix?: string;
  phone?: string;
  country?: string;
  city?: string;
  product?: string;
  revenue_estimate?: number;
  notes?: string;
  rejectionReason?: string;
}

export interface RemoteForm {
  id: string;
  agentId: string;
  name: string;
  email: string;
  phonePrefix: string;
  phone: string;
  country: string;
  city: string;
  product: string;
  message: string;
  date: string;
  status: 'en_attente' | 'valide';
}

export interface Sale {
  id: string;
  clientId: string;
  agentId: string;
  ca: number;
  mr: number;
  benefit: number;
  commission: number;
  date: string;
  validatedBy: string;
}

export interface Commission {
  id: string;
  agentId: string;
  saleId: string;
  amount: number;
  status: 'en_attente' | 'payée';
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'ALERT';
  date: string;
  read: boolean;
}
