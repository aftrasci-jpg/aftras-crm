
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  type User as FirebaseUser 
} from "firebase/auth";
import { auth, db, googleProvider } from "./firebase";
import { Client, Sale, Commission, Notification, ClientStatus, User, UserRole, RemoteForm } from '../types';
import { COMMISSION_RATE } from '../constants';

class SalesStore {
  private listeners: (() => void)[] = [];
  private authListeners: ((user: User | null) => void)[] = [];

  // Internal cache to support synchronous getGlobalStats call in UI
  private clients: Client[] = [];
  private sales: Sale[] = [];
  private commissions: Commission[] = [];
  private users: User[] = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // --- Authentication ---
  async loginWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    
    const userDoc = await getDoc(doc(db, "users", fbUser.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      if (!userData.active) throw new Error("Votre compte est désactivé.");
      
      await updateDoc(doc(db, "users", fbUser.uid), {
        lastLogin: new Date().toISOString()
      });
      return { ...userData, id: fbUser.uid };
    } else {
      const newUser: User = {
        id: fbUser.uid,
        name: fbUser.displayName || "Utilisateur",
        email: fbUser.email || "",
        role: 'AGENT',
        lastLogin: new Date().toISOString(),
        active: true,
        photoURL: fbUser.photoURL || undefined
      };
      await setDoc(doc(db, "users", fbUser.uid), {
        ...newUser,
        createdAt: serverTimestamp()
      });
      return newUser;
    }
  }

  async logout() {
    await signOut(auth);
    this.authListeners.forEach(cb => cb(null));
  }

