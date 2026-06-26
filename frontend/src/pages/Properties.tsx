"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertiesApi } from '@/lib/api';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { 
  MapPin, 
  Maximize, 
  Bed, 
  Search, 
  ArrowUpRight,
  Sparkles,
  Loader2, Bath
} from 'lucide-react';



export default function Properties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
        try {
            console.log("️ Fetching Public Catalog...");
            const data = await propertiesApi.getPublicCatalog();
            
            // On vérifie que data est bien un tableau avant de le stocker
            if (Array.isArray(data)) {
                console.log(" Catalog received:", data.length, "assets");
                setProperties(data);
            }
        } catch (err) {
            console.error(" Logic Error in Discovery Page:", err);
        } finally {
            // QUOI QU'IL ARRIVE, on arrête le spinner
            setLoading(false); 
        }
    }
    loadData();
}, []);

const filteredProperties = filter === 'all'
  ? properties
  : properties.filter(p => {
      const type = p.type?.toLowerCase() || '';
      const f = filter.toLowerCase();
      
      if (f === 'villa')      return type.includes('villa');
      if (f === 'riad')       return type.includes('riad');
      if (f === 'palace')     return type.includes('palace') || type.includes('palais');
      if (f === 'penthouse')  return type.includes('penthouse');
      if (f === 'apartment')  return type.includes('apartment') || type.includes('appartement');
      if (f === 'land')       return type.includes('land') || type.includes('terrain');
      if (f === 'other')      return type.includes('other') || type.includes('exceptional');
      return type === f;
    });


 return (
  <div className="min-h-screen bg-[#FDFCF9] font-sans">
    <Navbar />

    {/* HERO SECTION - RESTRUCTURED FOR FLUIDITY */}
    <header className="relative pt-44 pb-20 px-8 bg-[#0B1F33] text-white">
      {/* 🎨 Fond décoratif arabesque */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            `url('https://www.transparenttextures.com/patterns/arabesque.png')`
        }}
      />
      
      {/* 🔵 Lumière IA de luxe (glow effect) */}
      <div className="absolute -bottom-32 left-1/4 w-[40vw] h-64 bg-[#5DA9E9]/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <span className="text-[10px] uppercase font-bold text-[#5DA9E9] tracking-[0.6em] mb-4 block">
          Exclusive Portfolio
        </span>

        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-10 tracking-tight leading-tight">
          Discover Exceptional Assets
        </h1>

          {/* SEARCH BAR */}
          {/* PREMIUM SEARCH BAR (Glassmorphism) */}
<div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl p-2 rounded-[2rem] border border-white/10 flex flex-col md:flex-row items-center shadow-2xl relative z-10">
    <div className="flex-1 flex items-center px-5 w-full">
        <Search className="text-[#5DA9E9] mr-3" size={18} />
        <input
            type="text"
            placeholder="Search by city, neighborhood, or estate name..."
            className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-gray-400 py-4"
            value={searchTerm} // Liaison avec l'état
            onChange={(e) => setSearchTerm(e.target.value)} // Mise à jour instantanée
        />
    </div>

    {/* Ce bouton est visuel pour le "luxe", l'utilisateur voit les résultats bouger dès qu'il tape */}
    <button className="bg-[#5DA9E9] text-white px-8 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-sky-400 transition-all shadow-xl active:scale-95">
        Refine Search
    </button>
</div>
       </div>
    </header>


      {/* FILTER BAR */}
<div className="max-w-7xl mx-auto px-8 py-6 border-b border-[#EDE9E0] flex justify-between items-center bg-white sticky top-0 z-40 shadow-sm">
  
  {/* Filtres */}
  <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
    {[
      { value: 'all',            label: 'All Properties'    },
      { value: 'villa',          label: 'Luxury Villa'      },
      { value: 'riad',           label: 'Historic Riad'     },
      { value: 'palace',         label: 'Royal Palace'      },
      { value: 'penthouse',      label: 'Penthouse'         },
      { value: 'apartment',      label: 'Apartment'         },
      { value: 'land',           label: 'Investment Land'   },
      { value: 'other',          label: 'Exceptional'       },
    ].map((type) => (
      <button
        key={type.value}
        onClick={() => setFilter(type.value)}
        className={`
          px-5 py-2.5 rounded-full text-[10px] font-bold uppercase 
          tracking-widest transition-all border whitespace-nowrap
          ${filter === type.value
            ? "bg-[#0B1F33] text-white border-[#0B1F33]"
            : "border-[#EDE9E0] text-gray-400 hover:border-[#0B1F33] hover:text-[#0B1F33] bg-white"
          }
        `}
      >
        {type.label}
      </button>
    ))}
  </div>

  {/* Compteur */}
  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest hidden md:block shrink-0 ml-6">
    {filteredProperties.length} Properties
  </p>
</div>

      {/* PROPERTIES GRID */}
      <main className="max-w-7xl mx-auto px-8 py-20">

        {loading ? (

          <div className="flex flex-col items-center justify-center py-32 text-gray-300">
            <Loader2
              className="animate-spin mb-4"
              size={40}
            />

            <p className="font-serif italic text-lg text-gray-400">
              Loading Premium Assets...
            </p>
          </div>

        ) : filteredProperties.length === 0 ? (

          <div className="text-center py-32 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
            <p className="text-gray-400 italic">
              No properties currently matching your search.
            </p>
          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">

            {filteredProperties.map((prop) => (

              <div
                key={prop.id}
                onClick={() =>
                  navigate(`/property/${prop.id}`)
                }
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 hover:shadow-[0_20px_60px_rgba(11,31,51,0.12)] transition-all duration-700 cursor-pointer flex flex-col"
              >

                {/* IMAGE */}
                <div className="relative h-[320px] overflow-hidden">

                  {/* Floating Tag */}
                  <div className="absolute top-6 left-6 z-10">

                    <div className="bg-[#0B1F33]/40 backdrop-blur-md text-[#5DA9E9] px-4 py-2 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] border border-white/10 flex items-center gap-2 shadow-xl">

                      <div className="w-1 h-1 bg-[#5DA9E9] rounded-full animate-pulse"></div>

                      Curated Choice
                    </div>
                  </div>

                  {/* Property Image */}
                  <img
                    src={
                      prop.thumbnail_url ||
                      "https://images.unsplash.com/photo-1600585154340-be6199f7c096?auto=format&fit=crop&q=80"
                    }
                    alt={prop.title}
                    className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F33]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center">

                    <div className="bg-[#5DA9E9] text-white p-5 rounded-full scale-50 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-700">

                      <ArrowUpRight
                        size={28}
                        strokeWidth={2.5}
                      />
                    </div>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-8 flex-1 flex flex-col">

                  {/* LOCATION */}
                  <div className="flex items-center text-[#5DA9E9] gap-1 mb-3">

                    <MapPin size={12} />

                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                      {prop.location}
                    </span>
                  </div>

                  {/* TITLE */}
                  <h3 className="text-2xl font-serif font-bold text-[#0B1F33] mb-2 leading-tight group-hover:text-[#5DA9E9] transition-colors">

                    {prop.title}
                  </h3>

                  {/* SUBTITLE */}
                  <p className="text-gray-400 text-xs font-serif italic mb-8">
                    {prop.neighborhood ||
                      "Premium district"}
                  </p>

                  {/* DETAILS */}
                  <div className="mt-auto grid grid-cols-3 gap-2 border-t border-gray-50 pt-6">
  {/* AREA */}
  <div className="flex flex-col">
    <span className="text-[9px] text-gray-400 font-bold uppercase">Area</span>
    <div className="flex items-center gap-1.5 text-[#2D3321]">
      <Maximize size={14} className="opacity-20" /> 
      <span className="text-xs font-bold">{prop.area_sqm} m²</span>
    </div>
  </div>

  {/* BEDROOMS */}
<div className="flex flex-col border-x border-gray-50 px-4">
  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Beds</span>
  <div className="flex items-center gap-1.5">
    <Bed size={13} className="text-gray-300" />
    <span className="text-sm font-bold text-[#0B1F33]">
      {prop.bedrooms ?? '—'}
    </span>
  </div>
</div>

{/* BATHROOMS */}
<div className="flex flex-col pl-4">
  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Baths</span>
  <div className="flex items-center gap-1.5">
    <Bath size={13} className="text-gray-300" />
    <span className="text-sm font-bold text-[#0B1F33]">
      {prop.bathrooms ?? '—'}
    </span>
  </div>
</div>
</div>

                  {/* PRICE */}
                  <div className="mt-8 flex justify-between items-end">

                    <div className="text-2xl font-serif font-bold text-[#0B1F33]">

                      {Number(prop.price)?.toLocaleString()}

                      <span className="text-[10px] text-[#5DA9E9] uppercase ml-1 tracking-widest font-sans">
                        MAD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
	 
	 {/* --- FOOTER: FINAL IMPACT --- */}
        <Footer />
    </div>
  );
}