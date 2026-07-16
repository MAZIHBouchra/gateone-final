"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertiesApi } from '@/lib/api';
import Navbar from '@/components/public/Navbar';
import { 
  MapPin, Maximize, Bed, Bath, ArrowLeft, 
  MessageCircle, Sparkles, CheckCircle2, ShieldCheck, Share2, Lock,
  Download, Loader2, Clock // Ajout de l'icône manquante
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [aiArticle, setAiArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Récupération du token pour usage dans les fonctions
  
  
 
  const clientId = localStorage.getItem('client_id');
  
  const authToken = localStorage.getItem('gateone_token');
  const isLoggedIn = !!authToken;
  const userRole = localStorage.getItem('gateone_role');
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  

useEffect(() => {
    async function loadFullExperience() {
      try {
        const authToken = localStorage.getItem('gateone_token');
        const storedClientId = localStorage.getItem('client_id');

        // 1. Charger les données du bien
        const res = await fetch(`${API_BASE_URL}/api/properties/${id}`);
        if (res.ok) {
            const propData = await res.json();
            setProperty(propData);

            // 🚀 --- C'EST ICI QU'ON AJOUTE LE TRACKING ---
            
            console.log("🛠 Debug Identity Check:", storedClientId);
            
            // On ne tracke que si on a un ID client et une Villa valide
            if (storedClientId && id && authToken) {
                console.log("⚡ Triggering behavioral signal for Lead...");
                
                // On utilise propertiesApi ou leadsApi selon le nom choisi dans ton api.ts
                propertiesApi.trackAction(storedClientId, "view_property", id)
                    .then(() => console.log("📊 UI Confirmation: Signal archived in Lead Hub."))
                    .catch(e => console.error("Analytics failure:", e));
            }
            // --------------------------------------------
            
            // 2. Charger l'article (on réutilise le token client)
            const artRes = await fetch(`${API_BASE_URL}/api/properties/${id}/ai-article`, {
                headers: { "Authorization": `Bearer ${authToken}` }
            });
            if (artRes.ok) {
                const artJson = await artRes.ok ? await artRes.json() : null;
                setAiArticle(artJson);
            }
        }
      } catch (err) {
        console.error("Critical Architecture Failure:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFullExperience();
}, [id]);

  const handleWhatsApp = async () => {
    window.open(`https://wa.me/212618688888?text=I am interested in ${property?.title}`);
    
    if (isLoggedIn) {
      try {
        await fetch(`${API_BASE_URL}/api/leads/interaction`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({ 
             lead_id: localStorage.getItem('client_id'), // On envoie l'ID pour le score
             action: "click_whatsapp" 
          })
        });
      } catch (err) {}
    }
  };
  
  const handleDownloadPDF = async () => {
  if (!isLoggedIn) {
    navigate('/investor/signup');
    return;
  }
  
  try {
    const token = localStorage.getItem('gateone_token');
    const res = await fetch(
      `${API_BASE_URL}/api/properties/${property.id}/pdf-brief`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error('PDF generation failed');
    
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GateOne_${property.title}_Brief.pdf`;
    a.click();
    
    // Tracking du score
    fetch(`${API_BASE_URL}/api/leads/interaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        lead_id: localStorage.getItem('client_id'),
        action_type: 'download_pdf',
        property_id: property.id
      })
    });
  } catch (err) {
    alert('PDF generation failed. Please try again.');
  }
};

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-MA').format(price);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FDFCF9]">
        <div className="flex flex-col items-center gap-6">
            <Loader2 className="animate-spin text-[#5DA9E9]" size={40} />
            <div className="text-[#C7A987] font-serif text-xl italic animate-pulse">Curating Luxury Experience...</div>
        </div>
    </div>
  );

  if (!property) return (
    <div className="h-screen flex items-center justify-center bg-[#FDFCF9]">
        <div className="text-center">
            <h2 className="text-2xl font-serif font-bold text-[#0B1F33]">Estate Coordinates not found.</h2>
            <button onClick={() => navigate('/properties')} className="mt-4 text-[#5DA9E9] underline font-bold uppercase text-xs tracking-widest">Back to Portfolio</button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCF9]">
      <Navbar />
      
      {/* 1. CINEMATIC HEADER */}
      <header className="relative min-h-[85vh] w-full overflow-hidden flex flex-col">
        <img 
            src={property.thumbnail_url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000"} 
            className="absolute inset-0 w-full h-full object-cover" 
            alt={property.title} 
            loading="lazy"
        />
        <div className="absolute inset-0 bg-[#0B1F33]/60 backdrop-brightness-75" />
        
        <div className="h-32 w-full relative z-20"></div>

        <div className="relative z-10 flex-1 flex flex-col justify-end pb-20 px-6 md:px-12">
            <div className="max-w-6xl mx-auto w-full">
            <div className="mb-8">
                <button 
                onClick={() => navigate('/properties')}
                className="inline-flex items-center gap-3 text-white/70 hover:text-white transition-all uppercase text-[9px] font-bold tracking-[0.2em] backdrop-blur-md bg-white/5 border border-white/10 px-5 py-2.5 rounded-full"
                >
                <ArrowLeft size={14} /> Return to Portfolio
                </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <span className="bg-[#5DA9E9] text-white px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg">
                    Premium Curation
                </span>
                <span className="flex items-center gap-2 text-sm italic font-serif text-[#5DA9E9]">
                    <ShieldCheck size={16}/> Certified Verification
                </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-8 tracking-tighter leading-tight max-w-5xl">
                {property.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 text-white">
                <div className="flex items-center gap-2 text-white/60 uppercase text-[11px] font-bold tracking-[0.2em] border-r-0 md:border-r border-white/20 pr-0 md:pr-8">
                    <MapPin size={18} className="text-[#5DA9E9]" /> {property.neighborhood}, {property.location}
                </div>
                <div className="text-3xl md:text-4xl font-serif text-[#5DA9E9] font-bold">
                    {formatPrice(property.price)} <span className="text-xs uppercase opacity-40 ml-1">MAD</span>
                </div>
            </div>
            </div>
        </div>
      </header>

      {/* 2. SPECIFICATIONS */}
      <section className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
             <div className="py-12 px-10 text-center hover:bg-gray-50/30 transition-all cursor-default">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Total Surface</p>
                <div className="flex items-center justify-center gap-3 text-[#0B1F33]">
                   <Maximize size={20} className="text-[#5DA9E9]"/> <span className="text-2xl font-serif font-bold">{property.area_sqm} m²</span>
                </div>
             </div>
             <div className="py-12 px-10 text-center hover:bg-gray-50/30 transition-all cursor-default">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Private Rooms</p>
                <div className="flex items-center justify-center gap-3 text-[#0B1F33]">
                   <Bed size={20} className="text-[#5DA9E9]"/> <span className="text-2xl font-serif font-bold">{property.bedrooms} Beds</span>
                </div>
             </div>
             <div className="py-12 px-10 text-center hover:bg-gray-50/30 transition-all cursor-default">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Bathrooms</p>
                <div className="flex items-center justify-center gap-3 text-[#0B1F33]">
                   <Bath size={20} className="text-[#5DA9E9]"/> <span className="text-2xl font-serif font-bold">{property.bathrooms || 0} Units</span>
                </div>
             </div>
             <div className="py-12 px-10 flex items-center justify-center gap-6 bg-[#FDFCF9]">
                <button 
                 onClick={() => {
                   navigator.clipboard.writeText(window.location.href);
                   alert('Property link copied to clipboard!');
                 }}
                 className="p-4 text-gray-300 hover:text-[#5DA9E9] transition-all"
                 >
                 <Share2 size={20} />
                </button>
             </div>
          </div>
      </section>

      {/* 3. CONTENT AREA : IA ARTICLE vs LOCK */}
      <div className="max-w-6xl mx-auto py-24 grid grid-cols-1 lg:grid-cols-12 gap-20">
         <div className="lg:col-span-8">
  {loading ? (
      <div className="py-20 text-center text-[#C7A987] italic">Consulting market analysis...</div>
  ) : !aiArticle ? (
      /* SI L'IA N'EST PAS CHARGÉE */
      !authToken ? (
        /* CAS A : TOTALEMENT DÉCONNECTÉ */
        <div className="bg-[#0B1F33] p-16 rounded-[3rem] text-center text-white">
          <Lock size={40} className="mx-auto mb-6 text-[#5DA9E9] opacity-30" />
          <h2 className="text-3xl font-serif font-bold italic mb-6">Investor ROI analysis is locked.</h2>
          <button onClick={() => navigate('/investor/signup')} className="bg-[#5DA9E9] text-white px-10 py-4 rounded-full">JOIN TO UNLOCK</button>
        </div>
      ) : (
        /* CAS B : CONNECTÉ MAIS ARTICLE NON PUBLIÉ OU EN COURS */
        <div className="bg-white/50 border border-dashed border-[#0B1F33]/10 p-16 rounded-[3rem] text-center">
           <Clock size={40} className="mx-auto mb-6 text-[#C6A77D] opacity-40" />
           <h3 className="text-2xl font-serif font-bold text-[#0B1F33] mb-3">
               Identity Verified
           </h3>
           <p className="italic text-gray-400">
             This analysis is being refined by our experts...
           </p>
        </div>
      )
  ) : (
      /* CAS C : SUCCÈS (ARTICLE AFFICHÉ) */
      <article className="prose ...">
         <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiArticle.content}</ReactMarkdown>
      </article>
  )}
</div>

         {/* 4. SIDEBAR ACTIONS */}
         <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-16 space-y-6">
               <div className="bg-[#0B1F33] text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 space-y-10">
                     <div>
                        <h4 className="text-2xl font-serif font-bold tracking-tight italic mb-3 text-white">Private Curation.</h4>
                        <p className="text-[10px] opacity-50 uppercase tracking-[0.2em] font-bold">Priority contact for UHNW portfolios</p>
                     </div>
                     <button
                      onClick={handleWhatsApp}
                      className="w-full bg-[#5DA9E9] text-white py-6 rounded-3xl font-bold uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-4 hover:scale-[1.03] transition-all shadow-xl active:scale-95"
                     >
                        <MessageCircle size={24} /> Join VIP Chat
                     </button>
                  </div>
               </div>

               <button
                 onClick={handleDownloadPDF}
                 className="w-full border-2 border-[#0B1F33]/5 text-[#0B1F33]/40 hover:text-[#0B1F33] hover:border-[#0B1F33] py-5 rounded-[2.2rem] font-bold uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-3"
                 >
                 {isLoggedIn 
                  ? <><Download size={14} className="text-[#C7A987]"/> Full Investment Portfolio (PDF)</>
                  : <><Lock size={14}/> Member Dossier Access</>
                 }
              </button>
            </div>
         </div>
      </div>
    </div>
  );
}