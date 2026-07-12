"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/public/Navbar'; 
import Footer from '@/components/public/Footer';
import { propertiesApi } from '@/lib/api';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Globe 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [newProperties, setNewProperties] = useState<any[]>([]);

  useEffect(() => {
    // Chargement des propriétés réelles pour la section "New Properties"
    propertiesApi.getPublicCatalog().then(data => setNewProperties(data.slice(0, 3)));
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCF9] font-sans selection:bg-[#5DA9E9] selection:text-white">
      <Navbar />

      <div className="bg-[#FDFCF9] text-gray-900">
        
        {/* --- SECTION 1: HERO - CINEMATIC IMPACT --- */}
        <section className="relative h-screen min-h-[750px] w-full overflow-hidden flex items-center px-6 md:px-12">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000" 
              alt="Palatial living in Morocco" 
              className="h-full w-full object-cover scale-105"
            />
            {/* Overlay Midnight Blue transparent */}
            <div className="absolute inset-0 bg-[#0B1F33]/40"></div>
            {/* Gradient pour la lecture */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F33]/60 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
                <Sparkles size={14} className="text-[#5DA9E9]" />
                <span className="text-[10px] uppercase font-bold tracking-[0.3em]">AI-Driven Curation</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter leading-[0.95]">
                Investment <br /> <span className="italic text-[#C7A987]">Evolved.</span>
              </h1>
              
              <p className="text-lg opacity-80 max-w-md font-light font-serif italic">
                Strategic acquisition of the most exclusive Riads and Estates in the Red City.
              </p>

              <button 
                onClick={() => navigate('/properties')}
                className="group flex items-center gap-3 bg-[#5DA9E9] text-white px-8 py-4 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-white hover:text-[#0B1F33] transition-all shadow-2xl"
              >
                Explore Selection
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Feature Spotlight Card */}
            <div className="hidden lg:block relative group">
               <div className="ml-auto w-80 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="p-8 text-white space-y-4">
                    <p className="text-[9px] uppercase font-bold tracking-widest text-[#5DA9E9]">Verified Intelligence</p>
                    <h3 className="text-2xl font-serif font-bold italic leading-tight">"Yield projections reach 12% in the Targa region this quarter."</h3>
                    <div className="pt-4 flex items-center gap-3 border-t border-white/10">
                        <TrendingUp size={16} className="text-[#5DA9E9]" />
                        <span className="text-[10px] font-bold">2026 MARKET OUTLOOK</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: AI CORE VALUES --- */}
        {/* --- SECTION 2: AI CORE VALUES --- */}
<section className="py-32 bg-white px-8">
    <div className="max-w-7xl mx-auto">
        
        {/* TITRE DE SECTION RAJOUTÉ ICI */}
        <div className="text-center mb-20 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <span className="text-[10px] uppercase font-bold text-[#5DA9E9] tracking-[0.5em] block mb-2">Engineered Excellence</span>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#0B1F33] leading-[1.1]">
            The new architecture <br className="hidden md:block" /> of institutional real estate.
          </h2>
          <div className="w-20 h-1 bg-[#C7A987]/20 mx-auto mt-8" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
                { icon: <Sparkles />, title: "AI Intelligence", desc: "Proprietary behavior analysis matching you to specific lifestyle assets." },
                { icon: <TrendingUp />, title: "Trusted Performance", desc: "Access to institutional network and exclusive off-market listings." },
                { icon: <ShieldCheck />, title: "Secure Workflow", desc: "Every property title deed is verified through our AI compliance engine." },
                { icon: <Globe />, title: "Global Authority", desc: "High-value asset mapping across Morocco's premium economic hubs." }
            ].map((feature, i) => (
                <div key={i} className="text-center group p-10 rounded-[2.5rem] hover:bg-[#F9F7F2] transition-all cursor-default border border-transparent hover:border-[#0B1F33]/5">
                    <div className="w-16 h-16 bg-[#5DA9E9]/10 text-[#5DA9E9] rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:bg-[#0B1F33] group-hover:text-white transition-all shadow-sm">
                        {React.cloneElement(feature.icon as React.ReactElement, { size: 30 })}
                    </div>
                    <h3 className="text-xl font-serif font-bold text-[#2D3321] mb-4">{feature.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed italic opacity-80">{feature.desc}</p>
                </div>
            ))}
        </div>
    </div>
</section>

        {/* --- SECTION 3: STRATEGIC COLLECTIONS --- */}
        {/* --- SECTION 3: STRATEGIC COLLECTIONS (Navigation par catégories) --- */}
