import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Pour la navigation
import { 
  LayoutDashboard, 
  Home, 
  Sparkles, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Vue d\'ensemble', path: '/admin' },
  { icon: Home, label: 'Propriétés', path: '/admin/properties' },
  { icon: Sparkles, label: 'AI Content Studio', path: '/admin/studio' },
  { icon: Users, label: 'Intelligence Leads', path: '/admin/leads' },
  { icon: Settings, label: 'Paramètres', path: '/admin/settings' },
];

export default function Sidebar() {
  const location = useLocation(); // Récupère l'URL actuelle pour savoir quel bouton surligner

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#2D3321] text-[#F9F7F2] flex flex-col shadow-2xl z-50">
      
      {/* 1. LOGO / BRANDING */}
      <div className="p-8">
        <h1 className="text-2xl font-serif font-bold tracking-tighter border-b border-white/10 pb-4">
          GateOne <span className="text-[#C7A987] block text-xs uppercase tracking-[0.3em] mt-1 italic">Intelligence</span>
        </h1>
      </div>

      {/* 2. NAVIGATION LINKS */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'bg-[#C7A987] text-[#2D3321] shadow-lg shadow-black/20' 
                  : 'hover:bg-white/5 opacity-70 hover:opacity-100'}
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className={isActive ? 'text-[#2D3321]' : 'text-[#C7A987]'} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* 3. FOOTER / DECONNEXION */}
      <div className="p-4 border-t border-white/10">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium">
          <LogOut size={20} />
          Déconnexion
        </button>
        <div className="mt-4 px-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Orchid Island Real Estate</p>
        </div>
      </div>
    </aside>
  );
}