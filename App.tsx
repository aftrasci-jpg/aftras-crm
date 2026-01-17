import React, { useState, useEffect, useMemo } from 'react';
import { User, Client, Sale, Commission, ClientStatus, UserRole, Notification as AppNotification, RemoteForm } from './types';
import { store } from './services/store';
import Layout from './components/Layout';
import Logo from './components/Logo';
import { ClientKpiCard, SaleKpiCard, CommissionKpiCard, GenericKpi, RemoteFormKpiCard } from './components/KpiCards';
import ConcludeSaleModal from './components/ConcludeSaleModal';
import { AddProspectModal, DeleteClientModal, ViewClientDetailsModal, AddUserModal, ConfirmProspectModal, EditRemoteFormModal, SaleReportModal, GlobalReportModal } from './components/Modals';
import {
  Users, TrendingUp, Wallet, ShoppingCart, Bell, PlusCircle, AlertCircle, Calendar,
  Search, Filter, XCircle, ShieldCheck, Mail, LogIn, ChevronRight, UserPlus,
  CreditCard, Clock, CheckCircle, Link as LinkIcon, Share2, Copy, Check, FileText, Globe, MapPin, Sparkles,
  Eye, BarChart3, Lock, Shield, Settings, Info, UserCheck, ShieldAlert, LayoutDashboard
} from 'lucide-react';

