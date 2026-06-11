"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simulation de l'appel API (à connecter avec ta route /api/auth/login plus tard)
const response = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
});

const data = await response.json();
console.log("Check data from Server:", data); // <--- LOG À VÉRIFIER DANS F12

if (response.ok) {
    localStorage.setItem('gateone_token', data.access_token);
    localStorage.setItem('agent_name', data.agent.full_name);
    
    // 🔥 CORRECTION ICI : Assurez-vous d'utiliser data.agent.role
    // tel que défini dans le JSON envoyé par Python
    localStorage.setItem('gateone_role', data.agent.role); 
    
    navigate('/admin');
} else {
        setError(data.detail || "Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      setError("Server is unreachable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-6 font-sans">
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#C7A987] rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#2D3321] rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-[450px] relative z-10">
        {/* LOGO SECTION */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-[#2D3321] tracking-tighter mb-2">
            GateOne <span className="text-[#C7A987] italic block text-sm uppercase tracking-[0.4em] mt-1">Intelligence</span>
          </h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest font-medium">Enterprise Management Portal</p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#2D3321]/10 border border-white p-10 backdrop-blur-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-[#2D3321]">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Please sign in to access the AI Marketing Suite.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* EMAIL FIELD */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Professional Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#C7A987] transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  required
                  type="email"
                  placeholder="name@gateone.immo"
                  className="w-full pl-12 pr-6 py-4 bg-[#F9F7F2]/50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#C7A987] focus:ring-4 focus:ring-[#C7A987]/5 transition-all text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            {/* PASSWORD FIELD */}
<div className="space-y-2">
  <div className="flex justify-between items-center ml-1">
    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Security Key</label>
    
    {/* LIEN DE RÉCUPÉRATION SUBTIL */}
    <button 
      type="button"
      onClick={() => alert("Identity Security Policy: Please contact your System Administrator to receive a temporary recovery key.")}
      className="text-[9px] uppercase font-bold text-[#C7A987]/60 hover:text-[#C7A987] transition-all tracking-tighter"
    >
      Forgot Key?
    </button>
  </div>
  
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#C7A987] transition-colors">
      <Lock size={18} />
    </div>
    <input 
      required
      type={showPassword ? "text" : "password"}
      placeholder="••••••••••••"
      className="w-full pl-12 pr-12 py-4 bg-[#F9F7F2]/50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#C7A987] focus:ring-4 focus:ring-[#C7A987]/5 transition-all text-sm"
      value={formData.password}
      onChange={(e) => setFormData({...formData, password: e.target.value})}
    />
    <button 
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#2D3321] transition-colors"
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
</div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-4 rounded-xl border border-red-100 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                <ShieldCheck size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-[#2D3321] hover:bg-black text-[#F9F7F2] py-5 rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-[#2D3321]/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Enter Studio <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* FOOTER */}
        <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck size={12} className="text-[#C7A987]" /> Encrypted End-to-End Environment
            </p>
        </div>
      </div>
    </div>
  );
}