"use client";

import React from 'react';
import { 
  Users, 
  Home, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight, 
  Calendar,
  Clock
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

// Petit composant interne pour les cartes de statistiques
const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">{title}</p>
        <h3 className="text-3xl font-serif font-bold text-[#2D3321]">{value}</h3>
        <p className={`text-[10px] mt-2 flex items-center gap-1 ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
          <ArrowUpRight size={12} /> {change} <span className="text-gray-400 font-normal ml-1">vs mois dernier</span>
        </p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  return (
    <AdminLayout>
      {/* 1. HEADER DE BIENVENUE */}
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2D3321]">Tableau de Bord</h1>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            <Calendar size={14} /> Mardi 7 Avril 2026 — Bienvenue, Bouchra.
          </p>
        </div>
        <button className="bg-[#2D3321] text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all">
          <Sparkles size={18} /> Nouveau Blog IA
        </button>
      </div>

      {/* 2. GRID DE STATISTIQUES (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Biens en Ligne" 
          value="124" 
          change="+12%" 
          icon={Home} 
          color="bg-[#2D3321]" 
        />
        <StatCard 
          title="Leads Qualifiés" 
          value="48" 
          change="+24%" 
          icon={Users} 
          color="bg-[#C7A987]" 
        />
        <StatCard 
          title="Contenus IA Générés" 
          value="1,280" 
          change="+45%" 
          icon={Sparkles} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="Indice du Marché" 
          value="6.8%" 
          change="+0.4%" 
          icon={TrendingUp} 
          color="bg-green-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. SECTION : DERNIERS LEADS (Lien avec ton Lead Scorer) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="font-serif text-xl font-bold">Derniers Prospects Qualifiés</h2>
            <button className="text-[#C7A987] text-xs font-bold hover:underline">Voir tout</button>
          </div>
          <table className="w-full">
            <thead className="bg-[#F9F7F2]/50 text-[10px] uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-6 py-4 text-left">Client</th>
                <th className="px-6 py-4 text-left">Intérêt</th>
                <th className="px-6 py-4 text-center">Score IA</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {/* Exemple de donnée simulée qui vient de ton backend */}
              <tr>
                <td className="px-6 py-4">
                  <p className="font-bold text-[#2D3321]">Yassine Benjelloun</p>
                  <p className="text-[10px] text-gray-400">yassine@example.com</p>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 px-2 py-1 rounded text-[10px]">Villa Palmeraie</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center gap-1 font-bold text-orange-500">
                    🔥 85/100
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[#C7A987] hover:text-[#2D3321] transition-colors">Contacter</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-bold text-[#2D3321]">Amine Khalil</td>
                <td className="px-6 py-4"><span className="bg-gray-100 px-2 py-1 rounded text-[10px]">Riad Médina</span></td>
                <td className="px-6 py-4 text-center text-green-500 font-bold">40/100</td>
                <td className="px-6 py-4 text-right"><button className="text-[#C7A987]">Détails</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4. SECTION : MARKET INTELLIGENCE (Lien avec ton travail Data) */}
        <div className="bg-[#2D3321] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp size={120} />
            </div>
            <h2 className="font-serif text-xl font-bold mb-6 text-[#C7A987]">Market Insights</h2>
            <div className="space-y-6 relative z-10">
                <div className="border-l-2 border-[#C7A987] pl-4">
                    <p className="text-xs opacity-60 uppercase tracking-widest">Prix Moyen au m²</p>
                    <p className="text-2xl font-bold">18,450 MAD</p>
                    <p className="text-[10px] text-green-400">+5% vs Guéliz</p>
                </div>
                <div className="border-l-2 border-white/20 pl-4">
                    <p className="text-xs opacity-60 uppercase tracking-widest">Temps de vente moyen</p>
                    <p className="text-2xl font-bold">42 Jours</p>
                    <p className="text-[10px] opacity-40">Stable</p>
                </div>
                <div className="mt-8">
                    <p className="text-[11px] leading-relaxed italic opacity-70">
                        "L'IA suggère d'augmenter le focus sur les Riads en zone Médina ce mois-ci."
                    </p>
                </div>
            </div>
        </div>

      </div>
    </AdminLayout>
  );
}