const COUNTRIES = [
  { name: 'Côte d\'Ivoire', code: '+225' },
  { name: 'Sénégal', code: '+221' },
  { name: 'Mali', code: '+223' },
  { name: 'Burkina Faso', code: '+226' },
  { name: 'France', code: '+33' },
  { name: 'Bénin', code: '+229' },
  { name: 'Togo', code: '+228' },
  { name: 'Cameroun', code: '+237' },
  { name: 'Gabon', code: '+241' },
  { name: 'Maroc', code: '+212' },
];

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
    <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957273V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
    <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
    <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957273 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
  </svg>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardSubTab, setDashboardSubTab] = useState('overview');
  
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [remoteForms, setRemoteForms] = useState<RemoteForm[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPublicForm, setShowPublicForm] = useState<string | null>(null);
  const [publicFormSuccess, setPublicFormSuccess] = useState(false);

  // Modal States
  const [isConcluding, setIsConcluding] = useState<Client | null>(null);
  const [isConfirmingProspect, setIsConfirmingProspect] = useState<Client | null>(null);
  const [isAddingProspect, setIsAddingProspect] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isDeleting, setIsDeleting] = useState<Client | null>(null);
  const [viewDetails, setViewDetails] = useState<Client | null>(null);
  const [editingRemoteForm, setEditingRemoteForm] = useState<RemoteForm | null>(null);
  const [reportingSale, setReportingSale] = useState<Sale | null>(null);
  const [showGlobalReport, setShowGlobalReport] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Auth Listener
  useEffect(() => {
    const unsub = store.onAuthChange((user) => {
      setCurrentUser(user);
      setIsAuthenticating(false);
    });
    return unsub;
  }, []);

  // Data Listeners
  useEffect(() => {
    if (!currentUser) return;

    const unsubClients = store.listenToClients(setClients, currentUser.role, currentUser.id);
    const unsubSales = store.listenToSales(setSales);
    const unsubComms = store.listenToCommissions(setCommissions, currentUser.role, currentUser.id);
    const unsubUsers = store.listenToUsers(setUsers);
    const unsubNotifs = store.listenToNotifications(setNotifications, currentUser.id);
    const unsubRemote = store.listenToRemoteForms(setRemoteForms, currentUser.id);

    return () => {
      unsubClients();
      unsubSales();
      unsubComms();
      unsubUsers();
      unsubNotifs();
      unsubRemote();
    };
  }, [currentUser]);

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setLoginError(null);
    try {
      await store.loginWithGoogle();
    } catch (e: any) {
      setLoginError(e.message);
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await store.logout();
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleConfirmSale = async (ca: number, mr: number) => {
    if (!isConcluding || !currentUser) return;
    await store.concludeSale(isConcluding.id, isConcluding.agentId, ca, mr, currentUser.id);
    setIsConcluding(null);
    setViewDetails(null); // Close details if open
  };

  const handleConfirmProspect = async (client: Client) => {
    await store.confirmProspectAsClient(client.id);
    setIsConfirmingProspect(null);
  };

  const handlePublicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    if (!showPublicForm) return;

    await store.submitRemoteForm({
      agentId: showPublicForm,
      name: `${fd.get('firstname')} ${fd.get('lastname')}`,
      email: fd.get('email') as string,
      phonePrefix: fd.get('phonePrefix') as string,
      phone: fd.get('phone') as string,
      country: fd.get('country') as string,
      city: fd.get('city') as string,
      product: fd.get('product') as string,
      message: fd.get('message') as string,
    });
    setPublicFormSuccess(true);
  };

  const stats = useMemo(() => {
    if (!currentUser) return { clientCount: 0, saleCount: 0, totalCa: 0, pendingComm: 0, paidComm: 0, totalComm: 0, readyClients: 0, prospectsCount: 0 };
    
    const isAgent = currentUser.role === 'AGENT';
    const userClients = isAgent ? clients.filter(c => c.agentId === currentUser.id) : clients;
    const userSales = isAgent ? sales.filter(s => s.agentId === currentUser.id) : sales;
    const userComms = isAgent ? commissions.filter(c => c.agentId === currentUser.id) : commissions;

    const pending = userComms.reduce((acc, c) => acc + (c.status === 'en_attente' ? c.amount : 0), 0);
    const paid = userComms.reduce((acc, c) => acc + (c.status === 'payée' ? c.amount : 0), 0);

    return {
      clientCount: userClients.length,
      saleCount: userSales.length,
      totalCa: userSales.reduce((acc, s) => acc + s.ca, 0),
      pendingComm: pending,
      paidComm: paid,
      totalComm: pending + paid,
      readyClients: userClients.filter(c => c.status === ClientStatus.CLIENT_CONFIRME).length,
      prospectsCount: userClients.filter(c => c.status === ClientStatus.EN_COURS).length
    };
  }, [clients, sales, commissions, currentUser]);

  if (showPublicForm) {
    const agent = users.find(u => u.id === showPublicForm);
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 w-full max-w-xl animate-in zoom-in-95 duration-500 overflow-hidden relative border border-white/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          {publicFormSuccess ? (
            <div className="text-center py-10 relative z-10">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-50">
                <Check size={40} strokeWidth={3} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4">Demande reçue !</h2>
              <p className="text-slate-500 mb-8 font-medium">Votre demande a été transmise à <span className="text-indigo-600 font-bold">{agent?.name}</span>. Un conseiller reviendra vers vous sous peu.</p>
              <button onClick={() => setShowPublicForm(null)} className="px-8 py-4 bg-slate-900 text-white font-black rounded-xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">Quitter</button>
            </div>
          ) : (
            <div className="space-y-8 relative z-10">
              <header className="text-center">
                <div className="mx-auto mb-4">
                   <Logo className="w-16 h-16 mx-auto" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Demande d'information</h1>
                <p className="text-slate-500 font-medium mt-2">Votre conseiller : <span className="font-bold text-indigo-600 italic">{agent?.name}</span></p>
              </header>
              <form onSubmit={handlePublicSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <input required name="firstname" placeholder="Prénom" className="p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold text-sm" />
                  <input required name="lastname" placeholder="Nom" className="p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold text-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required type="email" name="email" placeholder="Email professionnel" className="p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold text-sm" />
                  <div className="flex gap-2">
                    <select name="phonePrefix" className="w-24 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold text-xs appearance-none cursor-pointer">
                      {COUNTRIES.map(c => <option key={c.name} value={c.code}>{c.code}</option>)}
                    </select>
                    <input required type="tel" name="phone" placeholder="Téléphone" className="flex-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select name="country" defaultValue="Côte d'Ivoire" className="p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold text-sm appearance-none">
                    {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  <input required name="city" placeholder="Ville" className="p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold text-sm" />
                </div>
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quel service vous intéresse ?</p>
                   <select name="product" required className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold text-sm text-slate-700 appearance-none">
                    <option value="">Sélectionner une offre...</option>
                    <option value="Assurance Santé">Assurance Santé</option>
                    <option value="Crédit Immobilier">Crédit Immobilier</option>
                    <option value="Gestion de Fortune">Gestion de Fortune</option>
                    <option value="Prévoyance">Prévoyance</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <textarea name="message" rows={3} placeholder="Détails de votre projet..." className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold text-sm resize-none"></textarea>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">Envoyer ma demande</button>
              </form>
              <button onClick={() => setShowPublicForm(null)} className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">Annuler et quitter</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full -mr-64 -mt-64 blur-3xl opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 rounded-full -ml-48 -mb-48 blur-3xl opacity-70"></div>
        
        <div className="bg-white rounded-[3.5rem] shadow-2xl p-8 md:p-16 w-full max-w-xl text-center border border-slate-100 relative z-10 overflow-hidden">
          {isAuthenticating && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
               <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
               <p className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Authentification Sécurisée...</p>
            </div>
          )}

          <div className="mx-auto mb-8">
            <Logo className="w-32 h-32 mx-auto" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter"><span className="text-blue-900">AFTRAS</span> <span className="text-orange-500 border border-orange-300 rounded px-1">CRM</span></h1>
          <p className="text-slate-400 mb-12 font-medium leading-relaxed max-w-sm mx-auto">
            Plateforme de gestion commerciale haute performance. Accédez à vos dossiers et concluez vos ventes en toute sécurité.
          </p>
          
          <div className="space-y-8">
            <div className="flex justify-center">
              <button
                onClick={handleGoogleLogin}
                className="flex items-center space-x-4 px-8 py-4 bg-white border border-slate-300 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all group active:scale-95"
              >
                <div className="bg-white p-1 rounded-sm">
                  <GoogleLogo />
                </div>
                <span className="text-sm font-bold text-slate-700">Se connecter avec Google</span>
              </button>
            </div>
          </div>

          {loginError && (
            <div className="mt-8 p-5 bg-red-50 text-red-600 rounded-2xl flex items-center space-x-3 animate-in shake duration-300 border border-red-100">
              <AlertCircle size={20} />
              <p className="text-xs font-bold">{loginError}</p>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-50">
             <div className="flex items-center justify-center space-x-6 text-slate-300">
                <div className="flex items-center space-x-2">
                   <Lock size={14} />
                   <span className="text-[9px] font-black uppercase tracking-widest">SSL 256-bit</span>
                </div>
                <div className="flex items-center space-x-2">
                   <Shield size={14} />
                   <span className="text-[9px] font-black uppercase tracking-widest">RGPD Compliant</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        const dashboardMenuItems = [
          { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
          { id: 'sales', label: 'Ventes', icon: ShoppingCart },
          { id: 'clients', label: 'Clients', icon: Users },
          { id: 'reports', label: 'Rapports', icon: BarChart3 },
        ];

        const renderDashboardContent = () => {
          switch (dashboardSubTab) {
            case 'overview':
              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <GenericKpi 
                      label="Prêts à Conclure" 
                      value={stats.readyClients} 
                      icon={<Users size={28} />} 
                      color="bg-blue-600 text-white" 
                      borderColor="border-blue-200"
                      valueColor="text-blue-600"
                      onClick={() => setActiveTab('clients')}
                    />
                    <GenericKpi 
                      label={currentUser.role === 'ADMIN' ? "En qualif. (Agents)" : "Prospects en cours"} 
                      value={stats.prospectsCount} 
                      icon={<PlusCircle size={28} />} 
                      color="bg-amber-500 text-white" 
                      borderColor="border-amber-200"
                      valueColor="text-amber-600"
                      onClick={currentUser.role === 'ADMIN' ? undefined : () => setActiveTab('clients')}
                    />
                    {currentUser.role === 'ADMIN' && (
                      <GenericKpi
                        label="Ventes finalisées"
                        value={stats.saleCount}
                        icon={<ShoppingCart size={28} />}
                        color="bg-emerald-500 text-white"
                        borderColor="border-emerald-200"
                        valueColor="text-emerald-600"
                        onClick={() => setActiveTab('sales')}
                      />
                    )}
                    <GenericKpi 
                      label={currentUser.role === 'ADMIN' ? "C.A. Global" : "Mon Chiffre"} 
                      value={`${stats.totalCa.toLocaleString()} FCFA`} 
                      icon={<TrendingUp size={28} />} 
                      color="bg-indigo-600 text-white" 
                      borderColor="border-indigo-200"
                      valueColor="text-indigo-600"
                      onClick={() => setActiveTab('sales')}
                    />
                    <GenericKpi 
                      label="Commissions" 
                      value={`${stats.pendingComm.toLocaleString()} FCFA`} 
                      icon={<Clock size={28} />} 
                      color="bg-slate-700 text-white" 
                      borderColor="border-slate-200"
                      valueColor="text-slate-900"
                      onClick={() => setActiveTab('commissions')}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                      <section className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Activité Récente</h3>
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Bell size={20} />
                          </div>
                        </div>
                        <div className="space-y-4">
                          {notifications.length > 0 ? notifications.slice(0, 6).map(n => (
                            <div key={n.id} className="group flex items-start p-5 bg-white border border-slate-100 rounded-[1.5rem] space-x-5 hover:border-indigo-200 hover:shadow-lg transition-all animate-in slide-in-from-left-4">
                              <div className={`p-3 rounded-xl shrink-0 ${n.type === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                <Check size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-sm font-bold text-slate-800 leading-tight">{n.message}</p>
                                 <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest">{new Date(n.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                          )) : (
                            <div className="text-center py-16 bg-white border-2 border-dashed rounded-[2rem] border-slate-100">
                              <Info className="mx-auto text-slate-200 mb-3" size={32} />
                              <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">Aucune notification</p>
                            </div>
                          )}
                        </div>
                      </section>
                    </div>

                    <section className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Priorités</h3>
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs">
                          {clients.filter(c => c.status === ClientStatus.CLIENT_CONFIRME).length}
                        </div>
                      </div>
                      <div className="space-y-5">
                        {clients.filter(c => c.status === ClientStatus.CLIENT_CONFIRME).length > 0 ? (
                          clients.filter(c => c.status === ClientStatus.CLIENT_CONFIRME).slice(0, 4).map(c => (
                            <ClientKpiCard 
                              key={c.id} 
                              client={c} 
                              role={currentUser.role} 
                              agentName={users.find(u => u.id === c.agentId)?.name}
                              onConcludeSale={(cl) => setIsConcluding(cl)}
                              onConfirmAsClient={(cl) => setIsConfirmingProspect(cl)}
                              onViewDetails={(cl) => setViewDetails(cl)}
                              onDelete={(cl) => setIsDeleting(cl)}
                            />
                          ))
                        ) : (
                          <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem]">
                            <Sparkles className="mx-auto text-slate-200 mb-2" size={32} />
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Tout est à jour</p>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </>
              );
            case 'sales':
              return (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GenericKpi label="Ventes Totales" value={stats.saleCount} icon={<ShoppingCart size={32} />} color="bg-emerald-500 text-white" />
                    <GenericKpi label="Chiffre d'Affaires" value={`${stats.totalCa.toLocaleString()} FCFA`} icon={<TrendingUp size={32} />} color="bg-indigo-600 text-white" />
                    <GenericKpi label="Commissions" value={`${stats.pendingComm.toLocaleString()} FCFA`} icon={<Wallet size={32} />} color="bg-amber-500 text-white" />
                  </div>
                  <div className="bg-white rounded-[2rem] p-8 shadow-xl">
                    <h3 className="text-2xl font-black text-slate-900 mb-6">Historique des Ventes</h3>
                    {sales.length > 0 ? (
                      <div className="space-y-4">
                        {sales.slice(0, 10).map(s => (
                          <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div>
                              <p className="font-bold text-slate-800">{clients.find(c => c.id === s.clientId)?.name || 'Client inconnu'}</p>
                              <p className="text-sm text-slate-500">{new Date(s.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-600">{s.ca.toLocaleString()} FCFA</p>
                              <p className="text-xs text-slate-400">{s.mr}% MR</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <ShoppingCart className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-slate-400 font-bold">Aucune vente enregistrée</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            case 'clients':
              return (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GenericKpi label="Total Clients" value={stats.clientCount} icon={<Users size={32} />} color="bg-blue-600 text-white" />
                    <GenericKpi label="Prêts à Conclure" value={stats.readyClients} icon={<CheckCircle size={32} />} color="bg-emerald-500 text-white" />
                    <GenericKpi label="Prospects" value={stats.prospectsCount} icon={<PlusCircle size={32} />} color="bg-amber-500 text-white" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-[2rem] p-8 shadow-xl">
                      <h3 className="text-2xl font-black text-slate-900 mb-6">Répartition par Statut</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">En cours</span>
                          <span className="font-bold text-amber-600">{clients.filter(c => c.status === ClientStatus.EN_COURS).length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Confirmés</span>
                          <span className="font-bold text-blue-600">{clients.filter(c => c.status === ClientStatus.CLIENT_CONFIRME).length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Finalisés</span>
                          <span className="font-bold text-emerald-600">{clients.filter(c => c.status === ClientStatus.VENTE_CONCLUE).length}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-[2rem] p-8 shadow-xl">
                      <h3 className="text-2xl font-black text-slate-900 mb-6">Top Agents</h3>
                      <div className="space-y-4">
                        {users.filter(u => u.role === 'AGENT').slice(0, 5).map(u => (
                          <div key={u.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-sm">
                                {u.name.charAt(0)}
                              </div>
                              <span className="font-medium text-slate-800">{u.name}</span>
                            </div>
                            <span className="font-bold text-slate-600">{clients.filter(c => c.agentId === u.id).length}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            case 'reports':
              return (
                <div className="space-y-8">
                  <div className="bg-white rounded-[2rem] p-8 shadow-xl">
                    <h3 className="text-2xl font-black text-slate-900 mb-6">Rapports Disponibles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <button 
                        onClick={() => setShowGlobalReport(true)}
                        className="p-6 bg-indigo-50 rounded-xl text-left hover:bg-indigo-100 transition-colors group"
                      >
                        <BarChart3 className="text-indigo-600 mb-3 group-hover:scale-110 transition-transform" size={32} />
                        <h4 className="font-bold text-slate-900 mb-2">Rapport Global</h4>
                        <p className="text-slate-600 text-sm">Vue d'ensemble complète des performances</p>
                      </button>
                      <div className="p-6 bg-slate-50 rounded-xl text-left">
                        <FileText className="text-slate-600 mb-3" size={32} />
                        <h4 className="font-bold text-slate-900 mb-2">Rapport Mensuel</h4>
                        <p className="text-slate-600 text-sm">Analyse détaillée du mois en cours</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            default:
              return null;
          }
        };

        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Tableau de Bord</h2>
                <p className="text-slate-500 mt-2 font-medium">Analysez vos performances et métriques clés <span className="text-indigo-600 font-bold uppercase text-xs">Aftras CRM</span>.</p>
              </div>
              {currentUser.role === 'ADMIN' && (
                <button 
                  onClick={() => setShowGlobalReport(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-100 flex items-center space-x-3 transition-all active:scale-95"
                >
                  <BarChart3 size={18} />
                  <span>Extraire Rapport</span>
                </button>
              )}
            </header>

            <nav className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
              <div className="flex gap-2">
                {dashboardMenuItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setDashboardSubTab(item.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                        dashboardSubTab === item.id
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            {renderDashboardContent()}
          </div>
        );

      case 'remote':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Prospect Distant</h2>
              <p className="text-slate-500 mt-2 font-medium">Lien public sécurisé pour votre prospection.</p>
            </header>

            <div className="bg-white border-2 border-indigo-100 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10 shadow-xl shadow-indigo-100/20">
              <div className="shrink-0 w-24 h-24 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-xl">
                <Share2 size={40} />
              </div>
              <div className="flex-1 space-y-4">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Votre canal de capture unique</p>
                <div className="bg-slate-50 p-6 rounded-2xl flex items-center justify-between border border-slate-100">
                  <code className="text-slate-600 font-bold truncate mr-4">https://aftras.crm/form/{currentUser.id}</code>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://aftras.crm/form/${currentUser.id}`);
                      alert('Lien copié dans le presse-papier !');
                    }}
                    className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm hover:shadow-lg transition-all active:scale-95"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Partagez ce lien avec vos futurs clients pour une saisie automatisée.</p>
              </div>
            </div>

            {remoteForms.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-slate-900">Demandes en attente ({remoteForms.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {remoteForms.map(rf => <RemoteFormKpiCard key={rf.id} form={rf} onEdit={(f) => setEditingRemoteForm(f)} />)}
                </div>
              </div>
            )}
          </div>
        );

      case 'clients': {
        const displayClients = clients.filter(c => {
          const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
          return matchesSearch && matchesStatus;
        });

        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                  {currentUser.role === 'ADMIN' ? 'Gestion des Clients' : 'Mes Dossiers'}
                </h2>
                <p className="text-slate-500 font-medium mt-2">{currentUser.role === 'ADMIN' ? 'Gérez vos dossiers et concluez les ventes officiellement.' : 'Suivez vos prospects et qualifiez-les pour l\'administration.'}</p>
              </div>
              {currentUser.role === 'AGENT' && (
                <button 
                  onClick={() => setIsAddingProspect(true)}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center justify-center space-x-3 transition-all active:scale-95"
                >
                  <PlusCircle size={18} />
                  <span>Nouveau Dossier</span>
                </button>
              )}
            </header>

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Filtrer par nom ou projet..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold text-sm"
                />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-6 py-4 bg-slate-50 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest appearance-none cursor-pointer"
              >
                <option value="all">Tous les statuts</option>
                <option value={ClientStatus.EN_COURS}>Prospects (En cours)</option>
                <option value={ClientStatus.CLIENT_CONFIRME}>Prêts à conclure</option>
                <option value={ClientStatus.VENTE_CONCLUE}>Ventes finalisées</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayClients.length > 0 ? displayClients.map(c => (
                <ClientKpiCard 
                  key={c.id} 
                  client={c} 
                  role={currentUser.role} 
                  agentName={users.find(u => u.id === c.agentId)?.name}
                  onConcludeSale={(cl) => setIsConcluding(cl)}
                  onConfirmAsClient={(cl) => setIsConfirmingProspect(cl)}
                  onViewDetails={(cl) => setViewDetails(cl)}
                  onDelete={(cl) => setIsDeleting(cl)}
                />
              )) : (
                <div className="col-span-full py-20 text-center bg-white border rounded-[3rem] border-dashed">
                  <p className="text-slate-400 font-bold italic uppercase tracking-widest text-[10px]">Aucun dossier à traiter pour le moment.</p>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'sales':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Journal des Ventes finalisées</h2>
              <p className="text-slate-500 font-medium mt-2">Historique des ventes officiellement validées par l'administration.</p>
            </header>
            {sales.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sales.map(s => (
                  <SaleKpiCard 
                    key={s.id} 
                    sale={s} 
                    clientName={clients.find(c => c.id === s.clientId)?.name || 'Inconnu'} 
                    agentName={users.find(u => u.id === s.agentId)?.name || 'Inconnu'} 
                    onReport={(sale) => setReportingSale(sale)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                 <ShoppingCart className="mx-auto text-slate-100 mb-4" size={48} />
                 <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-xs">Aucune vente enregistrée.</p>
              </div>
            )}
          </div>
        );

      case 'commissions': {
        return (
          <div className="space-y-12 animate-in fade-in duration-500">
            <header>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Gestion de Revenus</h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <GenericKpi label="Total Cumulé" value={`${stats.totalComm.toLocaleString()} CFA`} icon={<Wallet size={32} />} color="bg-indigo-600 text-white" />
              <GenericKpi label="En attente" value={`${stats.pendingComm.toLocaleString()} CFA`} icon={<Clock size={32} />} color="bg-amber-400 text-white" />
              <GenericKpi label="Validé & Payé" value={`${stats.paidComm.toLocaleString()} CFA`} icon={<CheckCircle size={32} />} color="bg-emerald-500 text-white" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {commissions.length > 0 ? commissions.map(c => {
                  const sale = sales.find(s => s.id === c.saleId);
                  const client = clients.find(cl => cl.id === sale?.clientId);
                  return (
                    <CommissionKpiCard 
                      key={c.id} 
                      commission={c} 
                      agentName={users.find(u => u.id === c.agentId)?.name || 'Inconnu'} 
                      clientName={client?.name}
                      role={currentUser.role} 
                    />
                  );
                }) : (
                  <div className="col-span-full py-16 text-center border-2 border-dashed rounded-[3rem]">
                    <p className="text-slate-300 font-black uppercase tracking-widest text-[10px]">Aucune commission à afficher.</p>
                  </div>
                )}
            </div>
          </div>
        );
      }

      case 'users': {
        if (currentUser.role !== 'ADMIN') return null;
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
             <header className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Équipes de Vente</h2>
                <button
                  onClick={() => setIsAddingUser(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center space-x-3 transition-all active:scale-95"
                >
                  <UserPlus size={18} />
                  <span>Ajouter un membre</span>
                </button>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(u => (
                  <div key={u.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                        {u.photoURL ? <img src={u.photoURL} alt={u.name} className="w-full h-full rounded-2xl object-cover" /> : u.name.charAt(0)}
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {u.active ? 'Actif' : 'Désactivé'}
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 truncate leading-none mb-1">{u.name}</h3>
                    <p className="text-xs text-slate-400 font-bold lowercase mb-6">{u.email}</p>
                    <div className="space-y-4 pt-6 border-t border-slate-50">
                      <div className="flex gap-2">
                        {(['AGENT', 'ADMIN'] as UserRole[]).map(role => (
                          <button
                            key={role}
                            onClick={() => store.updateUserRole(u.id, role)}
                            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${u.role === role ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => store.toggleUserStatus(u.id, u.active)}
                        className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${u.active ? 'text-red-500 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}
                      >
                        {u.active ? 'Désactiver le compte' : 'Rétablir l\'accès'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        );
      }
      default: return null;
    }
  };

  return (
    <Layout user={currentUser} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
      {showGlobalReport && <GlobalReportModal stats={store.getGlobalStats()} onClose={() => setShowGlobalReport(false)} />}
      {reportingSale && <SaleReportModal sale={reportingSale} clientName={clients.find(c => c.id === reportingSale.clientId)?.name || 'Client'} agentName={users.find(u => u.id === reportingSale.agentId)?.name || 'Agent'} onClose={() => setReportingSale(null)} />}
      {isConcluding && <ConcludeSaleModal client={isConcluding} agent={users.find(u => u.id === isConcluding.agentId)!} adminId={currentUser?.id || ''} onClose={() => setIsConcluding(null)} onConfirm={handleConfirmSale} />}
      {isConfirmingProspect && <ConfirmProspectModal client={isConfirmingProspect} onClose={() => setIsConfirmingProspect(null)} onConfirm={() => handleConfirmProspect(isConfirmingProspect)} />}
      {isAddingUser && <AddUserModal onClose={() => setIsAddingUser(false)} onAdd={async (data) => { await store.addUser(data); setIsAddingUser(false); }} />}
      {isAddingProspect && currentUser && <AddProspectModal agentId={currentUser.id} onClose={() => setIsAddingProspect(false)} onAdd={(data) => { store.addClient(data); setIsAddingProspect(false); }} />}
      {isDeleting && currentUser && <DeleteClientModal client={isDeleting} onClose={() => setIsDeleting(null)} onConfirm={(reason) => { if (currentUser) store.deleteClient(isDeleting.id, reason, currentUser.id); setIsDeleting(null); }} />}
      {viewDetails && currentUser && (
        <ViewClientDetailsModal 
          client={viewDetails} 
          userRole={currentUser.role}
          onClose={() => setViewDetails(null)} 
          onStartConclusion={(cl) => setIsConcluding(cl)}
        />
      )}
      {editingRemoteForm && <EditRemoteFormModal form={editingRemoteForm} onClose={() => setEditingRemoteForm(null)} />}
    </Layout>
  );
};

export default App;