<section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
  <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
    <div className="space-y-4">
        <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#C7A987]">Portfolio Architecture</span>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#0B1F33] leading-tight">Assets grouped <br /> by investment class.</h2>
    </div>
    <p className="max-w-sm text-gray-400 text-sm italic font-serif leading-relaxed">
        Select a strategic cluster to explore tailored intelligence reports and verified technical files.
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* CATEGORY 1: RIADS (Le bloc large) */}
    <div 
      onClick={() => navigate('/properties?type=Riad')} // On pourra ajouter cette logique de filtre plus tard
      className="relative h-[500px] md:col-span-2 rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-xl border border-white"
    >
      <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Riads" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
      <div className="absolute bottom-10 left-10 text-white">
        <div className="flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 w-fit">
            <Sparkles size={12} className="text-[#C7A987]" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#C7A987]">Legacy Intelligence</span>
        </div>
        <h3 className="text-4xl font-serif font-bold italic">Private Palaces & Riads</h3>
        <p className="text-white/60 text-xs mt-3 tracking-widest font-bold uppercase">Explore Historic Heritage assets</p>
      </div>
    </div>

    {/* CATEGORY 2: VILLAS (Le bloc étroit) */}
    <div 
      onClick={() => navigate('/properties?type=Villa')}
      className="relative h-[500px] rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-xl border border-white"
    >
      <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Villas" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
      <div className="absolute bottom-10 left-10 text-white">
        <div className="flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 w-fit">
            <TrendingUp size={12} className="text-[#5DA9E9]" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#5DA9E9]">Contemporary Unit</span>
        </div>
        <h3 className="text-4xl font-serif font-bold italic text-white/90">Villas</h3>
        <p className="text-white/60 text-xs mt-3 tracking-widest font-bold uppercase">Modern high-yield retreats</p>
      </div>
    </div>
  </div>
</section>

        {/* --- SECTION 4: RECENT LISTINGS (DYNAMIC) --- */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-gray-100">
          <div className="flex justify-between items-end mb-16">
            <div>
               <h2 className="text-4xl font-serif font-bold text-[#0B1F33]">New Intelligence</h2>
               <p className="text-sm text-gray-400 font-serif italic mt-2">Just processed assets into our ecosystem.</p>
            </div>
            <div className="flex gap-4">
              <button className="p-3 border border-gray-100 rounded-full hover:bg-[#F9F7F2] text-gray-300 hover:text-[#0B1F33] transition"><ChevronLeft size={20}/></button>
              <button className="p-3 border border-gray-100 rounded-full hover:bg-[#F9F7F2] text-gray-300 hover:text-[#0B1F33] transition"><ChevronRight size={20}/></button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {newProperties.length > 0 ? newProperties.map((prop) => (
              <div key={prop.id} onClick={() => navigate(`/property/${prop.id}`)} className="group cursor-pointer">
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 shadow-sm border border-[#0B1F33]/5 group-hover:shadow-2xl transition-all duration-500">
                  <img 
                    src={prop.thumbnail_url || "https://images.unsplash.com/photo-1600585154340-be6199f7c096?auto=format&fit=crop&q=80"} 
                    alt="Luxury Estate" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
                  />
                  <span className="absolute bottom-6 right-6 text-[8px] uppercase font-bold bg-[#0B1F33]/60 backdrop-blur-md text-[#5DA9E9] px-4 py-1.5 rounded-full border border-white/10 tracking-[0.2em]">
                    Premium Analysis Ready
                  </span>
                </div>
                <p className="text-[10px] font-bold text-[#C7A987] uppercase tracking-[0.3em] mb-1">{prop.neighborhood || 'Palmeraie'}</p>
                <h4 className="text-2xl font-serif font-bold text-[#0B1F33] group-hover:text-[#5DA9E9] transition-colors">{prop.title}</h4>
                <div className="mt-6 flex justify-between items-center">
                    <span className="text-2xl font-serif font-bold">{prop.price?.toLocaleString()} <span className="text-[9px] uppercase font-sans tracking-widest ml-1 opacity-40">MAD</span></span>
                    <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#0B1F33] group-hover:text-white transition-all">
                        <ArrowRight size={14}/>
                    </button>
                </div>
              </div>
            )) : (
              <p className="text-gray-300 italic py-10 col-span-3 text-center">Consulting cloud archives for new assets...</p>
            )}
          </div>
        </section>

        {/* --- FOOTER: FINAL IMPACT --- */}
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;