"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function ClientForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: New Password
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleReset = async () => {
  try {
    setLoading(true);

    const response = await fetch(
      '${API_BASE_URL}/api/auth/client/reset-password',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          new_password: newPassword
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
      setStep(3);
    } else {
      alert(data.detail || "Unable to process request.");
    }

  } catch (error) {
    console.error(error);
    alert("Server error");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#0B1F33] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[420px]">
        {/* LOGO */}
        <div className="text-center mb-10">
           <h1 className="text-2xl font-serif font-bold text-white tracking-tighter">
            GateOne <span className="text-[#5DA9E9] italic block text-[9px] uppercase tracking-[0.4em] mt-1">Intelligence</span>
           </h1>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl">
          <button onClick={() => navigate('/client/login')} className="flex items-center gap-2 text-[9px] uppercase font-bold text-[#5DA9E9] mb-8 hover:opacity-60 transition-all">
             <ArrowLeft size={14} /> Back to Entry
          </button>

          {step === 1 && (
            <div className="animate-in fade-in zoom-in duration-500">
               <h2 className="text-3xl font-serif font-bold text-white mb-4">Security <br/> Recovery</h2>
               <p className="text-white/40 text-xs leading-relaxed mb-10">Enter your professional email to begin the identity verification process.</p>
               <input 
                  type="email" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-[#5DA9E9] transition-all" 
                  placeholder="contact@email.com"
                  onChange={(e) => setEmail(e.target.value)}
               />
               <button onClick={() => setStep(2)} className="w-full mt-6 bg-[#5DA9E9] text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Verify Email</button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
               <h2 className="text-3xl font-serif font-bold text-white mb-4">Reset <br/> Security Key</h2>
               <p className="text-white/40 text-xs mb-10 italic">Your previous session was invalid. Define your new private key.</p>
               <div className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16}/>
                    <input 
                       type="password" 
                       className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-[#5DA9E9]" 
                       placeholder="Enter new password"
                       onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <button onClick={handleReset} disabled={loading} className="w-full bg-white text-[#0B1F33] py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#5DA9E9] hover:text-white transition-all">
                     {loading ? <Loader2 className="animate-spin" /> : "Save New Credentials"}
                  </button>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center animate-in fade-in zoom-in duration-700">
               <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                  <CheckCircle2 size={40} />
               </div>
               <h3 className="text-2xl font-serif font-bold text-white mb-4">Access Restored</h3>
               <p className="text-white/40 text-sm mb-10 italic">Your investor credentials have been securely updated. You can now access your ROI analyses.</p>
               <button onClick={() => navigate('/client/login')} className="bg-white/5 border border-white/20 text-white px-8 py-3 rounded-full text-[9px] uppercase font-bold tracking-[0.2em] hover:bg-white hover:text-[#0B1F33] transition-all">Return to Dashboard</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}