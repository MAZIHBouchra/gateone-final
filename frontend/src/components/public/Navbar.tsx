"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '@/components/public/Navbar';
import { propertiesApi } from '@/lib/api';
import { 
  Sparkles, TrendingUp, ShieldCheck, 
  Map, ArrowUpRight, Search, Zap, 
  Compass, ExternalLink 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<any[]>([]);
  const [stats, setStats] = useState({ online_listings: 0, qualified_leads: 0 });

  useEffect(() => {
    // 1. Fetch Dynamic Data for Hero Stats & Showcase
    propertiesApi.getAll().then(data => setFeatured(data.slice(0, 3)));
    fetch('http://localhost:8000/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCF9] font-sans selection:bg-[#5DA9E9] selection:text-white">
      <Navbar />

      {/* --- SECTION 1 : HERO - THE COGNITIVE ENTRANCE --- */}
      <header className="relative h-[110vh] w-full flex items-center justify-center overflow-hidden">
        {/* Background Visual with Overlays */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6199f7c096?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover scale-110" 
            alt="Estate Vision"
          />
          <div className="absolute inset-0 bg-[#0B1F33]/70 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B1F33]/20 to-[#FDFCF9]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md px-6 py-2.5 rounded-full mb-8">
               <Zap size={14} className="text-[#5DA9E9] fill-[#5DA9E9]" />
               <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-white">Advanced AI Ecosystem v1.1</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-serif font-bold text-white leading-[0.9] tracking-tight mb-12">
               Investment <br/> <span className="text-[#5DA9E9] italic font-medium">Refined.</span>
            </h1>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
               <button 
                  onClick={() => navigate('/properties')}
                  className="group bg-[#5DA9E9] text-white px-12 py-6 rounded-full font-bold uppercase text-[11px] tracking-[0.2em] shadow-2xl hover:bg-white hover:text-[#0B1F33] transition-all flex items-center gap-4"
               >
                  Browse Portfolio <ArrowUpRight className="group-hover:rotate-45 transition-transform" />
               </button>
               <div className="flex gap-10 border-l border-white/20 pl-10 h-16 items-center">
                  <div className="text-left">
                    <div className="text-3xl font-serif font-bold text-white tracking-tighter">{stats.online_listings}+</div>
                    <div className="text-[8px] uppercase font-bold text-[#5DA9E9] tracking-widest">Active Assets</div>
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-serif font-bold text-white tracking-tighter">6.8%</div>
                    <div className="text-[8px] uppercase font-bold text-[#5DA9E9] tracking-widest">Average ROI</div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Floating AI Elements */}
        <div className="absolute bottom-20 left-12 animate-bounce duration-5000">
           <div className="w-48 h-48 bg-[#5DA9E9]/20 blur-[100px] rounded-full" />
        </div>
      </header>

      {/* --- SECTION 2 : LIVE MARKET SCANNER --- */}
      <section className="py-24 max-w-7xl mx-auto px-8">
        <div className="bg-[#0B1F33] rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5"><Sparkles size={200} /></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 relative z-10">
              <div>
                <h2 className="text-[10px] uppercase font-bold text-[#5DA9E9] tracking-[0.5em] mb-6">Real-Time Processing</h2>
                <h3 className="text-4xl font-serif font-bold text-white leading-tight mb-8">
                  Your interest behavior is analyzed to provide proprietary property matching.
                </h3>
                <ul className="space-y-6">
                  {[
                    { i: <ShieldCheck/>, t: "Asset Verification", d: "100% legal due-diligence per listing." },
                    { i: <Compass/>, t: "Behavioral Alignment", d: "Contextual results based on user journey." },
                    { i: <TrendingUp/>, t: "Market Velocity", d: "AI predictive analytics for resale value." }
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-6 items-start group">
                      <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[#5DA9E9] group-hover:bg-[#5DA9E9] group-hover:text-white transition-all">
                        {item.i}
                      </div>
                      <div>
                         <p className="text-white font-bold text-sm tracking-wide">{item.t}</p>
                         <p className="text-gray-400 text-xs mt-1 italic">{item.d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative rounded-[2rem] overflow-hidden bg-[#5DA9E9]/5 border border-white/5 p-12 flex flex-col justify-center text-center">
                 <div className="absolute inset-0 bg-[#5DA9E9]/5 backdrop-blur-xl animate-pulse" />
                 <h4 className="text-[11px] font-bold text-[#5DA9E9] uppercase tracking-widest relative">System Monitoring</h4>
                 <div className="my-10 relative">
                    <span className="text-6xl font-serif font-bold text-white tracking-tighter italic">"Precision Acquisition"</span>
                 </div>
                 <p className="text-xs text-white/40 leading-relaxed max-w-xs mx-auto relative italic">
                    Connecting capital to unique assets in Marrakech via secure blockchain-ready indexing.
                 </p>
              </div>
            </div>
        </div>
      </section>

      {/* --- SECTION 3 : SHOWCASE --- */}
      <section className="py-24 max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-end mb-16 border-b border-[#0B1F33]/5 pb-10">
          <div>
            <span className="text-[#C7A987] text-[10px] font-bold uppercase tracking-[0.4em]">Curated Intelligence</span>
            <h2 className="text-5xl font-serif font-bold text-[#0B1F33] mt-2">Latest Opportunities</h2>
          </div>
          <button 
            onClick={() => navigate('/properties')}
            className="text-[10px] font-bold uppercase border-b border-[#0B1F33] pb-1 hover:text-[#5DA9E9] hover:border-[#5DA9E9] transition-all tracking-[0.3em]"
          >
            Enter Global Hub
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {featured.map((prop, i) => (
            <motion.div 
              key={prop.id}
              whileHover={{ y: -15 }}
              onClick={() => navigate(`/property/${prop.id}`)}
              className="group cursor-pointer bg-white rounded-[2.5rem] overflow-hidden border border-[#0B1F33]/5 shadow-sm hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative h-96">
                 <img src={prop.thumbnail_url} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                 <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-[#0B1F33]/90 to-transparent">
                    <span className="bg-[#5DA9E9] text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-[0.3em] shadow-lg mb-3 inline-block">Off-Market Access</span>
                    <h4 className="text-2xl font-serif font-bold text-white tracking-tighter leading-none">{prop.title}</h4>
                    <p className="text-[#5DA9E9] text-[10px] mt-2 font-bold uppercase tracking-widest">{prop.location}</p>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- SECTION 4 : EXECUTIVE JOURNAL PREVIEW --- */}
      <section className="bg-white py-32 border-y border-[#0B1F33]/5">
         <div className="max-w-4xl mx-auto px-8 text-center">
            <h2 className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.5em] mb-8 italic text-[#C7A987]">Thought Leadership Hub</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-[#0B1F33] mb-12">Unlock investment briefings powered by industrial-grade analysis.</h3>
            <div className="flex gap-10 items-center justify-center p-8 bg-[#F9F7F2] rounded-[3rem] border border-[#0B1F33]/5">
               <img src="https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80" className="w-32 h-32 rounded-[2rem] object-cover shadow-xl border-4 border-white" />
               <div className="text-left">
                  <p className="text-[9px] uppercase font-bold text-[#5DA9E9] tracking-widest">Latest Article</p>
                  <p className="text-lg font-serif font-bold text-[#0B1F33] my-1">The High-Speed Rail Effect on Marrakech Yields</p>
                  <button onClick={() => navigate('/journal')} className="mt-3 flex items-center gap-2 text-[10px] font-bold text-[#0B1F33] hover:text-[#5DA9E9] transition-all">
                    Access Research <ExternalLink size={12}/>
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 text-center text-gray-400">
         <p className="text-[10px] uppercase font-bold tracking-[0.5em]">GateOne Intelligence © {new Date().getFullYear()} — Institutional Curation</p>
      </footer>
    </div>
  );
}