"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
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

  // Simulation de données pour les leads chauds (en attendant l'API Leads)
  const hotLeads = [
    { name: "Jean-Pierre Dupont", interest: "Villa Palmeraie", score: 85, time: "2 mins ago" },
    { name: "Sarah Benani", interest: "Riad Médina", score: 92, time: "1 hour ago" },
    { name: "Mark Thompson", interest: "Penthouse Burj", score: 78, time: "3 hours ago" },
  ];

  useEffect(() => {
    const storedName = localStorage.getItem('agent_name');
    if (storedName) setAgentName(storedName);

    fetch('http://localhost:8000/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Stats fetch error:", err));
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
        <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-serif font-bold text-[#2D3321]">Priority Prospects</h3>
              <button onClick={() => navigate('/admin/leads')} className="text-[10px] font-bold uppercase tracking-widest text-[#C7A987] hover:underline flex items-center gap-2">
                 View Analytics Hub <ChevronRight size={14} />
              </button>
           </div>
           
           <div className="space-y-4">
              {hotLeads.map((lead, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-[#F9F7F2]/50 border border-transparent hover:border-[#C7A987]/20 hover:bg-white transition-all group">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-[#2D3321] rounded-full flex items-center justify-center text-[#C7A987] font-bold">
                         {lead.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                         <p className="font-bold text-[#2D3321]">{lead.name}</p>
                         <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Target: {lead.interest}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                         <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${lead.score > 80 ? 'bg-green-100 text-green-700' : 'bg-[#C7A987]/10 text-[#C7A987]'}`}>
                           AI Score: {lead.score}
                         </div>
                      </div>
                      <p className="text-[9px] text-gray-300 flex items-center justify-end gap-1"><Clock size={10}/> {lead.time}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* MARKET INSIGHTS SIDE PANEL */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-[#2D3321] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Sparkles size={120} /></div>
              <div className="relative z-10">
                <h4 className="text-[9px] font-bold uppercase text-[#C7A987] tracking-[0.4em] mb-4">Strategic Outlook</h4>
                <h3 className="text-3xl font-serif mb-6 leading-tight">Marrakech Investment Confidence</h3>
                <div className="space-y-6 text-sm opacity-60 italic font-serif leading-relaxed">
                  "AI modeling suggests a high absorption rate in the Palmeraie region this month. Our current SEO dominance is 24% higher than last quarter."
                </div>
              </div>
              <button className="mt-10 bg-[#C7A987] text-[#2D3321] w-full py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20">
                 Market Intelligence Report <ArrowUpRight size={14} />
              </button>
           </div>
        </div>

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