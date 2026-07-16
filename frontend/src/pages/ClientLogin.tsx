"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  ChevronLeft,
  Sparkles
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function ClientLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/client/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

    if (response.ok) {
    // 1. On nettoie l'ancien storage pour éviter les "undefined"
    localStorage.clear();

    // 2. On enregistre tout proprement (en minuscules pour être cohérent)
    localStorage.setItem('gateone_token', data.access_token);
    localStorage.setItem('client_id', data.client_id); // 
    localStorage.setItem('client_name', data.client_name);
    localStorage.setItem('gateone_role', 'client');

    // 3. Navigation
    navigate('/properties');
    window.location.reload(); 
} else {
        setError(data.detail || "Authentication failed. Access restricted.");
      }
    } catch (err) {
      setError("Intelligence Engine unreachable. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex flex-col lg:flex-row font-sans">
      
      {/* 1. LEFT SIDE: ACCESS RECOGNITION (Midnight Blue) */}
      <div className="lg:w-1/3 bg-[#0B1F33] p-12 lg:p-20 flex flex-col justify-between relative overflow-hidden">
         <div className="relative z-10">
            <button 
               onClick={() => navigate('/')} 
               className="flex items-center gap-2 text-white/50 hover:text-[#5DA9E9] transition-all text-[9px] font-bold uppercase tracking-widest mb-12"
            >
               <ChevronLeft size={14} /> Back to Gateway
            </button>
            <h1 className="text-3xl font-serif font-bold text-white tracking-tighter">
               GateOne <span className="text-[#5DA9E9] italic block text-[10px] uppercase tracking-[0.4em] mt-1 font-sans">Intelligence</span>
            </h1>
         </div>

         <div className="relative z-10 space-y-6">
            <h2 className="text-4xl font-serif font-bold text-white leading-tight">Private Access <br/> Recovery.</h2>
            <p className="text-white/40 text-sm font-serif italic max-w-xs leading-relaxed">
               Secure login for verified members of the Moroccan Luxury Real Estate network.
            </p>
            <div className="h-[1px] w-12 bg-[#5DA9E9]/40" />
         </div>

         <div className="relative z-10 flex flex-col gap-4 text-white/30 text-[8px] uppercase font-bold tracking-[0.3em]">
            <p>Secure Vault Technology</p>
            <p>© {new Date().getFullYear()} Private Portfolio Inc.</p>
         </div>

         {/* Cinematic Blur Background Decor */}
         <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#5DA9E9] blur-[150px] opacity-20 -translate-x-1/2" />
      </div>

      {/* 2. RIGHT SIDE: THE LOGIN PORTAL */}
      <div className="lg:w-2/3 flex items-center justify-center p-8 bg-white">
         <div className="w-full max-w-md">
            <div className="mb-12">
               <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#5DA9E9] mb-6 shadow-sm border border-gray-100">
                  <Lock size={20} />
               </div>
               <h3 className="text-3xl font-serif font-bold text-[#0B1F33] mb-2">Member Portal</h3>
               <p className="text-gray-400 text-sm italic font-serif">Enter your professional keys to unlock AI intelligence reports.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               {error && (
                 <div className="bg-red-50 text-red-600 text-[10px] p-4 rounded-xl border border-red-100 font-bold uppercase tracking-widest flex items-center gap-3">
                    <ShieldCheck size={14} className="shrink-0"/> {error}
                 </div>
               )}

               <div className="space-y-6">
                  {/* EMAIL */}
                  <div className="space-y-2">
                     <label className="text-[9px] uppercase font-bold text-gray-400 tracking-[0.2em] ml-1">Member ID (Email)</label>
                     <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#5DA9E9] transition-all" size={16}/>
                        <input 
                           required 
                           type="email" 
                           placeholder="your@verified-email.com"
                           className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-[#5DA9E9]/5 focus:border-[#5DA9E9] transition-all text-sm"
                           value={formData.email}
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                     </div>
                  </div>

                  {/* PASSWORD */}
<div className="space-y-2 pb-6">
   <div className="flex justify-between items-end ml-1">
      <label className="text-[9px] uppercase font-bold text-gray-400 tracking-[0.2em]">
         Private Security Key
      </label>
      
      {/*  AJOUT DU LIEN FORGOT KEY */}
      <button 
         type="button" 
         onClick={() => navigate('/client/forgot-password')} // Vers la page créée précédemment
         className="text-[8px] uppercase font-bold text-[#C7A987] hover:text-[#5DA9E9] transition-all tracking-widest border-b border-transparent hover:border-[#5DA9E9] pb-0.5"
      >
         Forgot Key?
      </button>
   </div>

   <div className="relative group">
      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#5DA9E9] transition-all" size={16}/>
      <input 
         required 
         type="password" 
         placeholder="••••••••••••"
         className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-[#5DA9E9]/5 focus:border-[#5DA9E9] transition-all text-sm font-mono"
         value={formData.password}
         onChange={(e) => setFormData({...formData, password: e.target.value})}
      />
   </div>
</div>
               </div>

               <button 
                  disabled={loading}
                  className="w-full bg-[#0B1F33] text-white py-5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 shadow-xl hover:bg-[#000] hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
               >
                  {loading ? <Loader2 className="animate-spin" /> : <>Identify & Decrypt Access <ArrowRight size={18} /></>}
               </button>

               <div className="pt-8 border-t border-gray-100 text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest cursor-pointer hover:text-[#5DA9E9] transition-colors" onClick={() => navigate('/investor/signup')}>
                     Not a verified member? Apply for entry
                  </p>
               </div>
            </form>
         </div>
      </div>
    </div>
  );
}