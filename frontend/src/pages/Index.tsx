"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Search, MapPin, ChevronDown, Sparkles, ShieldCheck, 
  Compass, Users, ArrowRight, Building2, Star, TrendingUp, 
  X, ChevronRight, Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/public/Navbar';

// ─── CONFIG ────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── HOOK API ──────────────────────────────────────────────────
function useFeaturedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`${API_BASE}/api/properties?limit=3&status=available`, { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error('API error'); return r.json(); })
      .then(data => { setProperties(Array.isArray(data) ? data.slice(0,3) : (data.items||[]).slice(0,3)); setLoading(false); })
      .catch(e => { if (e.name !== 'AbortError') { setError(e.message); setLoading(false); } });
    return () => ctrl.abort();
  }, []);

  return { properties, loading, error };
}

// ─── FALLBACK DATA ─────────────────────────────────────────────
const FALLBACK = [
  { id:'1', title:'Villa Lumière — Targa',       price:4800000, location:'Targa, Marrakech',    area_sqm:620, bedrooms:5, type:'villa',     thumbnail_url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800' },
  { id:'2', title:'Riad Atlas — Médina Palmeraie',price:3200000, location:'Médina, Marrakech',   area_sqm:380, bedrooms:6, type:'riad',      thumbnail_url:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800' },
  { id:'3', title:'Penthouse Hivernage',           price:6500000, location:'Hivernage, Marrakech',area_sqm:290, bedrooms:3, type:'apartment', thumbnail_url:'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800' },
];

// ─── STATS ─────────────────────────────────────────────────────
const STATS = [
  { value:'150+', label:'Exclusive Properties', icon: Building2 },
  { value:'98%',  label:'Client Satisfaction',  icon: Star },
  { value:'12',   label:'Prime Districts',       icon: MapPin },
  { value:'3.2B', label:'MAD in Transactions',   icon: TrendingUp },
];

// ─── PRICE OPTIONS ─────────────────────────────────────────────
const PRICE_OPTIONS = [
  { label:'All Budgets',      value:'' },
  { label:'< 1M MAD',         value:'0-1000000' },
  { label:'1M – 3M MAD',      value:'1000000-3000000' },
  { label:'3M – 6M MAD',      value:'3000000-6000000' },
  { label:'6M – 10M MAD',     value:'6000000-10000000' },
  { label:'> 10M MAD (VIP)',  value:'10000000-999999999' },
];

// ─── FEATURES ──────────────────────────────────────────────────
const FEATURES = [
  { icon: Sparkles,    title:"AI Intelligence",     desc:"Predictive behavioral analysis to match you with your future lifestyle before you even start searching." },
  { icon: Users,       title:"Trusted Partners",    desc:"Expert agents verified by local market results, ready for a personalized VIP briefing." },
  { icon: ShieldCheck, title:"Secure Transactions", desc:"Encrypted and legally verified asset acquisition workflow, from first visit to deed transfer." },
  { icon: Compass,     title:"Exclusive Atlas",     desc:"Unique access to off-market riads and villas across Morocco, not listed anywhere else." },
];

// ─── SKELETON ──────────────────────────────────────────────────
function PropertySkeleton() {
  return (
    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="h-72 bg-gray-200" />
      <div className="p-8 space-y-4">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="flex justify-between border-t pt-4 border-gray-100">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

// ─── PROPERTY CARD ─────────────────────────────────────────────
function PropertyCard({ property, index }) {
  const navigate = useNavigate();
  const img = property.thumbnail_url
    || property.media?.[0]?.cloudinary_url
    || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800';

  return (
    <motion.div
      initial={{ opacity:0, y:40 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }}
      transition={{ delay: index * 0.15, duration:0.6, ease:[0.22,1,0.36,1] }}
      whileHover={{ y:-10 }}
      onClick={() => navigate(`/properties/${property.id}`)}
      className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 cursor-pointer"
    >
      <div className="relative h-72 overflow-hidden">
        <img
          src={img}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          alt={property.title}
          loading="lazy"
        />
        {/* type badge */}
        <div className="absolute top-4 left-4 bg-[#0B1F33]/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest">
          {property.type}
        </div>
        {/* price badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[#0B1F33] px-4 py-2 rounded-xl text-xs font-bold shadow-lg">
          {new Intl.NumberFormat('fr-MA').format(property.price)} MAD
        </div>
        {/* hover overlay + CTA */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F33]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100"
          initial={false}
          animate={{ y: 0 }}
        >
          <span className="bg-[#5DA9E9] text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-full flex items-center gap-2 whitespace-nowrap shadow-xl">
            View Property <ArrowRight size={12} />
          </span>
        </motion.div>
      </div>

      <div className="p-8">
        <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold mb-3 tracking-widest">
          <MapPin size={12} className="text-[#5DA9E9]" />
          {property.location || property.neighborhood}
        </div>
        <h4 className="text-xl font-serif font-bold text-[#0B1F33] mb-4 leading-snug">{property.title}</h4>
        <div className="flex justify-between border-t pt-4 border-gray-50 italic text-sm text-gray-500">
          <span>{property.area_sqm} sqm</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full self-center" />
          <span>{property.bedrooms} Suites</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────
export default function Index() {
  const navigate = useNavigate();
  const [activeTab,         setActiveTab]         = useState('buy');
  const [searchQuery,       setSearchQuery]       = useState('');
  const [priceRange,        setPriceRange]        = useState('');
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { properties: apiProps, loading, error } = useFeaturedProperties();
  const display = apiProps.length > 0 ? apiProps : FALLBACK;

  // parallax hero
  const { scrollY } = useScroll();
  const heroImgY   = useTransform(scrollY, [0,600], [0,120]);
  const heroOpacity= useTransform(scrollY, [0,400], [1,0]);

  // close dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowPriceDropdown(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  function handleSearch() {
    const p = new URLSearchParams();
    if (searchQuery) p.set('search', searchQuery);
    p.set('type', activeTab);
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      p.set('min_price', min);
      p.set('max_price', max);
    }
    navigate(`/properties?${p.toString()}`);
  }

  const selectedLabel = PRICE_OPTIONS.find(o => o.value === priceRange)?.label || 'Price';

  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden">
      <Navbar />

      {/* ══════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════ */}
      <section className="relative h-screen flex flex-col items-center justify-center text-white px-6">
        {/* Parallax image */}
        <motion.div style={{ y: heroImgY }} className="absolute inset-0 z-0 scale-110">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
            className="w-full h-full object-cover"
            alt="Luxury Property"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1F33]/65 via-[#0B1F33]/45 to-[#0B1F33]/75" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center max-w-4xl w-full">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}
            className="text-[10px] uppercase font-bold tracking-[0.6em] text-[#5DA9E9] mb-4"
          >
            Leading the Future of Assets
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.9, ease:[0.22,1,0.36,1] }}
            className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-[1.05] tracking-tighter"
          >
            Find Your <br/>
            <span className="italic text-[#5DA9E9]">Dream Property</span>
          </motion.h1>

          {/* ── SEARCH BAR ── */}
          <motion.div
            initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.5, duration:0.5 }}
            className="mt-12 bg-white/10 backdrop-blur-xl p-2 rounded-[2.5rem] border border-white/20 shadow-2xl inline-flex flex-col md:flex-row items-center w-full max-w-3xl"
          >
            {/* Tabs */}
            <div className="flex bg-[#0B1F33]/40 rounded-full p-1 m-1 self-start md:self-auto shrink-0">
              {['buy','rent'].map(tab => (
                <button key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase transition-all ${activeTab===tab ? 'bg-[#5DA9E9] text-white' : 'text-gray-300 hover:text-white'}`}
                >{tab === 'buy' ? 'Buy' : 'Rent'}</button>
              ))}
            </div>

            {/* Input */}
            <div className="flex-1 flex items-center px-4 border-l border-white/10 h-12 my-2 md:my-0 min-w-0">
              <Search size={18} className="text-[#5DA9E9] mr-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key==='Enter' && handleSearch()}
                placeholder="Search neighborhood, type..."
                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-300 min-w-0"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-white ml-1 shrink-0"><X size={14}/></button>
              )}
            </div>

            {/* Price dropdown */}
            <div className="relative hidden md:block shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setShowPriceDropdown(v => !v)}
                className="flex items-center px-4 border-l border-white/10 h-12 gap-2 text-white hover:text-[#5DA9E9] transition-colors"
              >
                <span className="font-bold text-xs whitespace-nowrap">{selectedLabel}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showPriceDropdown?'rotate-180':''}`}/>
              </button>
              <AnimatePresence>
                {showPriceDropdown && (
                  <motion.div
                    initial={{ opacity:0, y:8, scale:0.97 }}
                    animate={{ opacity:1, y:0, scale:1 }}
                    exit={{ opacity:0, y:8, scale:0.97 }}
                    transition={{ duration:0.15 }}
                    className="absolute top-14 right-0 bg-[#0B1F33] border border-white/10 rounded-2xl overflow-hidden shadow-2xl min-w-[190px] z-50"
                  >
                    {PRICE_OPTIONS.map(opt => (
                      <button key={opt.value}
                        onClick={() => { setPriceRange(opt.value); setShowPriceDropdown(false); }}
                        className={`w-full text-left px-5 py-3 text-xs font-bold transition-colors ${priceRange===opt.value ? 'bg-[#5DA9E9] text-white' : 'text-gray-300 hover:bg-white/5'}`}
                      >{opt.label}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTA */}
            <button
              onClick={handleSearch}
              className="bg-white text-[#0B1F33] px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#5DA9E9] hover:text-white transition-all shadow-xl active:scale-95 shrink-0"
            >Start Search</button>
          </motion.div>

          {/* Popular tags */}
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }}
            className="flex flex-wrap justify-center gap-3 mt-6"
          >
            {['Villa Targa','Riad Médina','Hivernage','Palmeraie'].map(tag => (
              <button key={tag}
                onClick={() => { setSearchQuery(tag); setTimeout(handleSearch, 50); }}
                className="text-[10px] text-white/60 hover:text-white border border-white/20 hover:border-white/50 px-4 py-1.5 rounded-full transition-all uppercase tracking-wider font-bold"
              >{tag}</button>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y:[0,8,0] }} transition={{ repeat:Infinity, duration:2.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/40"
        >
          <span className="text-[9px] uppercase tracking-widest">Scroll</span>
          <ChevronDown size={16}/>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          2. STATS BAND
      ══════════════════════════════════════════ */}
      <section className="py-16 bg-[#0B1F33]">
        <div className="max-w-5xl mx-auto px-12 grid grid-cols-2 md:grid-cols-4 gap-10">
          {STATS.map((stat, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay: i*0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-[#5DA9E9]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon size={22} className="text-[#5DA9E9]"/>
              </div>
              <p className="text-4xl font-serif font-bold text-white mb-1">{stat.value}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. FEATURED PROPERTIES
      ══════════════════════════════════════════ */}
      <section className="py-24 px-12 bg-[#EAEAEA]/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <motion.p initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
                className="text-[10px] uppercase font-bold text-[#5DA9E9] tracking-[0.4em] mb-2">
                Selected Listings
              </motion.p>
              <motion.h2 initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
                className="text-5xl font-serif font-bold text-[#0B1F33]">
                Curated Properties
              </motion.h2>
            </div>
            <button onClick={() => navigate('/properties')}
              className="flex items-center gap-2 text-xs font-bold uppercase border-b-2 border-[#5DA9E9] pb-1 hover:text-[#5DA9E9] transition-all">
              Explore All Assets <ArrowRight size={14}/>
            </button>
          </div>

          {/* API status indicator */}
          {!loading && !error && apiProps.length > 0 && (
            <div className="flex items-center gap-2 mb-8 text-xs text-emerald-600 font-bold">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>
              Live data · GateOne API
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 mb-8 text-xs text-amber-600 font-bold">
              <span className="w-2 h-2 bg-amber-500 rounded-full"/>
              Demo mode · Sample listings
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {loading
              ? [1,2,3].map(i => <PropertySkeleton key={i}/>)
              : display.map((p,i) => <PropertyCard key={p.id} property={p} index={i}/>)
            }
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. WHY CHOOSE US
      ══════════════════════════════════════════ */}
      <section className="py-24 px-12 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          {FEATURES.map((feature, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay: i*0.1 }}
              className="text-center group p-8 rounded-3xl hover:bg-[#F9F7F2] transition-all"
            >
              <div className="w-16 h-16 bg-[#5DA9E9]/10 text-[#5DA9E9] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#0B1F33] group-hover:text-white transition-all shadow-sm">
                <feature.icon size={30}/>
              </div>
              <h3 className="text-lg font-serif font-bold text-[#0B1F33] mb-3">{feature.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed italic">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto bg-[#0B1F33] rounded-[3rem] p-16 md:p-24 relative overflow-hidden text-center text-white">
          {/* decorative glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#5DA9E9]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"/>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#5DA9E9]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 pointer-events-none"/>

          <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} className="relative z-10">
            <h2 className="text-5xl font-serif font-bold mb-8">
              Ready to find <br className="md:hidden"/> your next sanctuary?
            </h2>
            <p className="max-w-lg mx-auto text-gray-400 mb-12 text-lg font-serif italic">
              Access our premium briefing networks and receive weekly ROI analysis on private listings.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-6">
              <button
                onClick={() => navigate('/contact')}
                className="bg-[#5DA9E9] text-white px-12 py-5 rounded-full font-bold uppercase text-[11px] tracking-widest shadow-2xl hover:bg-sky-400 transition-all flex items-center justify-center gap-3 group"
              >
                Contact Specialist
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
              </button>
              <button
                onClick={() => navigate('/properties')}
                className="bg-white/5 border border-white/20 text-white px-12 py-5 rounded-full font-bold uppercase text-[11px] tracking-widest backdrop-blur-md hover:bg-white hover:text-[#0B1F33] transition-all"
              >
                View Latest Reports
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. FOOTER
      ══════════════════════════════════════════ */}
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