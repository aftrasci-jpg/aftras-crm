import React, { useState, useEffect, useRef } from 'react';
import { StatCard } from './Common/StatCard';
import { ICONS } from '../constants';
import { dataService } from '../services/dataService';
import { dbService } from '../services/db';
import { UserApp, UserStatus, UserRole, AccessCode, Prospect, ProspectStatus, Client, Sale, NotificationApp } from '../types';
import { auth } from '../firebase-config';

// Import all admin components
import { AdminDashboardHome } from './AdminViews';
import { AdminProspectsView } from './AdminViews';
import { AdminClientsView } from './AdminViews';
import { AdminSalesView } from './AdminViews';
import { AdminCommissionsView } from './AdminViews';
import { AdminNotificationsView } from './AdminViews';
import { AdminSettingsView } from './AdminViews';

export const SupervisorDashboardHome: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return <AdminDashboardHome onNavigate={onNavigate} />;
};

export const SupervisorProspectsView: React.FC = () => {
  return <AdminProspectsView readOnly={true} />;
};

export const SupervisorClientsView: React.FC = () => {
  return <AdminClientsView readOnly={true} />;
};

export const SupervisorSalesView: React.FC = () => {
  return <AdminSalesView readOnly={true} />;
};

export const SupervisorCommissionsView: React.FC = () => {
  return <AdminCommissionsView readOnly={true} />;
};

export const SupervisorNotificationsView: React.FC = () => {
  return <AdminNotificationsView readOnly={true} />;
};

export const SupervisorSettingsView: React.FC = () => {
  return <AdminSettingsView readOnly={true} />;
};

export const SupervisorProfileView: React.FC<{ user: UserApp; onUpdate: (user: UserApp) => void }> = ({ user, onUpdate }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs.' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    try {
      // Mettre à jour les informations personnelles
      const updated = await dataService.updateUser(user.id, {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      });
      onUpdate(updated);
      
      // Mettre à jour le mot de passe via Firebase Auth
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Utilisateur non connecté');
      
      // Vérifier le mot de passe actuel
      const { authService } = await import('../services/auth');
      await authService.login(currentUser.email!, currentPassword);
      
      // Mettre à jour le mot de passe
      const { updatePassword } = await import('firebase/auth');
      await updatePassword(currentUser, newPassword);
      
      setMessage({ type: 'success', text: 'Profil et mot de passe mis à jour avec succès !' });
      
      // Réinitialiser les champs
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour. Vérifiez votre mot de passe actuel.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12 animate-in fade-in duration-700">
      <h1 className="text-4xl font-black text-gray-900 text-center tracking-tight">Profil Superviseur</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-50 shadow-xl flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-[0.25em] text-gray-400 mb-10">Infos Personnelles</h3>
          <form onSubmit={handleUpdate} className="space-y-6 flex-1">
            <div className="grid grid-cols-2 gap-6">
              <input 
                value={user.firstName} 
                onChange={(e) => onUpdate({ ...user, firstName: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-indigo-100" 
                placeholder="Prénom" 
              />
              <input 
                value={user.lastName} 
                onChange={(e) => onUpdate({ ...user, lastName: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-indigo-100" 
                placeholder="Nom" 
              />
            </div>
            <input value={user.email} readOnly className="w-full px-6 py-4 bg-gray-100/50 rounded-2xl font-bold cursor-not-allowed text-gray-400 border-2 border-transparent" />
            <input 
              value={user.phone || ''} 
              onChange={(e) => onUpdate({ ...user, phone: e.target.value })}
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-indigo-100" 
              placeholder="Téléphone" 
            />
            <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] pt-6 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
              Enregistrer les modifications
            </button>
          </form>
        </div>
        <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-50 shadow-xl flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-[0.25em] text-gray-400 mb-10">Sécurité & Mot de passe</h3>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mot de passe actuel</label>
              <div className="relative">
                <input 
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold" 
                  placeholder="Entrez votre mot de passe actuel"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold" 
                  placeholder="Nouveau mot de passe (8+ caractères)"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold" 
                  placeholder="Confirmez le nouveau mot de passe"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl border-2 ${
                message.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                  : 'bg-rose-50 border-rose-100 text-rose-700'
              }`}>
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] pt-6 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
              Mettre à jour le mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};