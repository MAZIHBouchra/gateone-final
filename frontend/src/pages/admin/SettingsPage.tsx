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
  const [passData, setPassData] = useState({ current: '', next: '' });
  const [updating, setUpdating] = useState(false);
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  // Formulaire pour nouveau membre
  const [newAgent, setNewAgent] = useState({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    password: '', 
    role: 'agent' // Par défaut
  });

  useEffect(() => {
    // Vérification du rôle stocké lors du login
    const userRole = localStorage.getItem('gateone_role'); // Assure-toi de stocker ça lors du login
    setIsAdmin(userRole === 'admin' || localStorage.getItem('agent_name')?.includes('Bouchra')); 
    
    if (isAdmin) fetchAgents();
  }, [isAdmin]);

  const fetchAgents = async () => {
    const res = await fetch('${API_BASE_URL}/api/auth/agents');
    const data = await res.json();
    setAgents(data);
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent)
      });
      if (res.ok) {
        alert("Professional Credentials generated for new Agent.");
        fetchAgents();
        setNewAgent({ first_name: '', last_name: '', email: '', password: '', role: 'agent' });
      }
    } finally { setLoading(false); }
  };
  
  const handleDeleteAgent = async (agentId: number, agentName: string) => {
    // 1. Demande de confirmation professionnelle
    if (window.confirm(`Security Protocol: Are you sure you want to revoke access for ${agentName}? This action is permanent.`)) {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/agents/${agentId}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('gateone_token')}`
                }
            });

            if (res.ok) {
                // 2. Mise à jour de la liste locale instantanément
                setAgents(prev => prev.filter(a => a.id !== agentId));
                alert("🔒 Access revoked successfully.");
            } else {
                const err = await res.json();
                alert(err.detail);
            }
        } catch (error) {
            alert("Connection error with the Security Gateway.");
        }
    }
};
  
  const handlePasswordUpdate = async () => {
    if(!passData.current || !passData.next) return;
    setUpdating(true);
    
    try {
        const res = await fetch(`${API_BASE_URL}/auth/profile/password`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('gateone_token')}`
            },
            body: JSON.stringify({
                current_password: passData.current,
                new_password: passData.next
            })
        });

        if (res.ok) {
            alert("Identity secured! Your new security key is active.");
            setPassData({ current: '', next: '' }); // Reset
        } else {
            const err = await res.json();
            alert(err.detail);
        }
    } finally { setUpdating(false); }
  };
  
  const handleResetPassword = async (agentId: number, agentEmail: string) => {
  const newPass = prompt(`Enter a temporary Security Key for ${agentEmail}:`);
  
  if (newPass && newPass.length >= 6) {
    try {
       const res = await fetch(`${API_BASE_URL}/auth/agents/${agentId}/reset-password`, {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${localStorage.getItem('gateone_token')}`
         },
         body: JSON.stringify({ new_password: newPass })
       });
       
       if (res.ok) alert(`Password for ${agentEmail} has been updated.`);
    } catch (err) { alert("Security sync failed."); }
  }
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
					<input 
                      type="password" 
                      placeholder="Current Password" 
                      className="w-full border-b py-3 outline-none focus:border-[#C7A987] text-sm" 
                      value={passData.current}
                      onChange={e => setPassData({...passData, current: e.target.value})}
                    />
                    <input 
                      type="password" 
                      placeholder="New Secret Key" 
                      className="w-full border-b py-3 outline-none focus:border-[#C7A987] text-sm" 
                      value={passData.next}
                      onChange={e => setPassData({...passData, next: e.target.value})}
                    />
					<button 
                      onClick={handlePasswordUpdate}
                      disabled={updating}
                      className="bg-[#2D3321] text-[#F9F7F2] px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest mt-4"
					  >
                      {updating ? <Loader2 className="animate-spin" /> : "Update Credentials"}
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
               {/* --- NOUVEAU BLOC : AGENCY HIERARCHY FORM --- */}
<div className="bg-[#F9F7F2] rounded-[2.5rem] p-10 border border-[#C7A987]/20 relative overflow-hidden group">
  {/* Décoration d'arrière-plan discrète */}
  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C7A987]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

  <div className="flex justify-between items-center mb-10">
    <div>
      <h3 className="text-2xl font-serif font-bold text-[#2D3321]">Provision Associate</h3>
      <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Onboarding system for verified agents</p>
    </div>
    <div className="bg-white/50 border border-white p-2 rounded-xl text-gray-400">
      <UserPlus size={20} />
    </div>
  </div>

  <form onSubmit={handleCreateAgent} className="space-y-6 relative z-10">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Colonne 1 : Identité */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
             <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest ml-1">First Name</label>
             <input required value={newAgent.first_name} className="w-full bg-white px-5 py-3 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-[#C7A987]/20 border border-transparent focus:border-[#C7A987] transition-all" 
             onChange={e => setNewAgent({...newAgent, first_name: e.target.value})} />
          </div>
          <div className="space-y-1">
             <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest ml-1">Last Name</label>
             <input required value={newAgent.last_name} className="w-full bg-white px-5 py-3 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-[#C7A987]/20 border border-transparent focus:border-[#C7A987] transition-all" 
             onChange={e => setNewAgent({...newAgent, last_name: e.target.value})} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest ml-1">Professional Email</label>
          <input required type="email" value={newAgent.email} className="w-full bg-white px-5 py-3 rounded-2xl text-xs outline-none border border-transparent focus:border-[#C7A987] transition-all" 
          placeholder="e.g. agent@gateone.immo" onChange={e => setNewAgent({...newAgent, email: e.target.value})} />
        </div>
      </div>

      {/* Colonne 2 : Accès */}
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest ml-1">System Permissions</label>
          <select 
            className="w-full bg-white px-5 py-3 rounded-2xl text-xs outline-none border border-transparent focus:border-[#C7A987] transition-all appearance-none cursor-pointer text-[#2D3321] font-bold"
            value={newAgent.role}
            onChange={e => setNewAgent({...newAgent, role: e.target.value})}
          >
            <option value="agent">Associate Agent (Limited Access)</option>
            <option value="admin">Platform Administrator (Full Access)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest ml-1">Initial Security Key</label>
          <input required type="password" value={newAgent.password} className="w-full bg-white px-5 py-3 rounded-2xl text-xs outline-none border border-transparent focus:border-[#C7A987] transition-all font-mono" 
          placeholder="••••••••••••" onChange={e => setNewAgent({...newAgent, password: e.target.value})} />
        </div>
      </div>
    </div>

    <div className="pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#C7A987]">
            <div className="w-1.5 h-1.5 bg-[#C7A987] rounded-full animate-pulse"></div>
            <span className="text-[8px] uppercase font-bold tracking-[0.3em]">Encryption logic: Active</span>
        </div>
        <button 
          disabled={loading}
          className="bg-[#2D3321] text-[#F9F7F2] px-10 py-5 rounded-[1.8rem] font-bold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} className="text-[#C7A987]" />}
          Deploy Professional Access
        </button>
    </div>
  </form>
</div>
			   

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
                       <button 
                         onClick={() => handleDeleteAgent(agent.id, agent.first_name)}
                         className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                         >
                         <Trash2 size={16} />
                       </button>
					   <button 
                        onClick={() => handleResetPassword(agent.id, agent.email)}
                        className="p-3 text-gray-400 hover:text-[#C7A987] hover:bg-[#F9F7F2] rounded-xl transition-all"
                        title="Reset Security Key"
                        >
                        <Lock size={16} />
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