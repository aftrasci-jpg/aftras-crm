
import React, { useState, useMemo } from 'react';
import { Client, User, UserRole, RemoteForm, Sale, ClientStatus } from '../types';
import { X, Phone, Building, MessageSquare, Info, Trash2, AlertCircle, UserPlus, Mail, Shield, UserCheck, ShieldAlert, Edit2, Share2, MessageCircle, DollarSign, Briefcase, BarChart3, FileText, MapPin, Search, Globe, Sparkles, ShoppingCart } from 'lucide-react';
import { COMMISSION_RATE } from '../constants';
import { aiService } from '../services/ai';

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

export const ViewClientDetailsModal: React.FC<{ client: Client; userRole: UserRole; onClose: () => void; onStartConclusion?: (client: Client) => void }> = ({ client, userRole, onClose, onStartConclusion }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleGetAIInsight = async () => {
    setLoadingAI(true);
    const insight = await aiService.generateSalesPitch(client);
    setAiInsight(insight);
    setLoadingAI(false);
  };

  const isAdmin = userRole === 'ADMIN';
  const canConclude = isAdmin && client.status === ClientStatus.CLIENT_CONFIRME;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="p-10 border-b flex justify-between items-start bg-slate-50 shrink-0">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-xl border border-indigo-50">
              <Building size={40} />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{client.name}</h2>
              <div className="flex items-center space-x-3 mt-4">
                 <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${client.status === ClientStatus.VENTE_CONCLUE ? 'bg-emerald-600 text-white' : client.status === ClientStatus.CLIENT_CONFIRME ? 'bg-blue-600 text-white' : 'bg-slate-400 text-white'}`}>
                   {client.status}
                 </span>
                 <span className="text-slate-400 text-xs font-bold italic">ID: {client.id}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-full text-slate-300 transition-colors shadow-sm"><X size={28} /></button>
        </div>
        
        <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center">
                  <Phone size={14} className="mr-2" /> Contact
                </h3>
                <p className="text-2xl font-black text-slate-800 tracking-tight">
                   <span className="text-slate-400 text-lg mr-2 font-black">{client.phonePrefix}</span>
                   {client.phone || 'Non renseigné'}
                </p>
                <div className="flex space-x-2 mt-2">
                   <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-wider">{client.country || 'Pays inconnu'}</span>
                   <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-wider">{client.city || 'Ville inconnue'}</span>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center">
                  <Briefcase size={14} className="mr-2" /> Produit d'intérêt
                </h3>
                <p className="text-xl font-bold text-slate-700 italic">{client.product || 'Général'}</p>
              </div>
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center">
                  <MessageSquare size={14} className="mr-2" /> Détails de suivi
                </h3>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 min-h-[140px]">
                  <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{client.notes || 'Aucun détail supplémentaire disponible.'}"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-10 border-t border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center">
                <Sparkles size={14} className="mr-2" /> Assistant IA Gemini
              </h3>
              {!aiInsight && !loadingAI && (
                <button 
                  onClick={handleGetAIInsight}
                  className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all"
                >
                  Générer Argumentaire
                </button>
              )}
            </div>
            
            {loadingAI && (
              <div className="flex items-center space-x-3 p-6 bg-indigo-50/50 rounded-3xl animate-pulse">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                <span className="text-xs font-bold text-indigo-400">Gemini analyse le profil client...</span>
              </div>
            )}

            {aiInsight && (
              <div className="p-6 bg-indigo-900 text-indigo-50 rounded-3xl shadow-xl shadow-indigo-100">
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-xs leading-relaxed opacity-90">{aiInsight}</p>
                </div>
                <button 
                  onClick={() => setAiInsight(null)}
                  className="mt-4 text-[9px] font-black uppercase text-indigo-300 hover:text-white"
                >
                  Effacer l'analyse
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-10 bg-slate-50 border-t flex justify-end items-center gap-4 shrink-0">
          {canConclude && (
             <button 
              onClick={() => onStartConclusion?.(client)}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all flex items-center justify-center space-x-3"
            >
              <ShoppingCart size={18} />
              <span>Conclure la vente maintenant</span>
            </button>
          )}
          <button onClick={onClose} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
            Fermer la fiche
          </button>
        </div>
      </div>
    </div>
  );
};

export const SaleReportModal: React.FC<{ sale: Sale; clientName: string; agentName: string; onClose: () => void }> = ({ sale, clientName, agentName, onClose }) => {
  const reportText = `🧾 *RAPPORT DE VENTE AFTRAS CRM*\n\n🤝 *CLIENT :* ${clientName}\n👨‍💼 *AGENT :* ${agentName}\n💰 *CHIFFRE D'AFFAIRES :* ${sale.ca.toLocaleString()} FCFA\n📈 *BÉNÉFICE :* ${sale.benefit.toLocaleString()} FCFA\n💸 *COMMISSION :* ${sale.commission.toLocaleString()} FCFA\n📅 *DATE :* ${sale.date}\n\n✅ Vente validée avec succès.`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 animate-in zoom-in duration-200 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-900">Reçu de Vente</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="bg-indigo-50 p-6 rounded-2xl border-2 border-dashed border-indigo-200 mb-8 relative">
          <div className="absolute top-4 right-4 text-indigo-200">
            <FileText size={32} />
          </div>
          <pre className="text-xs font-bold text-indigo-900 whitespace-pre-wrap font-mono leading-relaxed">
            {reportText}
          </pre>
        </div>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 font-black text-[10px] uppercase text-slate-400 hover:text-slate-600">Fermer</button>
          <button 
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(reportText)}`, '_blank')}
            className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2 shadow-xl shadow-emerald-50"
          >
            <MessageCircle size={18} />
            <span>Partager WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const EditRemoteFormModal: React.FC<{ form: RemoteForm; onClose: () => void }> = ({ form, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Edit2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Réviser la demande</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dossier: {form.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
        </div>

        <div className="space-y-6 mb-8">
           <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Message client</p>
              <p className="text-sm font-medium text-slate-700 italic">"{form.message}"</p>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Produit</p>
                <p className="text-xs font-black text-slate-800">{form.product}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ville</p>
                <p className="text-xs font-black text-slate-800">{form.city}</p>
              </div>
           </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
        >
          Retourner à la liste
        </button>
      </div>
    </div>
  );
};

export const GlobalReportModal: React.FC<{ stats: any; onClose: () => void }> = ({ stats, onClose }) => {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleGetAISummary = async () => {
    setLoadingAI(true);
    const summary = await aiService.analyzeGlobalPerformance(stats);
    setAiSummary(summary);
    setLoadingAI(false);
  };

  const dateStr = new Date().toLocaleDateString();
  const agentDetails = stats.agentStats.map((a: any) => 
    `• *${a.name}* : ${a.salesCount} ventes | ${a.prospectsCount} prospects | ${a.totalCa.toLocaleString()} CA`
  ).join('\n');

  const productDetails = stats.topProducts.map((p: any) => 
    `• *${p.name}* : ${p.count} ventes`
  ).join('\n');

  const reportText = `📊 *RAPPORT DÉTAILLÉ AFTRAS CRM - ${dateStr}* 📊\n\n💰 *PERFORMANCE FINANCIÈRE*\n-----------------------------\n💰 *CA GLOBAL :* ${stats.totalCa.toLocaleString()} FCFA\n📈 *PROFIT RÉEL :* ${stats.totalBenefit.toLocaleString()} FCFA\n💸 *COMMS AGENTS :* ${stats.totalComm.toLocaleString()} FCFA\n\n👥 *PORTEFEUILLE CLIENTS*\n-----------------------------\n🚀 *PROSPECTS ACTIFS :* ${stats.totalProspects}\n✅ *CLIENTS PRÊTS :* ${stats.totalConfirmed}\n🤝 *VENTES CLOSES :* ${stats.totalSales}\n\n👨‍💼 *PRODUCTIVITÉ PAR AGENT*\n-----------------------------\n${agentDetails}\n\n🏢 *TOP PRODUITS (VOLUME)*\n-----------------------------\n${productDetails}\n\n✅ Rapport consolidé via Aftras CRM`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in duration-200 overflow-hidden border border-indigo-100 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b bg-indigo-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white shadow-sm">
              <BarChart3 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight leading-none">Rapport d'Activité Global</h2>
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-2">Détails de performance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto flex-1">
          {!aiSummary && !loadingAI && (
            <button 
              onClick={handleGetAISummary}
              className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl border-2 border-indigo-100 flex items-center justify-center space-x-2 hover:bg-indigo-100 transition-all group"
            >
              <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Obtenir Analyse Stratégique IA</span>
            </button>
          )}

          {loadingAI && (
            <div className="p-6 bg-slate-50 rounded-2xl animate-pulse text-center">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IA en cours de réflexion...</span>
            </div>
          )}

          {aiSummary && (
            <div className="p-6 bg-emerald-900 text-emerald-50 rounded-2xl shadow-lg border-l-4 border-emerald-400">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-3 flex items-center">
                <Shield size={14} className="mr-2" /> Recommandations Stratégiques
              </h4>
              <p className="text-xs font-bold leading-relaxed opacity-90 whitespace-pre-wrap">{aiSummary}</p>
            </div>
          )}

          <div className="bg-slate-50 p-6 rounded-[1.5rem] border-2 border-dashed border-slate-200 relative">
            <div className="absolute top-4 right-4 text-slate-300">
              <FileText size={20} />
            </div>
            <pre className="text-[10px] font-mono text-slate-700 whitespace-pre-wrap leading-relaxed font-bold">
              {reportText}
            </pre>
          </div>
        </div>

        <div className="p-8 bg-slate-50 flex gap-4 border-t shrink-0">
          <button onClick={onClose} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">Fermer</button>
          <button 
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(reportText)}`, '_blank')}
            className="flex-2 flex-[2] py-4 bg-emerald-600 text-white font-black rounded-2xl uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center space-x-3 shadow-xl shadow-emerald-100"
          >
            <MessageCircle size={18} />
            <span>Extraire vers WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const AddProspectModal: React.FC<{ agentId: string; onClose: () => void; onAdd: (data: any) => void }> = ({ agentId, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+225');
  const [country, setCountry] = useState('Côte d\'Ivoire');
  const [city, setCity] = useState('');
  const [product, setProduct] = useState('');
  const [notes, setNotes] = useState('');
  const [countrySearch, setCountrySearch] = useState('');

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));
  }, [countrySearch]);

  const handleCountrySelect = (c: { name: string, code: string }) => {
    setCountry(c.name);
    setPhonePrefix(c.code);
    setCountrySearch('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom-8 duration-300 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-8 border-b bg-slate-50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nouveau Prospect</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Fiche de qualification</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors"><X size={24} /></button>
        </div>
        
        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center">
               <Building size={14} className="mr-2" /> Identité du prospect
            </label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold placeholder:text-slate-300" 
              placeholder="Nom ou Raison Sociale" 
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center">
               <Phone size={14} className="mr-2" /> Contact téléphonique
            </label>
            <div className="flex gap-2">
              <select 
                value={phonePrefix} 
                onChange={e => setPhonePrefix(e.target.value)}
                className="w-24 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold text-sm appearance-none cursor-pointer"
              >
                {COUNTRIES.map(c => <option key={c.name} value={c.code}>{c.code}</option>)}
              </select>
              <input 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                type="tel"
                className="flex-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold placeholder:text-slate-300" 
                placeholder="Numéro de téléphone" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 relative">
              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Pays</label>
              <div className="relative group">
                <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                   value={countrySearch || country}
                   onChange={e => {
                     setCountrySearch(e.target.value);
                     if (!e.target.value) setCountry('');
                   }}
                   onFocus={() => setCountrySearch('')}
                   className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold text-sm"
                   placeholder="Rechercher pays..."
                />
                {countrySearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-2xl shadow-xl z-50 max-h-40 overflow-y-auto">
                    {filteredCountries.map(c => (
                      <button 
                        key={c.name}
                        onClick={() => handleCountrySelect(c)}
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-xs font-bold text-slate-700 transition-colors"
                      >
                        {c.name} ({c.code})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Ville</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  value={city} 
                  onChange={e => setCity(e.target.value)} 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold text-sm" 
                  placeholder="ex: Abidjan" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center">
               <Briefcase size={14} className="mr-2" /> Intérêt commercial
            </label>
            <input 
              value={product} 
              onChange={e => setProduct(e.target.value)} 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold text-sm" 
              placeholder="Produit ou service d'intérêt" 
            />
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Détails</label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold text-sm min-h-[100px] resize-none" 
                placeholder="Besoins spécifiques, contexte..." 
              />
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t flex gap-4 shrink-0">
          <button onClick={onClose} className="flex-1 py-4 font-black text-[10px] uppercase text-slate-500 tracking-widest hover:text-slate-800 transition-colors">Annuler</button>
          <button 
            onClick={() => onAdd({ name, phonePrefix, phone, country, city, product, notes, agentId })} 
            className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
          >
            Créer la fiche prospect
          </button>
        </div>
      </div>
    </div>
  );
};

export const ConfirmProspectModal: React.FC<{ client: Client; onClose: () => void; onConfirm: () => void }> = ({ client, onClose, onConfirm }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 text-center animate-in zoom-in-95">
      <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
        <UserCheck size={48} />
      </div>
      <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Confirmer le Client ?</h2>
      <p className="text-slate-500 font-medium mb-10 leading-relaxed">
        Vous êtes sur le point de marquer <span className="text-slate-900 font-black italic">"{client.name}"</span> comme prêt à la vente. L'administrateur sera notifié pour conclure.
      </p>
      <div className="flex gap-4">
        <button onClick={onClose} className="flex-1 py-4 font-black text-[10px] uppercase text-slate-400 hover:text-slate-600">Retour</button>
        <button onClick={onConfirm} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">Oui, Confirmer</button>
      </div>
    </div>
  </div>
);

export const DeleteClientModal: React.FC<{ client: Client; onClose: () => void; onConfirm: (reason: string) => void }> = ({ client, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-red-900/20 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 animate-in slide-in-from-top-4">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 text-center mb-4 tracking-tight">Supprimer ?</h2>
        <p className="text-slate-500 text-center mb-8 font-medium italic">Attention : cette action est irréversible pour le prospect <span className="font-black text-slate-900">"{client.name}"</span>.</p>
        <div className="space-y-4 mb-10">
          <label className="text-[10px] font-black text-red-400 uppercase tracking-widest ml-1">Motif de suppression</label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} className="w-full p-4 bg-red-50 border-none rounded-2xl focus:ring-2 ring-red-500 outline-none font-bold min-h-[100px] resize-none" placeholder="ex: Hors cible, demande annulée..." />
        </div>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 font-black text-[10px] uppercase text-slate-400">Annuler</button>
          <button onClick={() => onConfirm(reason)} className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 active:scale-95 transition-all">Supprimer</button>
        </div>
      </div>
    </div>
  );
};

export const AddUserModal: React.FC<{ onClose: () => void; onAdd: (data: any) => void }> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('AGENT');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
        <div className="p-8 border-b bg-indigo-600 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black tracking-tight leading-none">Nouveau Membre</h2>
            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-2">Expansion de l'équipe</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-indigo-100 transition-colors"><X size={24} /></button>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom complet</label>
            <div className="relative">
              <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input value={name} onChange={e => setName(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold" placeholder="ex: Jean Dupont" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email professionnel</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none font-bold" placeholder="ex: j.dupont@ent.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rôle assigné</label>
            <div className="grid grid-cols-2 gap-2">
              {(['AGENT', 'ADMIN'] as UserRole[]).map(r => (
                <button 
                  key={r} 
                  onClick={() => setRole(r)}
                  className={`py-3 rounded-xl text-[9px] font-black uppercase transition-all ${role === r ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-8 bg-slate-50 border-t flex gap-4 shrink-0">
          <button onClick={onClose} className="flex-1 py-4 font-black text-[10px] uppercase text-slate-400">Annuler</button>
          <button onClick={() => onAdd({ name, email, role })} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all">Créer l'accès</button>
        </div>
      </div>
    </div>
  );
};
