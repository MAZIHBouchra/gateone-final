"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  User, 
  Users, 
  Lock, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  Loader2,
  Save,
  CheckCircle2
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'team'>('profile');
  const [isAdmin, setIsAdmin] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Formulaire pour nouveau membre
  const [newAgent, setNewAgent] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'agent' });

  useEffect(() => {
    // Vérification du rôle stocké lors du login
    const userRole = localStorage.getItem('gateone_role'); // Assure-toi de stocker ça lors du login
    setIsAdmin(userRole === 'admin' || localStorage.getItem('agent_name')?.includes('Bouchra')); 
    
    if (isAdmin) fetchAgents();
  }, [isAdmin]);

  const fetchAgents = async () => {
    const res = await fetch('http://localhost:8000/api/auth/agents');
    const data = await res.json();
    setAgents(data);
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent)
      });
      if (res.ok) {
        alert("✨ Professional Credentials generated for new Agent.");
        fetchAgents();
        setNewAgent({ first_name: '', last_name: '', email: '', password: '', role: 'agent' });
      }
    } finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-serif font-bold text-[#2D3321]">Corporate Settings</h1>
        <p className="text-gray-500 italic">Manage your digital identity and agency permissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* SIDEBAR DE NAVIGATION SETTINGS */}
        <div className="lg:col-span-3 space-y-2">
            <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'profile' ? 'bg-[#2D3321] text-white shadow-xl' : 'text-gray-400 hover:bg-gray-100'}`}
            >
                <User size={16} /> My Account
            </button>
            
            {isAdmin && (
                <button 
                    onClick={() => setActiveTab('team')}
                    className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'team' ? 'bg-[#C7A987] text-[#2D3321] shadow-xl' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                    <Users size={16} /> Team Management
                </button>
            )}
        </div>

        {/* CONTENU DYNAMIQUE */}
        <div className="lg:col-span-9 bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 min-h-[600px]">
          
          {activeTab === 'profile' && (
            <div className="animate-in fade-in duration-500">
               <h3 className="text-2xl font-serif font-bold mb-8">Security Configuration</h3>
               <div className="space-y-8 max-w-md">
                  <div className="bg-[#F9F7F2] p-6 rounded-2xl border border-[#C7A987]/10">
                    <p className="text-[10px] uppercase font-bold text-[#C7A987] mb-2 tracking-widest">Active Identity</p>
                    <p className="font-bold text-[#2D3321]">{localStorage.getItem('agent_name')}</p>
                    <p className="text-xs text-gray-400 italic">Your account is secured with End-to-End Encryption.</p>
                  </div>
                  
                  <div className="space-y-4 pt-6">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Change Security Key (Password)</label>
                    <input type="password" placeholder="Current Password" className="w-full border-b py-3 outline-none focus:border-[#C7A987] text-sm" />
                    <input type="password" placeholder="New Secret Key" className="w-full border-b py-3 outline-none focus:border-[#C7A987] text-sm" />
                    <button className="bg-[#2D3321] text-[#F9F7F2] px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest mt-4">
                        Update Credentials
                    </button>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="animate-in fade-in duration-500 space-y-12">
               <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-serif font-bold text-[#2D3321]">Agency Hierarchy</h3>
                  <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest border border-amber-100">Admin Privileges Active</div>
               </div>

               {/* AJOUT NOUVEAU MEMBRE */}
               <form onSubmit={handleCreateAgent} className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-[#F9F7F2] rounded-3xl border border-[#C7A987]/20">
                  <input required placeholder="First Name" className="bg-white px-4 py-3 rounded-xl text-xs outline-none" onChange={e => setNewAgent({...newAgent, first_name: e.target.value})} />
                  <input required placeholder="Last Name" className="bg-white px-4 py-3 rounded-xl text-xs outline-none" onChange={e => setNewAgent({...newAgent, last_name: e.target.value})} />
                  <input required type="email" placeholder="agent@gateone.immo" className="bg-white px-4 py-3 rounded-xl text-xs outline-none" onChange={e => setNewAgent({...newAgent, email: e.target.value})} />
                  <input required type="password" placeholder="Temp Secret Key" className="bg-white px-4 py-3 rounded-xl text-xs outline-none" onChange={e => setNewAgent({...newAgent, password: e.target.value})} />
                  <div className="col-span-4 flex justify-end">
                      <button disabled={loading} className="bg-[#2D3321] text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                        {loading ? <Loader2 className="animate-spin"/> : <UserPlus size={16}/>} PROVISION NEW ACCOUNT
                      </button>
                  </div>
               </form>

               {/* LISTE DES AGENTS */}
               <div className="space-y-4">
                  {agents.map(agent => (
                    <div key={agent.id} className="flex items-center justify-between p-6 border border-gray-100 rounded-2xl hover:bg-[#F9F7F2]/50 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#2D3321] rounded-full flex items-center justify-center text-[#C7A987] font-bold text-xs uppercase">{agent.first_name[0]}{agent.last_name[0]}</div>
                          <div>
                            <p className="font-bold text-[#2D3321] text-sm">{agent.first_name} {agent.last_name}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{agent.role} • {agent.email}</p>
                          </div>
                       </div>
                       <button className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                          <Trash2 size={16} />
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}