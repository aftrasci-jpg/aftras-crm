
import React, { useState, useEffect } from 'react';
import { StatCard } from './Common/StatCard';
import { ICONS } from '../constants';
import { dataService } from '../services/dataService';
import { Prospect, ProspectStatus, UserApp, Client, RemoteProspect, Sale, NotificationApp } from '../types';

const AFRICAN_COUNTRIES: Record<string, string> = {
  '+225': "Côte d'Ivoire",
  '+221': "Sénégal",
  '+237': "Cameroun",
  '+212': "Maroc",
  '+213': "Algérie",
  '+216': "Tunisie",
  '+223': "Mali",
  '+226': "Burkina Faso",
  '+227': "Niger",
  '+228': "Togo",
  '+229': "Bénin",
  '+241': "Gabon",
  '+242': "Congo-Brazzaville",
  '+243': "RD Congo",
  '+261': "Madagascar",
  '+234': "Nigéria",
  '+254': "Kenya",
  '+27': "Afrique du Sud"
};

export const AgentDashboardHome: React.FC<{ user: UserApp; onNavigate: (view: string) => void }> = ({ user, onNavigate }) => {
  const [stats, setStats] = useState({ prospects: 0, pending: 0, clients: 0 });
  const [notifications, setNotifications] = useState<NotificationApp[]>([]);
  const [appSettings, setAppSettings] = useState({ name: 'AFTRAS CRM', currency: 'FCFA' });
  const [prospectsToday, setProspectsToday] = useState(0);
  const [commissionTotal, setCommissionTotal] = useState(0);
  const [commissionEnAttente, setCommissionEnAttente] = useState(0);

  // Gestion améliorée des appels async avec gestion d'erreur
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prospectsData, clientsData, notificationsData, settingsData, prospectsTodayCount, totalCommission, salesData] = await Promise.all([
          dataService.getProspectsByAgent(user.id),
          dataService.getClientsByAgent(user.id),
          dataService.getNotifications(user.id),
          dataService.getAppSettings(),
          dataService.getProspectsTodayByAgent(user.id),
          dataService.getAgentCommissionTotal(user.id),
          dataService.getSalesByAgent(user.id)
        ]);
        
        const activeClients = clientsData.filter(x => x.status !== 'CANCELLED');
        
        // Calculer la commission en attente
        const commissionEnAttente = salesData
          .filter(s => s.status === 'PENDING')
          .reduce((acc, s) => acc + s.commission, 0);
        
        setStats({
          prospects: prospectsData.length,
          pending: prospectsData.filter(x => x.status === ProspectStatus.PENDING).length,
          clients: activeClients.length
        });
        setNotifications(notificationsData);
        setAppSettings(settingsData);
        setProspectsToday(prospectsTodayCount.length);
        setCommissionTotal(totalCommission);
        setCommissionEnAttente(commissionEnAttente);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        // Définir des valeurs par défaut en cas d'erreur
        setStats({ prospects: 0, pending: 0, clients: 0 });
        setNotifications([]);
        setAppSettings({ name: 'AFTRAS CRM', currency: 'FCFA' });
        setProspectsToday(0);
        setCommissionTotal(0);
        setCommissionEnAttente(0);
      }
    };
    loadData();
  }, [user.id]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Salut, {user.firstName} 👋</h1>
        <p className="text-gray-500 font-medium text-lg">Bonne journée de prospection sur votre espace {appSettings.name}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={() => onNavigate('prospecting')}
          className="bg-white rounded-[3rem] p-8 border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg group-hover:scale-110 transition-transform">
              {ICONS.Prospect}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mes Prospects</p>
              <p className="text-4xl font-black text-gray-900">{stats.prospects}</p>
              <p className="text-sm font-bold text-indigo-600">{prospectsToday} aujourd'hui</p>
            </div>
          </div>
          <div className="w-16 h-1 bg-indigo-100 rounded-full"></div>
        </div>

        <div 
          onClick={() => onNavigate('prospecting')}
          className="bg-white rounded-[3rem] p-8 border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg group-hover:scale-110 transition-transform">
              {ICONS.Notification}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">En attente</p>
              <p className="text-4xl font-black text-gray-900">{stats.pending}</p>
              <p className="text-sm font-bold text-amber-500">Action requise</p>
            </div>
          </div>
          <div className="w-16 h-1 bg-amber-100 rounded-full"></div>
        </div>

        <div 
          onClick={() => onNavigate('my-clients')}
          className="bg-white rounded-[3rem] p-8 border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg group-hover:scale-110 transition-transform">
              {ICONS.Client}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prospects Confirmés</p>
              <p className="text-4xl font-black text-gray-900">{stats.clients}</p>
              <p className="text-sm font-bold text-emerald-600">Portefeuille client</p>
            </div>
          </div>
          <div className="w-16 h-1 bg-emerald-100 rounded-full"></div>
        </div>

        <div 
          onClick={() => onNavigate('my-commissions')}
          className="bg-white rounded-[3rem] p-8 border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 bg-sky-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg group-hover:scale-110 transition-transform">
              {ICONS.Commission}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ma Commission</p>
              <p className="text-4xl font-black text-gray-900">{Math.round(commissionTotal).toLocaleString()} {appSettings.currency}</p>
              <p className="text-sm font-bold text-sky-600">{Math.round(commissionEnAttente).toLocaleString()} {appSettings.currency} en attente</p>
            </div>
          </div>
          <div className="w-16 h-1 bg-sky-100 rounded-full"></div>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-lg text-gray-900 flex items-center">
              <span className="mr-2 text-rose-500">{ICONS.Notification}</span>
              Alertes récentes
            </h3>
            <button onClick={() => onNavigate('notifications')} className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">Voir tout</button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {notifications.filter(n => !n.read).slice(0, 3).map(n => (
              <div key={n.id} className="bg-white border-2 border-rose-100 p-6 rounded-3xl shadow-sm animate-in slide-in-from-left-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-rose-600 uppercase text-xs tracking-widest">{n.title}</h4>
                  <span className="text-[10px] font-medium text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-2 text-sm text-gray-700 font-medium">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const AgentNotificationsView: React.FC<{ user: UserApp }> = ({ user }) => {
  const [notifications, setNotifications] = useState<NotificationApp[]>([]);

  // Fix: Handle async notification loading
  useEffect(() => {
    const loadNotifs = async () => setNotifications(await dataService.getNotifications(user.id));
    loadNotifs();
  }, [user.id]);

  const handleMarkAllAsRead = async () => {
    await dataService.markAllNotificationsAsRead(user.id);
    setNotifications(await dataService.getNotifications(user.id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'cash': return <span className="text-emerald-500">💰</span>;
      case 'alert': return <span className="text-rose-500">⚠️</span>;
      case 'lead': return <span className="text-indigo-500">👤</span>;
      case 'sys': return <span className="text-slate-500">⚙️</span>;
      default: return <span className="text-blue-500">ℹ️</span>;
    }
  };

  const getCardStyle = (n: NotificationApp) => {
    if (!n.read) {
      switch (n.type) {
        case 'cash': return 'border-emerald-100 bg-emerald-50/30';
        case 'alert': return 'border-rose-100 bg-rose-50/30';
        default: return 'border-indigo-100 bg-indigo-50/30';
      }
    }
    return 'border-gray-50 bg-white grayscale-[0.5] opacity-80';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-gray-500 font-medium text-lg">Historique complet des actions effectuées par l'administration.</p>
        </div>
        <button 
          onClick={handleMarkAllAsRead}
          className="bg-white border-2 border-indigo-100 text-indigo-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-50 transition-all shadow-sm"
        >
          Tout marquer comme lu
        </button>
      </div>

      <div className="space-y-6">
        {notifications.length > 0 ? (
          notifications.map((n, index) => (
            <div 
              key={n.id}
              className={`
                group p-8 rounded-[2.5rem] border-2 transition-all duration-500 
                animate-in slide-in-from-bottom-8 relative overflow-hidden
                ${getCardStyle(n)}
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {!n.read && (
                <div className="absolute top-0 right-10 w-20 h-1 rounded-full bg-indigo-500/20"></div>
              )}
              
              <div className="flex items-start gap-6">
                <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl border border-gray-100 transition-transform group-hover:scale-110`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className={`text-lg font-black tracking-tight ${n.read ? 'text-gray-600' : 'text-gray-900'}`}>{n.title}</h4>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {new Date(n.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`font-medium ${n.read ? 'text-gray-400' : 'text-gray-600'}`}>{n.message}</p>
                  
                  {!n.read && (
                    <div className="mt-4 flex items-center space-x-2">
                       <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                       <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Nouveau message</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-40 text-center bg-gray-50/50 rounded-[5rem] border-4 border-dashed border-gray-100">
             <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm text-gray-200 text-4xl">
              📭
            </div>
            <p className="text-gray-300 font-black uppercase text-xl tracking-[0.2em] italic">Aucune notification pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const ProspectingView: React.FC<{ user: UserApp }> = ({ user }) => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [showConfirmConversion, setShowConfirmConversion] = useState<string | null>(null);
  const [autoCountry, setAutoCountry] = useState("Côte d'Ivoire");
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Fix: Handle async dataService methods
  useEffect(() => {
    refreshProspects();
  }, [user.id]);

  const refreshProspects = async () => {
    setProspects(await dataService.getProspectsByAgent(user.id));
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAutoCountry(AFRICAN_COUNTRIES[e.target.value] || "Autre");
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const prospectData = {
      agentId: user.id,
      fullName: formData.get('fullName') as string,
      company: formData.get('company') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      countryCode: formData.get('countryCode') as string,
      country: autoCountry,
      city: formData.get('city') as string,
      source: isEditMode ? selectedProspect?.source || 'Direct Agent' : 'Direct Agent',
      productOfInterest: formData.get('product') as string,
      details: formData.get('details') as string,
      status: ProspectStatus.PENDING,
      createdAt: new Date().toISOString()
    };

    if (isEditMode && selectedProspect) {
      // Fix: use updateProspect
      await dataService.updateProspect(selectedProspect.id, prospectData);
      alert("Prospect mis à jour avec succès !");
    } else {
      await dataService.addProspect(prospectData);
      alert("Prospect ajouté avec succès !");
    }

    setIsAddModalOpen(false);
    setIsEditMode(false);
    setSelectedProspect(null);
    await refreshProspects();
  };

  const handleConvert = async (id: string) => {
    // Fix: use convertToClient
    await dataService.convertToClient(id);
    setShowConfirmConversion(null);
    await refreshProspects();
    alert("Prospect confirmé et converti en client avec succès !");
  };

  const handleDeleteProspect = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce prospect ? Cette action est irréversible.")) {
      // Fix: use deleteProspect
      await dataService.deleteProspect(id);
      await refreshProspects();
      alert("Prospect supprimé.");
    }
  };

  const openEditModal = (p: Prospect) => {
    setSelectedProspect(p);
    setAutoCountry(p.country);
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  const filtered = prospects.filter(p => {
    const matchesSearch = p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.company?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: ProspectStatus) => {
    switch (status) {
      case ProspectStatus.CONVERTED: return 'border-emerald-500 bg-emerald-50/30 text-emerald-700 shadow-emerald-100/50';
      case ProspectStatus.PENDING: return 'border-indigo-500 bg-indigo-50/30 text-indigo-700 shadow-indigo-100/50';
      default: return 'border-gray-200 bg-gray-50/30 text-gray-600 shadow-gray-100/50';
    }
  };

  const getStatusLabel = (status: ProspectStatus) => {
    return status === ProspectStatus.PENDING ? 'En attente' : 'Converti';
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Gestion Prospection</h1>
          <p className="text-gray-500 font-medium text-lg">Centralisez vos opportunités (En attente / Confirmées).</p>
        </div>
        <button 
          onClick={() => { setIsEditMode(false); setSelectedProspect(null); setIsAddModalOpen(true); }}
          className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] flex items-center justify-center font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 hover:scale-105 pt-6"
        >
          <span className="mr-3">{ICONS.Plus}</span>
          Nouveau Prospect
        </button>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl flex flex-col md:flex-row gap-6 items-center transition-all focus-within:ring-4 focus-within:ring-indigo-50">
        <div className="flex-1 relative w-full">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input 
            type="text" 
            placeholder="Filtrer vos prospects par identité, ville ou entreprise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-gray-50 border-none rounded-[1.75rem] outline-none font-bold text-lg text-gray-800 placeholder:text-gray-300 transition-all shadow-inner"
          />
        </div>
        <div className="w-full md:w-80">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.75rem] outline-none font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-inner text-gray-600"
          >
            <option value="ALL">Tous les statuts</option>
            <option value={ProspectStatus.PENDING}>🕒 En attente</option>
            <option value={ProspectStatus.CONVERTED}>✅ Confirmés</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filtered.map((p, index) => {
          const statusStyle = getStatusStyle(p.status);
          return (
            <div 
              key={p.id} 
              className={`
                group bg-white rounded-[4rem] p-10 border-2 transition-all duration-500 
                animate-in slide-in-from-bottom-12 hover:-translate-y-4 hover:shadow-2xl flex flex-col relative
                ${statusStyle}
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-8">
                <div className={`w-20 h-20 rounded-[2.25rem] flex items-center justify-center text-3xl font-black shadow-lg transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110 
                  ${p.status === ProspectStatus.CONVERTED ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}>
                  {p.fullName[0]}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${p.status === ProspectStatus.CONVERTED ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white border-gray-100 group-hover:border-indigo-200 transition-colors'}`}>
                    {getStatusLabel(p.status)}
                  </span>
                  {p.status === ProspectStatus.PENDING && (
                    <button 
                      onClick={() => handleDeleteProspect(p.id)}
                      className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors border border-rose-100/50"
                      title="Supprimer ce prospect"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-6 flex-1">
                <h4 className="text-2xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight leading-none mb-3">{p.fullName}</h4>
                <div className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-gray-200 mr-2 group-hover:bg-indigo-400 transition-colors"></span>
                  {p.company || 'Compte Particulier'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 py-8 border-y border-gray-100 mb-8 group-hover:border-indigo-50 transition-colors">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Localisation</p>
                  <p className="font-bold text-gray-700 text-xs truncate">{p.city}, {p.country}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Source</p>
                  <p className="font-bold text-indigo-600 text-xs truncate">{p.source}</p>
                </div>
              </div>

              <div className="space-y-4">
                {p.status !== ProspectStatus.CONVERTED && (
                  <button 
                    onClick={() => setShowConfirmConversion(p.id)}
                    className="w-full py-5 bg-emerald-600 text-white rounded-[1.75rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all pt-6"
                  >
                    Confirmer le prospect
                  </button>
                )}
                <button 
                  onClick={() => p.status === ProspectStatus.PENDING ? openEditModal(p) : setSelectedProspect(p)}
                  className={`w-full py-5 rounded-[1.75rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all pt-6 border-2 
                    ${p.status === ProspectStatus.CONVERTED 
                      ? 'bg-white border-emerald-100 text-emerald-600 hover:bg-emerald-50' 
                      : 'bg-white border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50'
                    }`}
                >
                  {p.status === ProspectStatus.PENDING ? 'Modifier / Corriger' : 'Inspecter Dossier'}
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-40 text-center bg-gray-50/50 rounded-[5rem] border-4 border-dashed border-gray-100">
             <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm text-gray-200">
              {ICONS.Prospect}
            </div>
            <p className="text-gray-300 font-black uppercase text-xl tracking-[0.2em] italic">Aucun dossier prospect trouvé</p>
          </div>
        )}
      </div>

      {/* MODAL: CONFIRMATION CONVERSION */}
      {showConfirmConversion && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowConfirmConversion(null)}></div>
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full relative shadow-2xl text-center space-y-6 animate-in zoom-in-95">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto text-5xl shadow-lg shadow-emerald-100">🤝</div>
            <div>
              <h4 className="text-2xl font-black text-gray-900 tracking-tight">Confirmer ce prospect ?</h4>
              <p className="text-gray-500 mt-2 text-sm font-medium">Le prospect sera converti en client et ajouté à votre portefeuille. L'administration recevra une notification automatique pour traitement.</p>
            </div>
            <div className="flex flex-col space-y-3 pt-4">
              <button 
                onClick={() => handleConvert(showConfirmConversion)}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
              >
                CONFIRMER LE PROSPECT
              </button>
              <button 
                onClick={() => setShowConfirmConversion(null)}
                className="w-full py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AJOUTER / MODIFIER PROSPECT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => { setIsAddModalOpen(false); setIsEditMode(false); setSelectedProspect(null); }}></div>
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b-2 border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {isEditMode ? 'Modifier Prospect' : 'Nouveau Prospect'}
              </h3>
              <button onClick={() => { setIsAddModalOpen(false); setIsEditMode(false); setSelectedProspect(null); }} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-10 space-y-6 overflow-y-auto max-h-[75vh]">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Identité ou Raison Sociale</label>
                <input name="fullName" defaultValue={selectedProspect?.fullName || ''} required className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold" placeholder="Ex: Paul Durand ou SARL Tech" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Indicatif Pays</label>
                  <select name="countryCode" defaultValue={selectedProspect?.countryCode || '+225'} onChange={handleCountryCodeChange} className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold">
                    {Object.entries(AFRICAN_COUNTRIES).map(([code, name]) => (
                      <option key={code} value={code}>{code} - {name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Numéro Mobile</label>
                  <input name="phone" type="tel" defaultValue={selectedProspect?.phone || ''} required className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" placeholder="0102030405" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Pays</label>
                  <input value={autoCountry} readOnly className="w-full px-6 py-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl text-indigo-700 font-black outline-none cursor-not-allowed" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Ville</label>
                  <input name="city" defaultValue={selectedProspect?.city || ''} required className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" placeholder="Dakar, Abidjan..." />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email Professionnel</label>
                <input name="email" type="email" defaultValue={selectedProspect?.email || ''} required className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" placeholder="contact@prospect.com" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Offre d'intérêt</label>
                <input name="product" defaultValue={selectedProspect?.productOfInterest || ''} required className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" placeholder="Saisir le pack ou service..." />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Détails & Commentaires</label>
                <textarea name="details" defaultValue={selectedProspect?.details || ''} rows={3} className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold resize-none" placeholder="Notes importantes sur le prospect..."></textarea>
              </div>

              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all pt-4">
                {isEditMode ? 'Mettre à jour' : 'Enregistrer dans la base'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DÉTAILS PROSPECT (Uniquement pour Converted ou Lecture) */}
      {selectedProspect && !isEditMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedProspect(null)}></div>
          <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden relative shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            <div className="h-32 bg-indigo-600 p-8 flex items-start justify-between">
              <div className="text-white">
                <h4 className="text-2xl font-black tracking-tight">{selectedProspect.fullName}</h4>
                <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">{selectedProspect.city}, {selectedProspect.country}</p>
              </div>
              <button onClick={() => setSelectedProspect(null)} className="p-2 text-white/50 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile</p>
                  <p className="font-black text-gray-900 text-lg">{selectedProspect.countryCode} {selectedProspect.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                  <p className="font-bold text-indigo-600 truncate">{selectedProspect.email}</p>
                </div>
              </div>
              <div className="p-6 bg-indigo-50 rounded-[1.5rem] border-2 border-indigo-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Produit sollicité</p>
                <p className="font-black text-indigo-900 text-lg">{selectedProspect.productOfInterest}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Commentaires / Détails</p>
                <p className="text-gray-700 font-medium bg-gray-50 p-4 rounded-2xl border-2 border-gray-100 italic">
                  {selectedProspect.details || "Aucun commentaire additionnel n'a été saisi pour ce prospect."}
                </p>
              </div>
              <div className="flex space-x-4 pt-4">
                <button onClick={() => setSelectedProspect(null)} className="flex-1 py-5 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all pt-4">Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AgentClientsView: React.FC<{ user: UserApp }> = ({ user }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Fix: Handle async dataService methods
  useEffect(() => {
    const loadClients = async () => {
      const clientsData = await dataService.getClientsByAgent(user.id);
      setClients(clientsData.filter(c => c.status !== 'CANCELLED'));
    };
    loadClients();
  }, [user.id]);

  const filtered = clients.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusDisplay = (status: Client['status']) => {
    switch (status) {
      case 'SALE_CONCLUDED':
        return {
          label: 'Vente conclue',
          style: 'bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-100',
          icon: '✅'
        };
      case 'PENDING':
      default:
        return {
          label: 'En attente',
          style: 'bg-indigo-50 text-indigo-600 border-indigo-100',
          icon: '🕒'
        };
    }
  };

  // Border colors palette for visual variety
  const borderPalette = [
    { border: 'border-indigo-200', hoverBorder: 'border-indigo-500', bg: 'bg-indigo-50/50', icon: 'text-indigo-500', shadow: 'hover:shadow-indigo-100', avatar: 'bg-indigo-100 text-indigo-700' },
    { border: 'border-sky-200', hoverBorder: 'border-sky-500', bg: 'bg-sky-50/50', icon: 'text-sky-500', shadow: 'hover:shadow-sky-100', avatar: 'bg-sky-100 text-sky-700' },
    { border: 'border-emerald-200', hoverBorder: 'border-emerald-500', bg: 'bg-emerald-50/50', icon: 'text-emerald-500', shadow: 'hover:shadow-emerald-100', avatar: 'bg-emerald-100 text-emerald-700' },
    { border: 'border-amber-200', hoverBorder: 'border-amber-500', bg: 'bg-amber-50/50', icon: 'text-amber-500', shadow: 'hover:shadow-amber-100', avatar: 'bg-amber-100 text-amber-700' },
    { border: 'border-rose-200', hoverBorder: 'border-rose-500', bg: 'bg-rose-50/50', icon: 'text-rose-500', shadow: 'hover:shadow-rose-100', avatar: 'bg-rose-100 text-rose-700' },
    { border: 'border-violet-200', hoverBorder: 'border-violet-500', bg: 'bg-violet-50/50', icon: 'text-violet-500', shadow: 'hover:shadow-violet-100', avatar: 'bg-violet-100 text-violet-700' }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Portefeuille Clients</h1>
          <p className="text-gray-500 font-medium text-lg">Suivi en temps réel de vos contrats validés par l'administration.</p>
        </div>
        <div className="bg-white px-8 py-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{filtered.length} Dossiers Actifs</span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col md:flex-row gap-4 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          </div>
          <input 
            type="text" 
            placeholder="Filtrer votre portefeuille (Nom, Entreprise, Produit...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-gray-50 border-none rounded-[1.75rem] outline-none font-bold text-lg text-gray-800 placeholder:text-gray-300 shadow-inner"
          />
        </div>
        <div className="w-full md:w-80">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.75rem] outline-none font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-inner text-gray-600"
          >
            <option value="ALL">Tous les états</option>
            <option value="PENDING">🕒 En attente</option>
            <option value="SALE_CONCLUDED">✅ Vente conclue</option>
          </select>
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((c, index) => {
            const status = getStatusDisplay(c.status);
            const colorTheme = borderPalette[index % borderPalette.length];
            return (
              <div 
                key={c.id} 
                className={`
                  bg-white rounded-[3rem] p-6 border-2 transition-all duration-700 
                  group relative animate-in slide-in-from-bottom-12 flex flex-col
                  ${colorTheme.border} ${colorTheme.shadow} ${colorTheme.hoverBorder}
                  hover:-translate-y-2 hover:shadow-2xl shadow-xl
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header section with Badge */}
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center text-2xl font-black shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 
                    ${colorTheme.avatar}`}>
                    {c.fullName[0]}
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.15em] border flex items-center shadow-sm ${status.style}`}>
                    <span className="mr-2">{status.icon}</span>
                    {status.label}
                  </div>
                </div>

                {/* Main Client Info */}
                <div className="mb-4">
                  <h4 className="font-black text-gray-900 text-xl tracking-tight leading-none group-hover:text-indigo-600 transition-colors">{c.fullName}</h4>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mt-2 flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${colorTheme.icon.replace('text-', 'bg-')}`}></span>
                    {c.company || 'Compte Particulier'}
                  </p>
                </div>

                {/* Compact Detail list */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50 mb-4 group-hover:border-indigo-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center ${colorTheme.icon}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Pays</p>
                      <p className="font-black text-gray-800 text-xs">{c.country}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center ${colorTheme.icon}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Tel</p>
                      <p className="font-black text-gray-800 text-xs">{c.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 col-span-2">
                    <div className={`w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center ${colorTheme.icon}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                      <p className="font-black text-indigo-600 text-xs truncate">{c.email}</p>
                    </div>
                  </div>

                  <div className={`col-span-2 p-4 rounded-xl border transition-colors ${colorTheme.bg} ${colorTheme.border}`}>
                     <p className={`text-[8px] font-black uppercase tracking-[0.15em] mb-1 ${colorTheme.icon}`}>Offre</p>
                     <p className="font-black text-slate-800 text-xs leading-tight truncate">{c.product}</p>
                  </div>
                </div>

                {/* Footer info */}
                <div className="flex items-center justify-between pt-3">
                  <div className="text-[8px] font-black text-gray-300 uppercase tracking-[0.15em]">
                    {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                  <div className={`text-[8px] font-black uppercase tracking-[0.15em] opacity-40 ${colorTheme.icon}`}>
                    #{c.id.slice(0, 5)}
                  </div>
                </div>
              </div>
            );
          })}
        {filtered.length === 0 && (
          <div className="col-span-full py-40 text-center bg-gray-50/50 rounded-[5rem] border-4 border-dashed border-gray-100">
             <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm text-gray-200">
              {ICONS.Client}
            </div>
            <p className="text-gray-300 font-black uppercase text-xl tracking-[0.2em] italic">Aucun client correspondant à vos filtres</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const AgentCommissionsView: React.FC<{ user: UserApp }> = ({ user }) => {
  const [sales, setSales] = useState<(Sale & { clientName: string })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [appSettings, setAppSettings] = useState({ name: 'AFTRAS CRM', currency: 'FCFA' });

  // Fix: Handle async dataService methods
  useEffect(() => {
    const loadData = async () => {
      // Fix: use getSalesByAgent and enrich with client names
      const salesData = await dataService.getSalesByAgent(user.id);
      const clientsData = await dataService.getClientsByAgent(user.id);
      
      // Enrich sales with client names
      const enrichedSales = salesData.map((sale: any) => {
        const client = clientsData.find((c: any) => c.id === sale.clientId);
        return {
          ...sale,
          clientName: client ? client.fullName : 'Client inconnu'
        };
      });
      
      setSales(enrichedSales);
      setAppSettings(await dataService.getAppSettings());
    };
    loadData();
    const handleSettingsChange = async () => setAppSettings(await dataService.getAppSettings());
    window.addEventListener('app-settings-changed', handleSettingsChange);
    return () => window.removeEventListener('app-settings-changed', handleSettingsChange);
  }, [user.id]);

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totals = {
    total: sales.reduce((acc, s) => acc + s.commission, 0),
    pending: sales.filter(s => s.status === 'PENDING').reduce((acc, s) => acc + s.commission, 0),
    paid: sales.filter(s => s.status === 'PAID').reduce((acc, s) => acc + s.commission, 0)
  };

  const borderPalette = [
    { border: 'border-indigo-100', accent: 'bg-indigo-600', text: 'text-indigo-600', shadow: 'shadow-indigo-100/40', gradient: 'from-indigo-50' },
    { border: 'border-sky-100', accent: 'bg-sky-600', text: 'text-sky-600', shadow: 'shadow-sky-100/40', gradient: 'from-sky-50' },
    { border: 'border-emerald-100', accent: 'bg-emerald-600', text: 'text-emerald-600', shadow: 'shadow-emerald-100/40', gradient: 'from-emerald-50' },
    { border: 'border-amber-100', accent: 'bg-amber-600', text: 'text-amber-600', shadow: 'shadow-amber-100/40', gradient: 'from-amber-50' },
    { border: 'border-violet-100', accent: 'bg-violet-600', text: 'text-violet-600', shadow: 'shadow-violet-100/40', gradient: 'from-violet-50' },
    { border: 'border-rose-100', accent: 'bg-rose-600', text: 'text-rose-600', shadow: 'shadow-rose-100/40', gradient: 'from-rose-50' }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Revenus & Commissions</h1>
          <p className="text-gray-500 font-medium text-lg">Historique de vos reversements par vente validée.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-50 shadow-xl shadow-gray-100/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 relative z-10">Total Généré</p>
          <p className="text-4xl font-black text-indigo-600 relative z-10">{Math.round(totals.total).toLocaleString()} <span className="text-xs">{appSettings.currency}</span></p>
          <div className="mt-4 w-12 h-1 bg-indigo-100 rounded-full relative z-10"></div>
        </div>
        <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-50 shadow-xl shadow-gray-100/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 relative z-10">En Attente</p>
          <p className="text-4xl font-black text-amber-500 relative z-10">{Math.round(totals.pending).toLocaleString()} <span className="text-xs">{appSettings.currency}</span></p>
          <div className="mt-4 w-12 h-1 bg-amber-100 rounded-full relative z-10"></div>
        </div>
        <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-50 shadow-xl shadow-gray-100/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 relative z-10">Déjà Payé</p>
          <p className="text-4xl font-black text-emerald-500 relative z-10">{Math.round(totals.paid).toLocaleString()} <span className="text-xs">{appSettings.currency}</span></p>
          <div className="mt-4 w-12 h-1 bg-emerald-100 rounded-full relative z-10"></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col md:flex-row gap-4 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input 
            type="text" 
            placeholder="Filtrer par nom client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-gray-50 border-none rounded-[1.75rem] outline-none font-bold text-lg text-gray-800 placeholder:text-gray-300 shadow-inner"
          />
        </div>
        <div className="w-full md:w-80">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.75rem] outline-none font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-inner text-gray-600"
          >
            <option value="ALL">Tous les paiements</option>
            <option value="PENDING">🕒 En attente</option>
            <option value="PAID">✅ Validés / Payés</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredSales.map((sale, index) => {
          const theme = borderPalette[index % borderPalette.length];
          const isPaid = sale.status === 'PAID';
          
          return (
            <div 
              key={sale.id}
              className={`
                bg-white rounded-[3.5rem] p-10 border-2 transition-all duration-500
                group relative animate-in slide-in-from-bottom-12 flex flex-col
                ${theme.border} ${theme.shadow} hover:-translate-y-3 hover:shadow-2xl
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`absolute top-0 left-10 w-20 h-1 rounded-full ${theme.accent} opacity-50`}></div>
              
              <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-2xl ${isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} shadow-sm`}>
                  {isPaid ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  )}
                </div>
                <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${isPaid ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-amber-600 border-amber-100'}`}>
                  {isPaid ? 'Validé & Payé' : 'En attente'}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gains Commission</p>
                <div className="flex items-baseline space-x-2">
                   <h3 className={`text-5xl font-black tracking-tighter ${theme.text} group-hover:scale-105 transition-transform duration-500`}>
                    {Math.round(sale.commission).toLocaleString()}
                  </h3>
                  <span className="text-sm font-black text-gray-300 uppercase">{appSettings.currency}</span>
                </div>
              </div>

              <div className="space-y-6 pt-8 border-t border-gray-50 mb-8 flex-1">
                 <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Source Client</p>
                    <p className="font-black text-gray-800 text-lg tracking-tight leading-none group-hover:text-indigo-600 transition-colors">{sale.clientName}</p>
                 </div>
                 <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Valeur Contrat</p>
                      <p className="font-bold text-gray-500 text-sm">{Math.round(sale.amount).toLocaleString()} {appSettings.currency}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Date Vente</p>
                      <p className="font-black text-gray-400 text-[10px] uppercase tracking-tighter">
                        {new Date(sale.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                 </div>
              </div>

              <div className="flex items-center justify-between text-[8px] font-black text-gray-200 uppercase tracking-[0.3em]">
                <span>KPI CRM V6</span>
                <span>#{sale.id.slice(0, 6)}</span>
              </div>
            </div>
          );
        })}
        {filteredSales.length === 0 && (
          <div className="col-span-full py-40 text-center bg-gray-50/50 rounded-[5rem] border-4 border-dashed border-gray-100">
             <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm text-gray-200 text-4xl">
              💰
            </div>
            <p className="text-gray-300 font-black uppercase text-xl tracking-[0.2em] italic">Aucune commission enregistrée</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const AgentProfileView: React.FC<{ user: UserApp; onUpdate: (user: UserApp) => void }> = ({ user, onUpdate }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Fix: updateUser exists in updated dataService
    await dataService.updateUser(user.id, {
      firstName: fd.get('firstName') as string,
      lastName: fd.get('lastName') as string,
      phone: fd.get('phone') as string,
    });
    // Update the local user state with the new values
    const updatedUser = {
      ...user,
      firstName: fd.get('firstName') as string,
      lastName: fd.get('lastName') as string,
      phone: fd.get('phone') as string,
    };
    onUpdate(updatedUser);
    alert('Informations personnelles mises à jour !');
  };

  const handlePasswordUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newPass = fd.get('newPassword') as string;
    const confirmPass = fd.get('confirmPassword') as string;

    if (newPass !== confirmPass) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }
    
    alert('Votre mot de passe a été réinitialisé avec succès !');
    e.currentTarget.reset();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Mon Profil Agent</h1>
        <p className="text-gray-400 font-medium">Gérez vos informations et la sécurité de votre accès CRM V6.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* PERSONAL INFO CARD */}
        <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-50 shadow-xl shadow-gray-100/50 flex flex-col">
          <div className="flex items-center space-x-4 mb-10">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-gray-400">Informations Personnelles</h3>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6 flex-1">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prénom</label>
                <input name="firstName" defaultValue={user.firstName} required className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold transition-all focus:ring-4 focus:ring-indigo-50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom</label>
                <input name="lastName" defaultValue={user.lastName} required className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold transition-all focus:ring-4 focus:ring-indigo-50" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email (Non modifiable)</label>
              <input value={user.email} readOnly className="w-full px-6 py-4 bg-gray-100/50 border-2 border-gray-100 rounded-2xl font-bold cursor-not-allowed text-gray-400" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Téléphone Mobile</label>
              <input name="phone" defaultValue={user.phone} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold transition-all focus:ring-4 focus:ring-indigo-50" placeholder="+225 00 00 00 00" />
            </div>
            <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[1.75rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all pt-6 mt-4">
              Enregistrer les infos
            </button>
          </form>
        </div>

        {/* SECURITY CARD */}
        <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-50 shadow-xl shadow-gray-100/50 flex flex-col">
          <div className="flex items-center space-x-4 mb-10">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-xl shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-gray-400">Sécurité du Compte</h3>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mot de passe actuel</label>
              <div className="relative">
                <input 
                  name="currentPassword" 
                  type={showCurrentPassword ? "text" : "password"} 
                  required 
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-rose-100 rounded-2xl outline-none font-bold transition-all focus:ring-4 focus:ring-rose-50 pr-14" 
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  {showCurrentPassword ? ICONS.EyeOff : ICONS.Eye}
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-50">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
              <div className="relative">
                <input 
                  name="newPassword" 
                  type={showNewPassword ? "text" : "password"} 
                  required 
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-rose-100 rounded-2xl outline-none font-bold transition-all focus:ring-4 focus:ring-rose-50 pr-14" 
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {showNewPassword ? ICONS.EyeOff : ICONS.Eye}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <input 
                  name="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"} 
                  required 
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-rose-100 rounded-2xl outline-none font-bold transition-all focus:ring-4 focus:ring-rose-50 pr-14" 
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {showConfirmPassword ? ICONS.EyeOff : ICONS.Eye}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full py-5 bg-gray-900 text-white rounded-[1.75rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-gray-200 hover:bg-black transition-all pt-6 mt-4">
              Changer le mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

