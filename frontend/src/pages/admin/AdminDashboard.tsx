"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { leadsApi } from '@/lib/api';
import { 
  Sparkles, Home, Users, TrendingUp, Plus, 
  ChevronRight, ArrowUpRight, Clock, Target 
} from 'lucide-react';



export default function Dashboard() {
  const navigate = useNavigate();
  const [agentName, setAgentName] = useState("Agent");
  const [stats, setStats] = useState({
    online_listings: 0,
    qualified_leads: 0,
    ai_content_count: 0,
    market_index: "6.8%"
  });

  
  const [hotLeads, setHotLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  useEffect(() => {
  const storedName = localStorage.getItem('agent_name');
  if (storedName) {
    setAgentName(storedName);
  }

  // Charger les statistiques
  fetch('${API_BASE_URL}/api/dashboard/stats')
    .then(res => res.json())
    .then(data => setStats(data))
    .catch(err => console.error("Stats fetch error:", err));

  // Charger les prospects qualifiés
  leadsApi.getAllLeads()
    .then((allLeads: any[]) => {
      const qualified = allLeads
        .filter(lead => lead.current_status === "qualified")
        .slice(0, 5); // Afficher uniquement les 5 premiers

      setHotLeads(qualified);
    })
    .catch(err => {
      console.error("Leads fetch error:", err);
      setHotLeads([]);
    })
    .finally(() => {
      setLoadingLeads(false);
    });

}, []);

  return (
    <AdminLayout>
      <header className="mb-10 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#2D3321] tracking-tight">Executive Dashboard</h1>
          <p className="text-gray-500 mt-2 italic flex items-center gap-2">
            Welcome back, <span className="text-[#C7A987] font-semibold">{agentName}</span>. 
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse ml-2"></span>
            System Core: Active
          </p>
        </div>
        
        <button
          onClick={() => navigate('/admin/blogs')}
          className="bg-[#2D3321] text-white px-8 py-4 rounded-[1.4rem] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95"
        >
           <Plus size={16} /> New Intelligence Briefing
        </button>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <StatCard title="Inventory Assets" value={stats.online_listings} icon={Home} trend="+12%" />
        <StatCard title="Qualified Leads" value={stats.qualified_leads} icon={Target} trend="+24%" color="bg-[#F9F7F2]" />
        <StatCard title="AI Strategy Output" value={stats.ai_content_count} icon={Sparkles} trend="+45%" />
        <StatCard title="Market Velocity" value={stats.market_index} icon={TrendingUp} trend="+0.4%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LATEST QUALIFIED LEADS (Logique IA) */}
<div className="lg:col-span-8 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
  <div className="flex justify-between items-center mb-8">
    <h3 className="text-2xl font-serif font-bold text-[#2D3321]">Priority Prospects</h3>
    <button 
  onClick={() => navigate('/admin/leads')}
  className="text-[10px] font-bold uppercase tracking-widest text-[#C7A987] hover:underline flex items-center gap-2"
>
  View Analytics Hub <ChevronRight size={14} />
</button>
  </div>

  <div className="space-y-4">
    {loadingLeads ? (
      <p className="text-center text-gray-400 italic py-10">Loading priority prospects...</p>
    ) : hotLeads.length === 0 ? (
      <p className="text-center text-gray-400 italic py-10">No qualified leads yet.</p>
    ) : (
      hotLeads.map((lead) => (
        <div key={lead.id} className="flex items-center justify-between p-6 rounded-2xl bg-[#F9F7F2]/50 border border-transparent hover:border-[#C7A987]/20 hover:bg-white transition-all group">
          <div className="flex items-center gap-6">
            {/* Avatar avec correction si le nom n'a qu'un mot */}
            <div className="w-14 h-14 bg-[#2D3321] rounded-full flex items-center justify-center text-[#C7A987] font-bold text-lg shadow-inner">
              {lead.full_name ? lead.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '??'}
            </div>
            <div>
              <p className="font-bold text-[#2D3321] text-lg">{lead.full_name}</p>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">
                 Target: <span className="text-[#C7A987]">{lead.interest}</span>
              </p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-2">
            <div className={`text-[10px] font-bold px-3 py-1.5 rounded-lg inline-block whitespace-nowrap ${lead.ai_score > 80 ? 'bg-green-100 text-green-700' : 'bg-[#C7A987]/10 text-[#C7A987]'}`}>
              AI Score: {lead.ai_score}
            </div>
            <p className="text-[10px] text-gray-400 flex items-center gap-1.5">
              <Clock size={12} className="opacity-40"/> {lead.last_action_time || "Just now"}
            </p>
          </div>
        </div>
      ))
    )}
  </div>
</div>

{/* Si vous voulez remettre le panneau latéral à droite, ajoutez-le ici dans une div className="lg:col-span-4" */}

        

      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon: Icon, trend, color = "bg-white" }: any) {
  return (
    <div className={`${color} p-10 rounded-[2.8rem] border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1`}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-3.5 bg-[#2D3321] text-[#C7A987] rounded-[1.2rem] shadow-lg shadow-[#2D3321]/10">
          <Icon size={24} />
        </div>
        <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-100">{trend}</span>
      </div>
      <div className="text-4xl font-serif font-bold text-[#2D3321] mb-2">{value}</div>
      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em]">{title}</p>
    </div>
  );
}