"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertiesApi } from '@/lib/api';
import { 
  MapPin, Maximize, Bed, Bath, ArrowLeft, 
  MessageCircle, Sparkles, CheckCircle2, ShieldCheck, Share2 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [aiArticle, setAiArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFullData() {
      try {
        // 1. Charger les données du bien
        const allProps = await propertiesApi.getAll();
        const found = allProps.find((p: any) => p.id === id);
        setProperty(found);

        // 2. Charger l'article d'intelligence artificielle
        if (id) {
          const article = await propertiesApi.getAIArticle(id);
          setAiArticle(article);
        }
      } catch (err) {
        console.error("Detail page fetch error", err);
      } finally {
        setLoading(false);
      }
    }
    loadFullData();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F9F7F2]">
        <div className="animate-pulse text-[#C7A987] font-serif text-xl italic">Curating Luxury Experience...</div>
    </div>
  );

  if (!property) return <div className="text-center py-20">Estate not found.</div>;

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      {/* 1. CINEMATIC HEADER */}
      <header className="relative h-[80vh] w-full overflow-hidden">
        <img 
          src={property.thumbnail_url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80"} 
          className="w-full h-full object-cover" 
          alt={property.title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D3321] to-transparent opacity-80" />
        
        {/* Navigation Overlays */}
        <div className="absolute top-10 left-10">
          <button 
            onClick={() => navigate('/properties')}
            className="flex items-center gap-3 text-white/80 hover:text-white transition-all uppercase text-[10px] font-bold tracking-[0.3em] backdrop-blur-md bg-black/20 px-6 py-3 rounded-full"
          >
            <ArrowLeft size={16} /> Return to Portfolio
          </button>
        </div>

        <div className="absolute bottom-20 left-0 w-full px-12 text-white">
           <div className="max-w-6xl mx-auto">
             <div className="flex items-center gap-4 mb-6">
                <span className="bg-[#C7A987] text-[#2D3321] px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">Off-Market Selection</span>
                <span className="flex items-center gap-2 text-sm italic font-serif text-[#C7A987]"><ShieldCheck size={16}/> Fully Verified Title</span>
             </div>
             <h1 className="text-7xl font-serif font-bold mb-6 tracking-tighter max-w-4xl">{property.title}</h1>
             <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 opacity-80 uppercase text-[11px] font-bold tracking-widest border-r border-white/20 pr-8">
                    <MapPin size={18} className="text-[#C7A987]" /> {property.neighborhood}, {property.location}
                </div>
                <div className="text-4xl font-serif text-[#C7A987]">{property.price?.toLocaleString()} MAD</div>
             </div>
           </div>
        </div>
      </header>

      {/* 2. SPECIFICATIONS GRID */}
      <section className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto grid grid-cols-4 divide-x divide-gray-100">
             <div className="py-12 px-10 text-center group hover:bg-[#F9F7F2]/50 transition-all cursor-default">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Internal Surface</p>
                <div className="flex items-center justify-center gap-3 text-[#2D3321]">
                   <Maximize size={20} className="text-[#C7A987]"/> <span className="text-2xl font-serif font-bold">{property.area_sqm} m²</span>
                </div>
             </div>
             <div className="py-12 px-10 text-center group hover:bg-[#F9F7F2]/50 transition-all cursor-default">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Suites</p>
                <div className="flex items-center justify-center gap-3 text-[#2D3321]">
                   <Bed size={20} className="text-[#C7A987]"/> <span className="text-2xl font-serif font-bold">{property.bedrooms} Rooms</span>
                </div>
             </div>
             <div className="py-12 px-10 text-center group hover:bg-[#F9F7F2]/50 transition-all cursor-default">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Restrooms</p>
                <div className="flex items-center justify-center gap-3 text-[#2D3321]">
                   <Bath size={20} className="text-[#C7A987]"/> <span className="text-2xl font-serif font-bold">{property.bathrooms} Baths</span>
                </div>
             </div>
             <div className="py-12 px-10 flex items-center justify-center gap-6">
                <button className="p-4 bg-gray-50 text-gray-400 rounded-full hover:bg-[#2D3321] hover:text-white transition-all"><Share2 size={20} /></button>
                <button className="flex-1 bg-[#2D3321] text-white py-4 px-6 rounded-2xl font-bold uppercase text-[11px] tracking-widest hover:bg-black transition-all shadow-xl">Contact Agent</button>
             </div>
          </div>
      </section>

      {/* 3. CORE AI ANALYSIS (Centerpiece) */}
      <div className="max-w-6xl mx-auto py-24 grid grid-cols-1 lg:grid-cols-12 gap-20">
         {/* ARTICLE SIDE */}
         <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-[#C7A987]/30">
               <div className="w-10 h-10 bg-[#2D3321] text-[#C7A987] rounded-xl flex items-center justify-center shadow-lg"><Sparkles size={20} /></div>
               <div>
                  <h3 className="text-lg font-serif font-bold text-[#2D3321]">Deep Asset Intelligence</h3>
                  <p className="text-[9px] uppercase font-bold text-gray-400 tracking-[0.2em]">Automated Expert Editorial</p>
               </div>
            </div>

            {aiArticle ? (
              <article className="prose prose-stone max-w-none 
                prose-headings:font-serif prose-headings:text-[#2D3321] prose-headings:mb-8 prose-headings:mt-12
                prose-p:text-[#2D3321]/80 prose-p:leading-[1.9] prose-p:text-lg prose-p:mb-8
                prose-table:border prose-table:rounded-2xl prose-table:overflow-hidden prose-table:bg-white
                prose-th:bg-[#F9F7F2] prose-th:p-5 prose-td:p-5">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiArticle.content}
                </ReactMarkdown>
              </article>
            ) : (
              <div className="bg-[#2D3321]/5 p-20 rounded-[2.5rem] border border-dashed border-[#2D3321]/10 text-center italic text-gray-400">
                Awaiting market analysis from our Intelligence Studio...
              </div>
            )}
         </div>

         {/* INTERACTIVE WIDGET SIDE */}
         <div className="lg:col-span-4 space-y-8">
            {/* STICKY LEAD CAPTURE WIDGET */}
            <div className="sticky top-12 space-y-8">
               <div className="bg-[#2D3321] text-[#F9F7F2] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                     <h4 className="text-2xl font-serif font-bold mb-6 tracking-tight">Need specific answers about this asset?</h4>
                     <p className="text-sm opacity-60 mb-8 leading-relaxed italic">Our Concierge Intelligence has analyzed the technical files and documents for this property.</p>
                     
                     <div className="bg-white/10 p-2 rounded-2xl border border-white/10 flex items-center mb-6">
                        <span className="flex-1 text-xs opacity-70 ml-3">Ask about tax, yield, or amenities...</span>
                        <div className="w-10 h-10 bg-[#C7A987] text-[#2D3321] rounded-xl flex items-center justify-center cursor-pointer shadow-lg shadow-[#C7A987]/20">
                            <Sparkles size={16} />
                        </div>
                     </div>

                     <a 
                      href={`https://wa.me/2126XXXXXXXX?text=I'm interested in ${property.title}`}
                      target="_blank"
                      className="w-full bg-[#C7A987] text-[#2D3321] py-5 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:bg-[#b69a7a]"
                     >
                        <MessageCircle size={20} /> Request VIP Briefing
                     </a>
                  </div>
                  {/* Subtle Background Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C7A987] blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2 rounded-full" />
               </div>

               {/* QUICK INVESTMENT FACTS */}
               <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm">
                  <h5 className="text-[10px] uppercase font-bold text-[#C7A987] mb-6 tracking-[0.3em]">Technical Security</h5>
                  <ul className="space-y-6">
                     <li className="flex items-center gap-4 text-[#2D3321] text-xs font-bold uppercase tracking-widest opacity-80"><CheckCircle2 size={16} className="text-[#C7A987]"/> Titre Foncier (VNA Ready)</li>
                     <li className="flex items-center gap-4 text-[#2D3321] text-xs font-bold uppercase tracking-widest opacity-80"><CheckCircle2 size={16} className="text-[#C7A987]"/> Energy Efficient Architecture</li>
                     <li className="flex items-center gap-4 text-[#2D3321] text-xs font-bold uppercase tracking-widest opacity-80"><CheckCircle2 size={16} className="text-[#C7A987]"/> Concierge Service Included</li>
                  </ul>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}