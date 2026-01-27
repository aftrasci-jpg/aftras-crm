import { UserApp, Prospect, Client, ProspectStatus, UserStatus, Sale, NotificationApp, AccessCode, RemoteProspect } from '../types';
import { dbService } from './db';

const COLLECTIONS = {
  USERS: 'users',
  PROSPECTS: 'prospects',
  CLIENTS: 'clients',
  SALES: 'sales',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  ACCESS_CODES: 'access_codes',
  REMOTE_PROSPECTS: 'remote_prospects'
};

const DEFAULT_SETTINGS = { name: 'AFTRAS CRM', currency: 'FCFA', logo: null };

export const dataService = {

  // --- SETTINGS ---
  getAppSettings: async () => {
    try {
      const settings = await dbService.getById(COLLECTIONS.SETTINGS, 'app_config');
      return (settings as any) || DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  updateAppSettings: async (settings: { name: string, currency: string }) => {
    await dbService.update(COLLECTIONS.SETTINGS, 'app_config', settings);
    window.dispatchEvent(new Event('app-settings-changed'));
  },

  getAppLogo: async () => {
    try {
      const settings = await dbService.getById(COLLECTIONS.SETTINGS, 'app_config');
      return (settings as any)?.logo || null;
    } catch {
      return null;
    }
  },

  updateAppLogo: async (logo: string) => {
    await dbService.update(COLLECTIONS.SETTINGS, 'app_config', { logo });
    window.dispatchEvent(new Event('app-logo-changed'));
  },

  // --- USERS ---
  getUsers: async (): Promise<UserApp[]> => {
    return (await dbService.getAll(COLLECTIONS.USERS)) as UserApp[];
  },

  addUser: async (user: Omit<UserApp, 'id' | 'createdAt' | 'status'> & { status?: UserStatus; id: string }) => {
    const newUser = {
      ...user,
      status: user.status || UserStatus.PENDING,
      createdAt: new Date().toISOString()
    };
    return await dbService.add(COLLECTIONS.USERS, newUser);
  },

  updateUserStatus: async (userId: string, status: UserStatus) => {
    await dbService.update(COLLECTIONS.USERS, userId, { status });
  },

  updateUser: async (userId: string, data: Partial<UserApp>) => {
    await dbService.update(COLLECTIONS.USERS, userId, data);
    const updated = await dbService.getById(COLLECTIONS.USERS, userId);
    return updated as UserApp;
  },

  // --- DELETE USER ---
  deleteUser: async (userId: string) => {
    await dbService.delete(COLLECTIONS.USERS, userId);
  },

  // --- PROSPECTS ---
  getProspects: async (): Promise<Prospect[]> => {
    return (await dbService.getAll(COLLECTIONS.PROSPECTS)) as Prospect[];
  },

  getProspectsByAgent: async (agentId: string): Promise<Prospect[]> => {
    return (await dbService.getByQuery(COLLECTIONS.PROSPECTS, 'agentId', '==', agentId)) as Prospect[];
  },

  addProspect: async (prospect: Omit<Prospect, 'id' | 'createdAt' | 'status'>) => {
    const newProspect = {
      ...prospect,
      status: ProspectStatus.PENDING,
      createdAt: new Date().toISOString()
    };
    return await dbService.add(COLLECTIONS.PROSPECTS, newProspect);
  },

  updateProspect: async (prospectId: string, data: Partial<Prospect>) => {
    await dbService.update(COLLECTIONS.PROSPECTS, prospectId, data);
  },

  deleteProspect: async (prospectId: string) => {
    await dbService.delete(COLLECTIONS.PROSPECTS, prospectId);
  },

  convertToClient: async (prospectId: string) => {
    const prospect = (await dbService.getById(COLLECTIONS.PROSPECTS, prospectId)) as Prospect;
    if (!prospect) return;

    await dbService.update(COLLECTIONS.PROSPECTS, prospectId, { status: ProspectStatus.CONVERTED });

    const newClient: Omit<Client, 'id'> = {
      agentId: prospect.agentId,
      prospectId: prospect.id,
      fullName: prospect.fullName,
      company: prospect.company || '',
      email: prospect.email,
      phone: prospect.phone,
      country: prospect.country,
      product: prospect.productOfInterest,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    await dbService.add(COLLECTIONS.CLIENTS, newClient);
  },

  // --- CLIENTS ---
  getClients: async (): Promise<Client[]> => {
    return (await dbService.getAll(COLLECTIONS.CLIENTS)) as Client[];
  },

  getClientsByAgent: async (agentId: string): Promise<Client[]> => {
    return (await dbService.getByQuery(COLLECTIONS.CLIENTS, 'agentId', '==', agentId)) as Client[];
  },

  deleteClient: async (clientId: string, reason: string) => {
    await dbService.update(COLLECTIONS.CLIENTS, clientId, { 
      status: 'CANCELLED', 
      deletionReason: reason 
    });
  },

  // --- SALES & COMMISSIONS ---
  getSales: async (): Promise<Sale[]> => {
    return (await dbService.getAll(COLLECTIONS.SALES)) as Sale[];
  },

  getSalesByAgent: async (agentId: string): Promise<(Sale & { clientName: string })[]> => {
    const sales = (await dbService.getByQuery(COLLECTIONS.SALES, 'agentId', '==', agentId)) as Sale[];
    // Correction: On utilise getClientsByAgent au lieu de getClients global.
    // Cela permet aux agents de récupérer les noms de leurs propres clients (autorisé par les règles Firestore).
    const clients = await dataService.getClientsByAgent(agentId);
    return sales.map(s => {
      const client = clients.find(c => c.id === s.clientId);
      return { ...s, clientName: client?.fullName || 'Client Inconnu' };
    });
  },

  addSale: async (sale: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale = {
      ...sale,
      createdAt: new Date().toISOString()
    };
    await dbService.add(COLLECTIONS.SALES, newSale);
    await dbService.update(COLLECTIONS.CLIENTS, sale.clientId, { status: 'SALE_CONCLUDED' });
  },

  updateSale: async (saleId: string, data: Partial<Sale>) => {
    await dbService.update(COLLECTIONS.SALES, saleId, data);
  },

  updateSaleStatus: async (saleId: string, status: Sale['status']) => {
    await dbService.update(COLLECTIONS.SALES, saleId, { status });
  },

  // --- NOTIFICATIONS ---
  getNotifications: async (userId?: string): Promise<NotificationApp[]> => {
    if (userId) {
      return (await dbService.getByQuery(COLLECTIONS.NOTIFICATIONS, 'userId', '==', userId)) as NotificationApp[];
    }
    return (await dbService.getAll(COLLECTIONS.NOTIFICATIONS)) as NotificationApp[];
  },

  markAllNotificationsAsRead: async (userId?: string) => {
    const notifs = await dataService.getNotifications(userId);
    const promises = notifs.map(n => dbService.update(COLLECTIONS.NOTIFICATIONS, n.id, { read: true }));
    await Promise.all(promises);
  },

  // --- ACCESS CODES ---
  getAccessCode: async (): Promise<AccessCode> => {
    const codes = await dbService.getAll(COLLECTIONS.ACCESS_CODES) as AccessCode[];
    return codes[0] || { code: '', expiresAt: '', isActive: false } as AccessCode;
  },

  getSupervisorAccessCode: async (): Promise<AccessCode> => {
    const codes = await dbService.getAll('supervisor_access_codes') as AccessCode[];
    return codes[0] || { code: '', expiresAt: '', isActive: false } as AccessCode;
  },

  generateNewCode: async (): Promise<AccessCode> => {
    const newCode = {
      code: `CRM-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`,
      expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24h
      isActive: true
    };
    const oldCodes = await dbService.getAll(COLLECTIONS.ACCESS_CODES);
    for (const c of oldCodes) {
      await dbService.delete(COLLECTIONS.ACCESS_CODES, c.id);
    }
    const docRef = await dbService.add(COLLECTIONS.ACCESS_CODES, newCode);
    return { id: docRef.id, ...newCode } as AccessCode;
  },

  generateNewSupervisorCode: async (): Promise<AccessCode> => {
    const newCode = {
      code: `SUP-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`,
      expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24h
      isActive: true
    };
    const oldCodes = await dbService.getAll('supervisor_access_codes');
    for (const c of oldCodes) {
      await dbService.delete('supervisor_access_codes', c.id);
    }
    const docRef = await dbService.add('supervisor_access_codes', newCode);
    return { id: docRef.id, ...newCode } as AccessCode;
  },

  // --- REMOTE LEADS ---
  getRemoteProspectsByAgent: async (agentId: string): Promise<RemoteProspect[]> => {
    return (await dbService.getByQuery(COLLECTIONS.REMOTE_PROSPECTS, 'agentId', '==', agentId)) as RemoteProspect[];
  },

  addRemoteLead: async (lead: any) => {
    const newLead = {
      ...lead,
      isVerified: false,
      createdAt: new Date().toISOString()
    };
    await dbService.add(COLLECTIONS.REMOTE_PROSPECTS, newLead);
    window.dispatchEvent(new Event('remote-leads-updated'));
  },

  confirmRemoteProspect: async (id: string) => {
    const lead = (await dbService.getById(COLLECTIONS.REMOTE_PROSPECTS, id)) as RemoteProspect;
    if (!lead) return;
    
    const { isVerified, ...prospectData } = lead;
    await dataService.addProspect(prospectData as any);
    await dbService.delete(COLLECTIONS.REMOTE_PROSPECTS, id);
  },

  deleteRemoteProspect: async (id: string) => {
    await dbService.delete(COLLECTIONS.REMOTE_PROSPECTS, id);
  },

  // --- NEW: REAL DATA CALCULATIONS ---
  getProspectsTodayByAgent: async (agentId: string): Promise<number> => {
    const prospects = await dbService.getByQuery(COLLECTIONS.PROSPECTS, 'agentId', '==', agentId) as Prospect[];
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
    
    return prospects.filter(p => p.createdAt >= startOfDay && p.createdAt < endOfDay).length;
  },

  getAgentCommissionTotal: async (agentId: string): Promise<number> => {
    const sales = await dbService.getByQuery(COLLECTIONS.SALES, 'agentId', '==', agentId) as Sale[];
    return sales.reduce((total, sale) => total + sale.commission, 0);
  }
};
