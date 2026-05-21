"use client";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importe le hook de navigation
import AdminLayout from '../../components/admin/AdminLayout';
import { Sparkles, Home, Users, FileText, TrendingUp, Plus } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate(); // 2. Initialise le navigateur

  const [stats, setStats] = useState({
    online_listings: 0,
    qualified_leads: 0,
    ai_content_count: 0,
    market_index: "6.8%"
  });

  useEffect(() => {
    // Fetch stats from the new API endpoint
    fetch('http://localhost:8000/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data))
	  .catch(err => console.log("Stats fetch error:", err));
  }, []);

  return (
    <AdminLayout>
      <header className="mb-10 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2D3321]">Executive Dashboard</h1>
          <p className="text-gray-500 mt-1 italic">Welcome back, Bouchra. AI Infrastructure is active.</p>
        </div>
        <button
		onClick={() => navigate('/admin/blogs')}
		className="bg-[#000] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl">
           <Plus size={16} /> New AI Blog Post
        </button>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Online Listings" value={stats.online_listings} icon={Home} trend="+12%" />
        <StatCard title="Qualified Leads" value={stats.qualified_leads} icon={Users} trend="+24%" color="bg-orange-50" />
        <StatCard title="AI Content Generated" value={stats.ai_content_count} icon={Sparkles} trend="+45%" color="bg-blue-50" />
        <StatCard title="Market Index" value={stats.market_index} icon={TrendingUp} trend="+0.4%" color="bg-green-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Ici vous pouvez mettre vos listes de leads ou graphiques */}
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon: Icon, trend, color = "bg-white" }: any) {
  return (
    <div className={`${color} p-8 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.1em]">{title}</span>
        <div className="p-3 bg-[#2D3321] text-[#C7A987] rounded-2xl">
          <Icon size={20} />
        </div>
      </div>
      <div className="text-4xl font-serif font-bold text-[#2D3321] mb-2">{value}</div>
      <div className="text-[10px] font-bold text-green-600">{trend} <span className="text-gray-400 font-normal ml-1">vs last month</span></div>
    </div>
  );
}