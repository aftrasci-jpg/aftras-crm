
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import Logo from './Logo';
import { 
  Users, 
  ShoppingCart, 
  Wallet, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  Link as LinkIcon
} from 'lucide-react';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return <>{children}</>;

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard, roles: ['ADMIN', 'AGENT'] },
    { id: 'clients', label: 'Clients', icon: Users, roles: ['ADMIN', 'AGENT'] },
    { id: 'remote', label: 'Prospect Distant', icon: LinkIcon, roles: ['AGENT'] },
    { id: 'sales', label: 'Ventes', icon: ShoppingCart, roles: ['ADMIN'] },
    { id: 'commissions', label: 'Commissions', icon: Wallet, roles: ['ADMIN', 'AGENT'] },
    { id: 'users', label: 'Utilisateurs', icon: ShieldCheck, roles: ['ADMIN'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles && item.roles.includes(user.role as any));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <Logo className="w-8 h-8" />
          <h1 className="text-xl font-bold text-indigo-600 tracking-tighter">Aftras CRM</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors active:scale-90"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 transition duration-300 ease-in-out
        w-72 bg-white border-r z-40 flex flex-col shadow-2xl md:shadow-none
      `}>
        <div className="p-8 hidden md:block">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="transition-transform duration-500 group-hover:scale-110">
              <Logo className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">Aftras CRM</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {filteredMenu.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group
                  animate-in slide-in-from-left-4 fade-in fill-mode-both
                  ${activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                    : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`
                    transition-transform duration-300 
                    ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-125 group-hover:rotate-6'}
                  `}>
                    <Icon size={22} />
                  </div>
                  <span className={`font-bold text-sm tracking-tight transition-transform duration-300 ${activeTab === item.id ? 'translate-x-0' : 'group-hover:translate-x-1'}`}>
                    {item.label}
                  </span>
                </div>
                
                {activeTab === item.id && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                )}
                {activeTab !== item.id && (
                  <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    <ChevronRight size={14} />
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-6 border-t bg-slate-50/50">
          <div className="flex items-center space-x-4 px-4 py-4 mb-4 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-105 transition-transform">
                {user.photoURL ? <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-2xl object-cover" /> : user.name?.charAt(0) || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-black text-slate-800 truncate leading-none group-hover:text-indigo-600 transition-colors">{user.name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1.5">{user.role}</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-3 px-4 py-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest group active:scale-95"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="p-6 md:p-12 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
