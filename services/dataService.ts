import { dbService } from './db';
import { UserApp, UserRole, UserStatus, Prospect, ProspectStatus, Client, Sale, NotificationApp, AppSettings, AccessCode } from '../types';

export const dataService = {
  // App Settings
  getAppSettings: async (): Promise<AppSettings> => {
    const settings = await dbService.getById('settings', 'app_config');
    if (settings && typeof settings === 'object' && 'name' in settings && 'currency' in settings) {
      return settings as AppSettings;
    }
    return { name: 'AFTRAS CRM', currency: 'FCFA' };
  },

  updateAppSettings: async (settings: Partial<AppSettings>) => {
    await dbService.update('settings', 'app_config', settings);
    window.dispatchEvent(new CustomEvent('app-settings-changed'));
  },

  // App Logo
  getAppLogo: async (): Promise<string | null> => {
    const settings = await dbService.getById('settings', 'app_config');
    if (settings && typeof settings === 'object' && 'logo' in settings) {
      return settings.logo as string | null;
    }
    return null;
  },

  updateAppLogo: async (logo: string) => {
    try {
      await dbService.update('settings', 'app_config', { logo });
      window.dispatchEvent(new CustomEvent('app-logo-changed'));
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du logo:', error);
      throw error;
    }
  },

  // Users
  getUsers: async (): Promise<UserApp[]> => {
    const users = await dbService.getAll('users');
    return users as UserApp[];
  },

  getUserById: async (id: string): Promise<UserApp | null> => {
    return await dbService.getById('users', id);
  },

  addUser: async (userData: Omit<UserApp, 'id'>) => {
    const docRef = await dbService.add('users', userData);
    return { id: docRef.id, ...userData };
  },

  updateUser: async (id: string, userData: Partial<UserApp>) => {
    await dbService.update('users', id, userData);
  },

  updateUserStatus: async (id: string, status: UserStatus) => {
    await dbService.update('users', id, { status });
  },

  deleteUser: async (id: string) => {
    await dbService.delete('users', id);
  },

  // Prospects
  getProspects: async (): Promise<Prospect[]> => {
    return await dbService.getAll<Prospect>('prospects');
  },

  getProspectsByAgent: async (agentId: string): Promise<Prospect[]> => {
    return await dbService.getByQuery<Prospect>('prospects', 'agentId', '==', agentId);
  },

  getProspectsTodayByAgent: async (agentId: string): Promise<Prospect[]> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const prospects = await dbService.getByQuery<Prospect>('prospects', 'agentId', '==', agentId);
    return prospects.filter((p: any) => {
      const createdAt = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
      return createdAt >= today;
    });
  },

  addProspect: async (prospectData: Omit<Prospect, 'id'>): Promise<Prospect> => {
    const prospectWithDefaults = {
      ...prospectData,
      status: ProspectStatus.PENDING,
      createdAt: new Date().toISOString()
    };
    const docRef = await dbService.add<Prospect>('prospects', prospectWithDefaults);
    return { id: docRef.id, ...prospectWithDefaults };
  },

  updateProspect: async (id: string, prospectData: Partial<Prospect>): Promise<void> => {
    await dbService.update<Prospect>('prospects', id, prospectData);
  },

  deleteProspect: async (id: string): Promise<void> => {
    await dbService.delete('prospects', id);
  },

  convertToClient: async (prospectId: string): Promise<Client | null> => {
    const prospect = await dbService.getById<Prospect>('prospects', prospectId);
    if (!prospect) return null;

    const clientData = {
      ...prospect,
      status: 'PENDING' as const,
      convertedAt: new Date().toISOString(),
      prospectId: prospectId,
      product: prospect.productOfInterest
    };

    // Create client
    const clientRef = await dbService.add<Client>('clients', clientData);
    
    // Update prospect status
    await dbService.update<Prospect>('prospects', prospectId, { status: ProspectStatus.CONVERTED });
    
    return { ...clientData, id: clientRef.id };
  },

  // Clients
  getClients: async (): Promise<Client[]> => {
    return await dbService.getAll<Client>('clients');
  },

  getClientsByAgent: async (agentId: string): Promise<Client[]> => {
    return await dbService.getByQuery<Client>('clients', 'agentId', '==', agentId);
  },

  addClient: async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    const docRef = await dbService.add<Client>('clients', clientData);
    return { id: docRef.id, ...clientData };
  },

  updateClient: async (id: string, clientData: Partial<Client>): Promise<void> => {
    await dbService.update<Client>('clients', id, clientData);
  },

  deleteClient: async (id: string, reason: string): Promise<void> => {
    await dbService.update<Client>('clients', id, { 
      status: 'CANCELLED',
      deletionReason: reason
    });
  },

  // Sales
  getSales: async (): Promise<Sale[]> => {
    return await dbService.getAll<Sale>('sales');
  },

  getSalesByAgent: async (agentId: string): Promise<Sale[]> => {
    return await dbService.getByQuery<Sale>('sales', 'agentId', '==', agentId);
  },

  addSale: async (saleData: Omit<Sale, 'id'>): Promise<Sale> => {
    const docRef = await dbService.add<Sale>('sales', saleData);
    return { id: docRef.id, ...saleData };
  },

  updateSale: async (id: string, saleData: Partial<Sale>): Promise<void> => {
    await dbService.update<Sale>('sales', id, saleData);
  },

  updateSaleStatus: async (id: string, status: 'PENDING' | 'PAID'): Promise<void> => {
    await dbService.update<Sale>('sales', id, { status });
  },

  // Commissions
  getAgentCommissionTotal: async (agentId: string): Promise<number> => {
    const sales = await dbService.getByQuery<Sale>('sales', 'agentId', '==', agentId);
    return sales.reduce((total: number, sale: any) => total + (sale.commission || 0), 0);
  },

  // Notifications
  getNotifications: async (userId?: string): Promise<NotificationApp[]> => {
    if (userId) {
      return await dbService.getByQuery<NotificationApp>('notifications', 'userId', '==', userId);
    }
    return await dbService.getAll<NotificationApp>('notifications');
  },

  addNotification: async (notificationData: Omit<NotificationApp, 'id'>): Promise<NotificationApp> => {
    const docRef = await dbService.add<NotificationApp>('notifications', notificationData);
    return { id: docRef.id, ...notificationData };
  },

  markAllNotificationsAsRead: async (userId: string): Promise<void> => {
    const notifications = await dbService.getByQuery<NotificationApp>('notifications', 'userId', '==', userId);
    const updatePromises = notifications.map((n: any) => 
      dbService.update<NotificationApp>('notifications', n.id, { read: true })
    );
    await Promise.all(updatePromises);
  },

  // Access Codes
  getAccessCode: async (): Promise<AccessCode> => {
    const code = await dbService.getById('access_codes', 'agent_code');
    if (code && typeof code === 'object' && 'id' in code && 'code' in code && 'expiresAt' in code && 'isActive' in code) {
      // Vérifier si le code est expiré
      const expiresAt = code.expiresAt ? new Date(code.expiresAt as string) : new Date();
      if (expiresAt > new Date() && code.isActive) {
        return code as AccessCode;
      }
    }
    // Si aucun code valide n'existe, en générer un nouveau automatiquement
    return await dataService.generateNewCode();
  },

  getSupervisorAccessCode: async (): Promise<AccessCode> => {
    const code = await dbService.getById('access_codes', 'supervisor_code');
    if (code && typeof code === 'object' && 'id' in code && 'code' in code && 'expiresAt' in code && 'isActive' in code) {
      return code as AccessCode;
    }
    return { id: 'supervisor_code', code: 'SUPERVISOR_CODE', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), isActive: true };
  },

  generateNewCode: async (): Promise<AccessCode> => {
    const newCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    await dbService.update('access_codes', 'agent_code', { code: newCode, expiresAt, isActive: true });
    return { id: 'agent_code', code: newCode, expiresAt, isActive: true };
  }
};