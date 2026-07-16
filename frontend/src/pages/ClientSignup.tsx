"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  Mail, 
  Lock, 
  User, 
  Globe,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function ClientSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    budget_tier: 'STANDARD' // VIP, PREMIUM, STANDARD, ENTRY
  });

  const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setLoading(true);

   try {
    const response = await fetch(`${API_BASE_URL}/auth/client/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const data = await response.json();   // ← LIGNE MANQUANTE, ajoutée ici

      localStorage.setItem('client_token', data.access_token);
      localStorage.setItem('client_id', data.lead_id);
      localStorage.setItem('client_name', data.full_name || formData.full_name);
      window.dispatchEvent(new Event('storage'));

      navigate('/properties');   // connexion directe, pas besoin de repasser par /login
    } else {
      alert("Registration failed. Please contact our support.");
    }
   } catch (err) {
    alert("Registration failed. Please contact our support.");
   } finally {
    setLoading(false);
   }
 };

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex flex-col lg:flex-row font-sans">
      
      {/* 1. LEFT SIDE: THE VALUE PROPOSITION (Lux-Tech Visual) */}
      <div className="lg:w-1/2 bg-[#0B1F33] p-12 lg:p-24 flex flex-col justify-between relative overflow-hidden">
         {/* Decoration */}
         <div className="absolute top-0 right-0 p-20 opacity-10"><TrendingUp size={300} className="text-[#5DA9E9]" /></div>
         
         <div className="relative z-10">
            <h1 className="text-3xl font-serif font-bold text-white tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
               GateOne <span className="text-[#5DA9E9] italic block text-[10px] uppercase tracking-[0.4em] mt-1 font-sans">Intelligence</span>
            </h1>
         </div>

         <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                <ShieldCheck size={14} className="text-[#5DA9E9]" />
                <span className="text-[9px] uppercase font-bold tracking-widest text-white/80">Private Network Access</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-serif font-bold text-white leading-tight">Join the Elite <br/> Investor Circle.</h2>
            <p className="text-white/60 text-lg font-serif italic max-w-md">
               Access off-market listings, deep-dive AI ROI reports, and exclusive technical blueprints.
            </p>
         </div>

         <div className="relative z-10 flex gap-12 text-white/40 uppercase font-bold text-[8px] tracking-[0.3em]">
            <span className="flex items-center gap-2"><CheckCircle2 size={12}/> VNA Verification</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={12}/> Yield Prediction</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={12}/> Private Briefings</span>
         </div>
      </div>

      {/* 2. RIGHT SIDE: THE STRATEGIC SIGNUP FORM */}
      <div className="lg:w-1/2 p-8 lg:p-24 flex items-center justify-center">
         <div className="w-full max-w-md">
            <div className="mb-12">
               <h3 className="text-3xl font-serif font-bold text-[#0B1F33] mb-4">Initialize Profile</h3>
               <p className="text-gray-400 text-sm leading-relaxed italic font-serif">By creating a profile, our Intelligence engine starts aligning premium assets with your investment behavior.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid grid-cols-1 gap-6">
                  {/* FULL NAME */}
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1 text-sky-700">Investor Identity</label>
                     <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#5DA9E9] transition-all" size={16}/>
                        <input 
                           required 
                           type="text" 
                           placeholder="Enter full legal name"
                           className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#5DA9E9]/5 focus:border-[#5DA9E9] transition-all text-sm"
                           onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        />
                     </div>
                  </div>

                  {/* EMAIL */}
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1 text-sky-700">Professional Email</label>
                     <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#5DA9E9] transition-all" size={16}/>
                        <input 
                           required 
                           type="email" 
                           placeholder="contact@company.com"
                           className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#5DA9E9]/5 focus:border-[#5DA9E9] transition-all text-sm"
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                     </div>
                  </div>

                  {/* INVESTMENT TIER (CRUCIAL POUR LE SCORE) */}
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1 text-sky-700">Financial Capability (MAD)</label>
                     <div className="relative">
                        <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C7A987]" size={16}/>
                        <select 
                           className="w-full pl-12 pr-6 py-4 bg-[#0B1F33] text-white border-none rounded-2xl outline-none cursor-pointer text-sm font-bold appearance-none shadow-xl"
                           onChange={(e) => setFormData({...formData, budget_tier: e.target.value})}
                        >
                           <option value="STANDARD">1M - 5M MAD Portfolio</option>
                           <option value="PREMIUM">5M - 10M MAD Portfolio</option>
                           <option value="VIP">+10M MAD Elite Investor</option>
                           <option value="ENTRY">&lt; 1M MAD Entry Selection</option>
                        </select>
                     </div>
                     <p className="text-[9px] text-gray-400 mt-2 italic px-1">
                        This tier influences your Investor Qualification Score within our AI matching engine.
                     </p>
                  </div>

                  {/* PASSWORD */}
                  <div className="space-y-2 pb-6">
                     <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1 text-sky-700">Private Password</label>
                     <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#5DA9E9] transition-all" size={16}/>
                        <input 
                           required 
                           type="password" 
                           placeholder="••••••••••••"
                           className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#5DA9E9] transition-all text-sm"
                           onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                     </div>
                  </div>
               </div>

               <button 
                  disabled={loading}
                  className="w-full bg-[#5DA9E9] text-white py-5 rounded-[2rem] font-bold text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50"
               >
                  {loading ? <Loader2 className="animate-spin" /> : <>Request Credentials <ArrowRight size={18} /></>}
               </button>

               <div className="pt-10 border-t border-gray-100 flex justify-between items-center text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  <span>Authorized Users only</span>
                  <span className="text-[#C7A987] hover:underline cursor-pointer" onClick={() => navigate('/client/login')}>Already Member? Login</span>
               </div>
            </form>
         </div>
      </div>
    </div>
  );
}