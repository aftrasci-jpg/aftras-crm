
import { User, Client, ClientStatus } from './types';

export const MOCK_USERS: User[] = [
  { id: 'admin-1', name: 'Directeur Alpha', role: 'ADMIN', email: 'admin@salesflow.com', lastLogin: '2023-10-01', active: true },
  { id: 'agent-1', name: 'Agent Smith', role: 'AGENT', email: 'smith@salesflow.com', lastLogin: '2023-10-05', active: true },
  { id: 'agent-2', name: 'Agent Doe', role: 'AGENT', email: 'doe@salesflow.com', lastLogin: '2023-10-10', active: true },
];

export const MOCK_CLIENTS: Client[] = [
  { id: 'c-1', name: 'Entreprise Zenith', status: ClientStatus.CLIENT_CONFIRME, createdAt: '2023-10-01', agentId: 'agent-1' },
  { id: 'c-2', name: 'Global Tech', status: ClientStatus.EN_COURS, createdAt: '2023-10-05', agentId: 'agent-1' },
  { id: 'c-3', name: 'Nova Soft', status: ClientStatus.EN_COURS, createdAt: '2023-10-10', agentId: 'agent-2' },
];

export const COMMISSION_RATE = 0.15; // 15% de commission sur le bénéfice