  onAuthChange(callback: (user: User | null) => void) {
    this.authListeners.push(callback);
    const unsubFirebase = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userDoc = await getDoc(doc(db, "users", fbUser.uid));
        if (userDoc.exists()) {
          callback({ ...(userDoc.data() as User), id: fbUser.uid });
        }
      } else {
        callback(null);
      }
    });
    return () => {
      unsubFirebase();
      this.authListeners = this.authListeners.filter(l => l !== callback);
    };
  }

  // --- Real-time Listeners ---
  listenToClients(callback: (clients: Client[]) => void, role: UserRole, userId: string) {
    let q;
    if (role === 'ADMIN') {
      q = query(collection(db, "clients"), orderBy("createdAt", "desc"));
    } else {
      q = query(collection(db, "clients"), where("agentId", "==", userId), orderBy("createdAt", "desc"));
    }
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Client));
      this.clients = data;
      callback(data);
    }, (error) => {
      console.warn("Firestore error (likely permission or empty):", error);
      callback([]);
    });
  }

  listenToSales(callback: (sales: Sale[]) => void) {
    const q = query(collection(db, "sales"), orderBy("date", "desc"));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Sale));
      this.sales = data;
      callback(data);
    }, () => callback([]));
  }

  listenToCommissions(callback: (comms: Commission[]) => void, role: UserRole, userId: string) {
    let q;
    if (role === 'ADMIN') {
      q = query(collection(db, "commissions"), orderBy("date", "desc"));
    } else {
      q = query(collection(db, "commissions"), where("agentId", "==", userId), orderBy("date", "desc"));
    }
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Commission));
      this.commissions = data;
      callback(data);
    }, () => callback([]));
  }

  listenToUsers(callback: (users: User[]) => void) {
    return onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
      this.users = data;
      callback(data);
    }, () => callback([]));
  }

  listenToNotifications(callback: (notifs: Notification[]) => void, userId: string) {
    const q = query(collection(db, "notifications"), where("userId", "in", [userId, "all"]), orderBy("date", "desc"));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Notification)));
    }, () => callback([]));
  }

  listenToRemoteForms(callback: (forms: RemoteForm[]) => void, userId: string) {
    const q = query(collection(db, "remoteForms"), where("agentId", "==", userId), where("status", "==", "en_attente"));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as RemoteForm)));
    }, () => callback([]));
  }

  // --- Actions ---
  async addClient(data: Partial<Client>) {
    await addDoc(collection(db, "clients"), {
      ...data,
      status: ClientStatus.EN_COURS,
      createdAt: new Date().toISOString().split('T')[0],
      serverCreatedAt: serverTimestamp()
    });
  }

  async confirmProspectAsClient(clientId: string) {
    const clientRef = doc(db, "clients", clientId);
    await updateDoc(clientRef, { status: ClientStatus.CLIENT_CONFIRME });
    
    await addDoc(collection(db, "notifications"), {
      userId: 'admin-1',
      message: `👤 Client prêt à conclure : Un dossier nécessite votre validation.`,
      type: 'INFO',
      date: new Date().toISOString(),
      read: false
    });
  }

  async concludeSale(clientId: string, agentId: string, ca: number, mr: number, adminId: string) {
    const benefit = ca - mr;
    const commissionAmount = benefit * COMMISSION_RATE;
    const date = new Date().toISOString().split('T')[0];

    const saleRef = await addDoc(collection(db, "sales"), {
      clientId,
      agentId,
      ca,
      mr,
      benefit,
      commission: commissionAmount,
      date,
      validatedBy: adminId
    });

    await updateDoc(doc(db, "clients", clientId), { status: ClientStatus.VENTE_CONCLUE });

    await addDoc(collection(db, "commissions"), {
      agentId,
      saleId: saleRef.id,
      amount: commissionAmount,
      status: 'en_attente',
      date
    });

    await addDoc(collection(db, "notifications"), {
      userId: agentId,
      message: `🎉 Félicitations ! Une vente a été conclue. Commission de ${commissionAmount.toLocaleString()} FCFA générée.`,
      type: 'SUCCESS',
      date: new Date().toISOString(),
      read: false
    });
  }

  async toggleCommissionStatus(commId: string) {
    const commRef = doc(db, "commissions", commId);
    const commDoc = await getDoc(commRef);
    if (commDoc.exists()) {
      const currentStatus = (commDoc.data() as Commission).status;
      const newStatus = currentStatus === 'en_attente' ? 'payée' : 'en_attente';
      await updateDoc(commRef, { status: newStatus });
    }
  }

  async deleteClient(clientId: string, reason: string, adminId: string) {
    const clientDoc = await getDoc(doc(db, "clients", clientId));
    if (clientDoc.exists()) {
      const client = clientDoc.data() as Client;
      await addDoc(collection(db, "notifications"), {
        userId: client.agentId,
        message: `❌ Dossier "${client.name}" rejeté. Raison : ${reason}`,
        type: 'ALERT',
        date: new Date().toISOString(),
        read: false
      });
      await deleteDoc(doc(db, "clients", clientId));
    }
  }

  async submitRemoteForm(data: Omit<RemoteForm, 'id' | 'date' | 'status'>) {
    await addDoc(collection(db, "remoteForms"), {
      ...data,
      date: new Date().toISOString(),
      status: 'en_attente'
    });
  }

  async deleteRemoteForm(formId: string) {
    await deleteDoc(doc(db, "remoteForms", formId));
  }

  async validateRemoteForm(formId: string) {
    const formRef = doc(db, "remoteForms", formId);
    const formDoc = await getDoc(formRef);
    if (formDoc.exists()) {
      const form = formDoc.data() as RemoteForm;
      await this.addClient({
        name: form.name,
        agentId: form.agentId,
        phonePrefix: form.phonePrefix,
        phone: form.phone,
        country: form.country,
        city: form.city,
        product: form.product,
        notes: `Prospect Distant : ${form.message}`
      });
      await deleteDoc(formRef);
    }
  }

  async toggleUserStatus(userId: string, currentActive: boolean) {
    await updateDoc(doc(db, "users", userId), { active: !currentActive });
  }

  async updateUserRole(userId: string, newRole: UserRole) {
    await updateDoc(doc(db, "users", userId), { role: newRole });
  }

  async addUser(data: { name: string; email: string; role: UserRole }) {
    // Générer un ID temporaire basé sur l'email (puisque l'utilisateur n'existe pas encore dans Firebase Auth)
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await setDoc(doc(db, "users", tempId), {
      ...data,
      id: tempId,
      active: true,
      lastLogin: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    await addDoc(collection(db, "notifications"), {
      userId: 'admin-1',
      message: `👤 Nouvel utilisateur "${data.name}" ajouté avec le rôle ${data.role}.`,
      type: 'INFO',
      date: new Date().toISOString(),
      read: false
    });
  }

  getGlobalStats() {
    const totalCa = this.sales.reduce((acc, s) => acc + s.ca, 0);
    const totalBenefit = this.sales.reduce((acc, s) => acc + s.benefit, 0);
    const totalComm = this.commissions.reduce((acc, c) => acc + c.amount, 0);
    const totalProspects = this.clients.filter(c => c.status === ClientStatus.EN_COURS).length;
    const totalConfirmed = this.clients.filter(c => c.status === ClientStatus.CLIENT_CONFIRME).length;
    const totalSales = this.sales.length;

    const agentStats = this.users.filter(u => u.role === 'AGENT').map(agent => {
      const agentSales = this.sales.filter(s => s.agentId === agent.id);
      const agentClients = this.clients.filter(c => c.agentId === agent.id);
      return {
        name: agent.name,
        salesCount: agentSales.length,
        prospectsCount: agentClients.filter(c => c.status === ClientStatus.EN_COURS).length,
        totalCa: agentSales.reduce((acc, s) => acc + s.ca, 0)
      };
    });

    const products: Record<string, number> = {};
    this.sales.forEach(s => {
      const client = this.clients.find(c => c.id === s.clientId);
      const prodName = client?.product || 'Standard';
      products[prodName] = (products[prodName] || 0) + 1;
    });

    const topProducts = Object.entries(products).map(([name, count]) => ({ name, count }));

    return {
      totalCa,
      totalBenefit,
      totalComm,
      totalProspects,
      totalConfirmed,
      totalSales,
      agentStats,
      topProducts
    };
  }
}

export const store = new SalesStore();
