
import React, { useState } from 'react';
import { Client, User } from '../types';
import { X, DollarSign, Calculator } from 'lucide-react';
import { COMMISSION_RATE } from '../constants';

interface ConcludeSaleModalProps {
  client: Client;
  agent: User;
  adminId: string;
  onClose: () => void;
  onConfirm: (ca: number, mr: number) => void;
}

const ConcludeSaleModal: React.FC<ConcludeSaleModalProps> = ({ client, agent, onClose, onConfirm }) => {
  const [ca, setCa] = useState<number>(0);
  const [mr, setMr] = useState<number>(0);

  const benefit = Math.max(0, ca - mr);
  const commission = benefit * COMMISSION_RATE;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-indigo-50">
          <div>
            <h2 className="text-xl font-bold text-indigo-900">Conclure la vente</h2>
            <p className="text-sm text-indigo-600 font-medium">Création de facture & commission</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-indigo-100 rounded-full text-indigo-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Client</p>
              <p className="font-bold text-slate-800 truncate">{client.name}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Agent</p>
              <p className="font-bold text-slate-800 truncate">{agent.name}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Chiffre d'Affaires (HT)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={ca}
                  onChange={(e) => setCa(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg"
                />
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Montant Réel / Coût (HT)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={mr}
                  onChange={(e) => setMr(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg"
                />
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-indigo-900 rounded-xl p-5 text-white">
            <div className="flex items-center space-x-2 mb-4 opacity-75">
              <Calculator size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Simulation Directe</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase font-bold text-indigo-300">Bénéfice</p>
                <p className="text-2xl font-black">{benefit.toLocaleString()} FCFA</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-indigo-300">Commission Agent ({COMMISSION_RATE * 100}%)</p>
                <p className="text-2xl font-black text-amber-400">{commission.toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={() => onConfirm(ca, mr)}
            className="flex-2 flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            Valider la vente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConcludeSaleModal;