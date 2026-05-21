"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Users, 
  ArrowRight,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/public/Navbar';

export default function Index() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('buy');

  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden">
	<Navbar /> 
      
      {/* 1. HERO SECTION & VIDEO BACKGROUND */}
      <section className="relative h-screen flex flex-col items-center justify-center text-white px-6">
        {/* Cinematic Image/Video Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover" 
            alt="Luxury Property" 
          />
          <div className="absolute inset-0 bg-[#0B1F33]/60 backdrop-brightness-75" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-[10px] uppercase font-bold tracking-[0.6em] text-[#5DA9E9] mb-4">Leading the Future of Assets</h2>
            <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-[1.1] tracking-tighter">
              Find Your <br/> <span className="italic text-[#5DA9E9]">Dream Property</span>
            </h1>
          </motion.div>

          {/* 2. PREMIUM SEARCH BAR (Glassmorphism) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 bg-white/10 backdrop-blur-xl p-2 rounded-[2.5rem] border border-white/20 shadow-2xl inline-flex flex-col md:flex-row items-center w-full max-w-3xl"
          >
            <div className="flex bg-[#0B1F33]/40 rounded-full p-1 m-1 self-start md:self-auto">
               <button 
                 onClick={() => setActiveTab('buy')}
                 className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase transition-all ${activeTab === 'buy' ? 'bg-[#5DA9E9] text-white' : 'text-gray-300'}`}>Buy</button>
               <button 
                 onClick={() => setActiveTab('rent')}
                 className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase transition-all ${activeTab === 'rent' ? 'bg-[#5DA9E9] text-white' : 'text-gray-300'}`}>Rent</button>
            </div>
            
            <div className="flex-1 flex items-center px-4 border-l border-white/10 h-12 my-2 md:my-0">
               <Search size={18} className="text-[#5DA9E9] mr-3" />
               <input 
                 type="text" 
                 placeholder="Search city, neighborhood..."
                 className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-300"
               />
            </div>

            <div className="hidden md:flex items-center px-4 border-l border-white/10 h-12 text-sm gap-2">
                <span className="font-bold">Price</span>
                <ChevronDown size={14} className="text-gray-400" />
            </div>

            <button 
              onClick={() => navigate('/properties')}
              className="bg-white text-[#0B1F33] px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#5DA9E9] hover:text-white transition-all shadow-xl active:scale-95"
            >
              Start Search
            </button>
          </motion.div>
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES GRID */}
      <section className="py-24 px-12 bg-[#EAEAEA]/30">
         <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-16">
               <div>
                  <p className="text-[10px] uppercase font-bold text-[#5DA9E9] tracking-[0.4em] mb-2 text-sky-600">Selected Listings</p>
                  <h2 className="text-5xl font-serif font-bold text-[#0B1F33]">Curated Properties</h2>
               </div>
               <button className="flex items-center gap-2 text-xs font-bold uppercase border-b-2 border-[#5DA9E9] pb-1 hover:text-[#5DA9E9] transition-all">Explore All Assets <ArrowRight size={14}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {[1,2,3].map((item) => (
                  <motion.div 
                    whileHover={{ y: -10 }}
                    key={item} 
                    className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 cursor-pointer"
                  >
                     <div className="relative h-72 overflow-hidden">
                        <img 
                          src={`https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop`} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[#0B1F33] px-4 py-2 rounded-xl text-xs font-bold shadow-lg">2,500,000 MAD</div>
                     </div>
                     <div className="p-8">
                        <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold mb-3 tracking-widest">
                           <MapPin size={12} className="text-[#5DA9E9]" /> Targa, Marrakech
                        </div>
                        <h4 className="text-xl font-serif font-bold text-[#0B1F33] mb-4">Luxury Minimalist Villa</h4>
                        <div className="flex justify-between border-t pt-4 border-gray-50 italic text-sm text-gray-500">
                           <span>450 sqm</span>
                           <span className="w-1 h-1 bg-gray-300 rounded-full self-center"></span>
                           <span>4 Suites</span>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 4. WHY CHOOSE US (TECH/AI FOCUS) */}
      <section className="py-24 px-12 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { icon: Sparkles, title: "AI Intelligence", desc: "Predictive behavioral analysis to match you with your future lifestyle." },
              { icon: Users, title: "Trusted Partners", desc: "Expert agents verified by local market results." },
              { icon: ShieldCheck, title: "Secure Transactions", desc: "Encrypted and legally verified asset acquisition workflow." },
              { icon: Compass, title: "Exclusive Atlas", desc: "Unique access to off-market riads and villas across Morocco." }
            ].map((feature, i) => (
              <div key={i} className="text-center group p-8 rounded-3xl hover:bg-[#F9F7F2] transition-all">
                <div className="w-16 h-16 bg-[#5DA9E9]/10 text-[#5DA9E9] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#0B1F33] group-hover:text-white transition-all shadow-sm">
                  <feature.icon size={30} />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#0B1F33] mb-3">{feature.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed italic">{feature.desc}</p>
              </div>
            ))}
          </div>
      </section>

      {/* 5. FINAL CTA (DARK SECTION) */}
      <section className="px-6 pb-20">
         <div className="max-w-7xl mx-auto bg-[#0B1F33] rounded-[3rem] p-16 md:p-24 relative overflow-hidden text-center text-white">
            <div className="absolute inset-0 bg-[#5DA9E9]/5 opacity-50 pointer-events-none" />
            <motion.div 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               className="relative z-10"
            >
              <h2 className="text-5xl font-serif font-bold mb-8">Ready to find <br className="md:hidden"/> your next sanctuary?</h2>
              <p className="max-w-lg mx-auto text-gray-400 mb-12 text-lg font-serif italic">Access our premium briefing networks and receiving weekly ROI analysis on private listings.</p>
              
              <div className="flex flex-col md:flex-row justify-center gap-6">
                <button className="bg-[#5DA9E9] text-white px-12 py-5 rounded-full font-bold uppercase text-[11px] tracking-widest shadow-2xl hover:bg-sky-400 transition-all flex items-center justify-center gap-2">
                  Contact Specialist
                </button>
                <button className="bg-white/5 border border-white/20 text-white px-12 py-5 rounded-full font-bold uppercase text-[11px] tracking-widest backdrop-blur-md hover:bg-white hover:text-[#0B1F33] transition-all">
                  View Latest Reports
                </button>
              </div>
            </motion.div>
         </div>
      </section>

      {/* 6. MINIMALIST FOOTER */}
      <footer className="py-12 border-t border-gray-100 px-12 flex justify-between items-center text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em]">
         <p>© {new Date().getFullYear()} GateOne Intelligence — Luxury Standard</p>
         <div className="flex gap-10 italic lowercase">
            <a href="#">privacy</a>
            <a href="#">linkedin</a>
         </div>
      </footer>
    </div>
  );
}