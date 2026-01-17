
import React from 'react';
import { Client, Sale, Commission, ClientStatus, UserRole, RemoteForm } from '../types';
import { User as UserIcon, Calendar, DollarSign, TrendingUp, CheckCircle, Clock, ArrowRight, Wallet, Eye, Trash2, ShoppingCart, BarChart3, ChevronRight, MessageCircle, Mail, Phone, Check, X, UserCheck, Edit2, Briefcase, Share2, MapPin, Building, Link as LinkIcon } from 'lucide-react';
import { store } from '../services/store';
import { COMMISSION_RATE } from '../constants';

const StatusBadge = ({ status }: { status: ClientStatus }) => {
  const colors = {
    [ClientStatus.EN_COURS]: 'bg-slate-500/10 text-slate-500 border-slate-200',
    [ClientStatus.CLIENT_CONFIRME]: 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100',
    [ClientStatus.VENTE_CONCLUE]: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all duration-300 ${colors[status]}`}>
      {status}
    </span>
  );
};

export const RemoteFormKpiCard: React.FC<{ form: RemoteForm; onEdit?: (form: RemoteForm) => void }> = ({ form, onEdit }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group animate-in slide-in-from-bottom-4">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
          <MessageCircle size={20} />
        </div>
        <div>
          <h3 className="font-black text-slate-900 tracking-tight">{form.name}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(form.date).toLocaleDateString()}</p>
        </div>
      </div>
      <button 
        onClick={() => onEdit?.(form)}
        className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
        title="Modifier la fiche"
      >
        <Edit2 size={16} />
      </button>
    </div>

    <div className="space-y-3 mb-6">
      <div className="flex items-center text-xs text-slate-600 space-x-2">
        <Mail size={14} className="text-slate-300" />
        <span className="font-medium truncate">{form.email}</span>
      </div>
      <div className="flex items-center text-xs text-slate-600 space-x-2">
        <Phone size={14} className="text-slate-300" />
        <span className="font-medium">{form.phonePrefix} {form.phone}</span>
      </div>
      <div className="flex items-center text-xs text-slate-400 space-x-2 mt-1">
        <MapPin size={14} className="text-slate-200" />
        <span className="font-bold text-[10px] uppercase tracking-tighter">{form.city}, {form.country}</span>
      </div>
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mt-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Produit d'intérêt</p>
        <p className="text-xs font-bold text-slate-700">{form.product}</p>
      </div>
    </div>

    <div className="flex gap-2">
      <button 
        onClick={() => store.validateRemoteForm(form.id)}
        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2"
      >
        <Check size={14} />
        <span>Accepter</span>
      </button>
      <button 
        onClick={() => store.deleteRemoteForm(form.id)}
        className="px-4 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white py-2.5 rounded-xl transition-all"
      >
        <X size={18} />
      </button>
    </div>
  </div>
);

interface ClientCardProps {
  client: Client;
  role: UserRole;
  agentName?: string;
  onConcludeSale?: (client: Client) => void;
  onConfirmAsClient?: (client: Client) => void;
  onViewDetails?: (client: Client) => void;
  onDelete?: (client: Client) => void;
}

export const ClientKpiCard: React.FC<ClientCardProps> = ({ client, role, agentName, onConcludeSale, onConfirmAsClient, onViewDetails, onDelete }) => {
  const statusThemes = {
    [ClientStatus.EN_COURS]: { border: 'border-slate-200', accent: 'border-l-slate-400', hover: 'hover:border-slate-400' },
    [ClientStatus.CLIENT_CONFIRME]: { border: 'border-blue-200', accent: 'border-l-blue-600', hover: 'hover:border-blue-600' },
    [ClientStatus.VENTE_CONCLUE]: { border: 'border-emerald-200', accent: 'border-l-emerald-400', hover: 'hover:border-emerald-400' },
  };

  const theme = statusThemes[client.status];
  const isAdmin = role === 'ADMIN';

  return (
    <div className={`bg-white border ${theme.border} border-l-4 ${theme.accent} ${theme.hover} rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden animate-in fade-in slide-in-from-bottom-2`}>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex-1 min-w-0 mr-2">
          <h3 className="text-lg font-black text-slate-900 truncate tracking-tight">{client.name}</h3>
          <div className="flex items-center text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-widest">
            <Calendar size={12} className="mr-1" />
            {client.createdAt}
          </div>
        </div>
        <StatusBadge status={client.status} />
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-50 relative z-10">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-bold uppercase tracking-tighter">Responsable</span>
          <span className="font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[150px]">{agentName || 'Moi'}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-bold uppercase tracking-tighter">Produit</span>
          <span className="font-black text-indigo-600 italic truncate max-w-[120px]">{client.product || 'Standard'}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-dashed">
           <div className="flex items-center text-slate-400">
             <MapPin size={12} className="mr-1" />
             <span className="font-bold uppercase tracking-tighter">{client.city}</span>
           </div>
           <span className="font-black text-slate-500">{client.country}</span>
        </div>
      </div>

      <div className="mt-6 flex gap-2 relative z-10">
        <button 
          onClick={() => onViewDetails?.(client)}
          className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
          title="Voir détails"
        >
          <Eye size={18} />
        </button>

        {role === 'AGENT' && client.status === ClientStatus.EN_COURS && (
          <button 
            onClick={() => onConfirmAsClient?.(client)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-100 active:scale-95 flex items-center justify-center space-x-2"
          >
            <UserCheck size={14} />
            <span>Confirmer Dossier</span>
          </button>
        )}
        
        {isAdmin && (
          <>
            {client.status === ClientStatus.CLIENT_CONFIRME && (
              <button 
                onClick={() => onConcludeSale?.(client)}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center justify-center space-x-2"
              >
                <ShoppingCart size={14} />
                <span>Conclure la Vente</span>
              </button>
            )}
            <button 
              onClick={() => onDelete?.(client)}
              className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100"
              title="Supprimer"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export const SaleKpiCard: React.FC<{ sale: Sale; clientName: string; agentName: string; onReport?: (sale: Sale) => void }> = ({ sale, clientName, agentName, onReport }) => (
  <div className="bg-white border border-indigo-100 rounded-[2rem] p-6 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-500 animate-in zoom-in-95">
    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-full -mr-24 -mt-24 blur-2xl group-hover:bg-indigo-100/50 transition-colors"></div>
    
    <div className="flex justify-between items-start mb-8 relative z-10">
      <div>
        <h3 className="text-2xl font-black text-slate-900 leading-none tracking-tight">{clientName}</h3>
        <div className="flex items-center space-x-3 mt-3">
          <span className="text-[9px] bg-slate-900 text-white px-2 py-1 rounded-md font-black uppercase tracking-widest">VAL-2024</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{sale.date}</span>
        </div>
      </div>
      <div className="flex space-x-2">
        {onReport && (
          <button 
            onClick={() => onReport(sale)}
            className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-lg shadow-emerald-50"
            title="Envoyer Rapport"
          >
            <Share2 size={18} />
          </button>
        )}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-4 rounded-2xl shadow-xl shadow-indigo-100 group-hover:rotate-6 transition-transform">
          <ShoppingCart size={24} />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2 py-6 border-y border-slate-50 relative z-10">
      <div className="space-y-1">
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">C.A. HT</p>
        <p className="text-xl font-black text-slate-900">{sale.ca.toLocaleString()} FCFA</p>
      </div>
      <div className="space-y-1 border-x border-slate-100 px-4">
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Profit</p>
        <p className="text-xl font-black text-emerald-600">+{sale.benefit.toLocaleString()} FCFA</p>
      </div>
      <div className="space-y-1 pl-4">
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Agent</p>
        <p className="text-xl font-black text-indigo-600">{sale.commission.toLocaleString()} FCFA</p>
      </div>
    </div>
    
    <div className="mt-5 flex items-center justify-between relative z-10">
      <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center mr-2 text-slate-600 text-[8px] font-black">
          {agentName.charAt(0)}
        </div>
        {agentName}
      </div>
      <div className="flex items-center text-emerald-500 text-[10px] font-black uppercase">
        <CheckCircle size={12} className="mr-1" />
        Validé
      </div>
    </div>
  </div>
);

export const CommissionKpiCard: React.FC<{ commission: Commission; agentName: string; clientName?: string; role: UserRole }> = ({ commission, agentName, clientName, role }) => {
  const isPaid = commission.status === 'payée';
  return (
    <div className={`rounded-[2rem] p-1 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 animate-in fade-in ${isPaid ? 'bg-gradient-to-br from-emerald-400 to-teal-600' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
      <div className="bg-white rounded-[1.9rem] p-6 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-4 rounded-2xl ${isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} group-hover:scale-110 transition-transform`}>
            <Wallet size={28} />
          </div>
          <div className="text-right">
            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 ${isPaid ? 'border-emerald-100 text-emerald-600' : 'border-amber-100 text-amber-600 shadow-lg shadow-amber-50'}`}>
              {commission.status}
            </span>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-3 tracking-tighter">{commission.date}</p>
          </div>
        </div>

        <div className="mb-8">
          {clientName && (
            <div className="flex items-center space-x-2 mb-3">
               <Briefcase size={12} className="text-slate-300" />
               <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{clientName}</p>
            </div>
          )}
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Commission nette</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-black text-slate-900 tracking-tight">{commission.amount.toLocaleString()} FCFA</p>
            <div className={`px-2 py-0.5 rounded-md text-[10px] font-black ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {Math.round(COMMISSION_RATE * 100)}%
            </div>
          </div>
          {role !== 'AGENT' && (
            <p className="text-xs text-slate-500 mt-4 font-bold flex items-center">
              <UserIcon size={14} className="mr-2 text-slate-300" />
              Bénéficiaire : <span className="text-slate-900 ml-1">{agentName}</span>
            </p>
          )}
        </div>

        {role === 'ADMIN' && (
          <button 
            onClick={() => store.toggleCommissionStatus(commission.id)}
            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
              isPaid ? 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 shadow-none' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-200'
            }`}
          >
            {isPaid ? 'Annuler Paiement' : 'Libérer les fonds'}
          </button>
        )}
      </div>
    </div>
  );
};

export const GenericKpi: React.FC<{ 
  label: string; 
  value: string | number; 
  icon: React.ReactNode; 
  color: string;
  borderColor?: string;
  valueColor?: string;
  onClick?: () => void;
}> = ({ label, value, icon, color, borderColor, valueColor, onClick }) => (
  <button 
    onClick={onClick}
    disabled={!onClick}
    className={`bg-white group p-6 rounded-[2rem] border ${borderColor || 'border-slate-100'} shadow-sm flex items-center space-x-5 transition-all w-full text-left outline-none relative overflow-hidden animate-in zoom-in-95 duration-300 ${onClick ? 'cursor-pointer hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-1.5 active:scale-95' : 'cursor-default'}`}
  >
    <div className={`p-4 rounded-2xl ${color} shadow-lg shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 group-hover:text-slate-600 transition-colors">{label}</p>
      <div className="flex items-center justify-between">
        <p className={`text-3xl font-black ${valueColor || 'text-slate-900'} leading-none tracking-tight`}>{value}</p>
        {onClick && <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />}
      </div>
    </div>
  </button>
);
