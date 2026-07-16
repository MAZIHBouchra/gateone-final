"use client";

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Sparkles, Loader2, FileText, Edit3, Save, 
  UploadCloud, Image as ImageIcon, X, Share2, 
  ExternalLink, CheckCircle2
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { propertiesApi } from '../../lib/api';
import { calculateLiveSEO } from '../../lib/seo_utils';

export default function AdminAIStudio() {
  // --- 1. TOUS LES ÉTATS (STATES) ---
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const [socialData, setSocialData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [propertyId, setPropertyId] = useState<string | null>(null);

  // MÉDIAS & SEO
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [seoData, setSeoData] = useState<any>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    intent: "Sale",
    type: "Luxury Villa",
    status: "available",
    location: "Marrakech",
    neighborhood: "",
    price: "",
    area_sqm: "",
    bedrooms: "",
    bathrooms: "",
    features: ""
  });
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  // --- 3. HANDLERS (ÉVÉNEMENTS) ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async () => {
    if (!formData.title || !formData.price) {
      alert("Please fill in at least the title and the price.");
      return;
    }

    setLoading(true);
    setGenerated(false);
    setSocialData(null);
    setAiData(null);

    try {
      const result = await propertiesApi.addWithAI(formData, selectedImage);
      const newId = result.property_id;
      setPropertyId(newId);

      let attempts = 0;
      const maxAttempts = 50;

      const checkAIContent = setInterval(async () => {
        attempts++;
        
        // 🚀 On récupère le token une seule fois au début de l'intervalle
        const token = localStorage.getItem('gateone_token');

        try {
          // 1. Fetch Article (SÉCURISÉ)
          const artRes = await fetch(`${API_BASE_URL}/properties/${newId}/ai-article?is_admin=true`, {
            headers: {
              "Authorization": `Bearer ${token}` // <--- CRUCIAL : Votre laissez-passer
            }
          });

          if (artRes.ok) {
            const artJson = await artRes.json();
            setAiData(artJson);
            setEditableContent(artJson.content);
            setGenerated(true);
          }

          // 2. Fetch Social Posts (SÉCURISÉ par cohérence)
          const socRes = await fetch(`${API_BASE_URL}/properties/${newId}/social-posts`, {
            headers: {
              "Authorization": `Bearer ${token}` // <--- Indispensable pour votre API sécurisée
            }
          });

          if (socRes.ok) {
            const socJson = await socRes.json();
            setSocialData(socJson);
            setLoading(false);
            clearInterval(checkAIContent);
          }

          if (attempts >= maxAttempts) {
            clearInterval(checkAIContent);
            setLoading(false);
            alert("Timeout: Generation completed partially.");
          }
        } catch (err) {
            // Ignorer les erreurs temporaires pendant que l'IA rédige
        }
      }, 4000);

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Marketing copy copied to clipboard!");
  };

  const handleSocialPublish = async (platform: string) => {
    setPublishingId(platform);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Strategy Synced: Content has been dispatched to the ${platform} API Gateway.`);
    } catch (err) {
      alert("Transmission error.");
    } finally {
      setPublishingId(null);
    }
  };
  
  const handleApproveAndStream = async () => {
  if (!propertyId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/approve-article`, {
      method: 'PUT',
      headers: { 
          'Accept': 'application/json',        // <-- Dis au serveur que tu veux du JSON
          'Content-Type': 'application/json',  // <-- Obligatoire pour le body
          "Authorization": `Bearer ${localStorage.getItem('gateone_token')}` 
      },
      // IMPORTANT : Assure-toi que editableContent contient bien du texte
      body: JSON.stringify({ content: editableContent || "" }) 
    });

    if (response.ok) {
      alert(" Final validation successful! The refined version is now streaming live.");
    } else {
      const errorDetail = await response.json();
      console.error("422 Details:", errorDetail); // Tu verras l'erreur précise ici
    }
  } catch (error) {
    console.error("Network crash:", error);
  }
};

  return (
    <AdminLayout>
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2D3321]">AI Content Studio</h1>
          <p className="text-gray-500 mt-1 italic">Real estate marketing industrialization</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Cloud Infrastructure Active
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* COLONNE GAUCHE : FORMULAIRE */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-serif mb-8 flex items-center gap-3 text-[#2D3321]">
              <div className="w-1 h-6 bg-[#C7A987]"></div> Property Details
            </h2>

            <div className="space-y-6">
              {/* LIGNE 1 : TITRE */}
              <div>
                <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Listing Title</label>
                <input name="title" value={formData.title} onChange={handleChange} type="text" placeholder="e.g. Sumptuous Villa" className="w-full border-b border-gray-100 py-2 outline-none focus:border-[#C7A987] text-sm bg-transparent" />
              </div>

              {/* LIGNE 2 : INTENT | TYPE | STATUS */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Intent</label>
                  <select name="intent" value={formData.intent} onChange={handleChange} className="w-full border-b border-gray-100 py-2 bg-transparent text-sm outline-none">
                    <option value="Sale">For Sale</option>
                    <option value="Rent">For Rent</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Type</label>
                  <select 
                   name="type" 
                   value={formData.type} 
                   onChange={handleChange} 
                   className="w-full border-b border-gray-100 py-2 bg-transparent text-sm outline-none"
                   >
                   <option value="villa">Luxury Villa</option>
                   <option value="riad">Historic Riad</option>
                   <option value="palace">Royal Palace</option>
                   <option value="penthouse">Prestige Penthouse</option>
                   <option value="apartment">Luxury Apartment</option>
                   <option value="land">Investment Land</option>
                   <option value="other">Exceptional Estate</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full border-b border-gray-100 py-2 bg-transparent text-sm outline-none font-bold text-[#C7A987]">
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>

              {/* LIGNE 3 : PRICE | CITY | NEIGHBORHOOD */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Price</label>
                  <input name="price" value={formData.price} onChange={handleChange} type="number" className="w-full border-b border-gray-100 py-2 outline-none text-sm bg-transparent" />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">City</label>
                  <input name="location" value={formData.location} onChange={handleChange} type="text" placeholder="Marrakech" className="w-full border-b border-gray-100 py-2 outline-none text-sm bg-transparent" />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Neighborhood</label>
                  <input name="neighborhood" value={formData.neighborhood} onChange={handleChange} type="text" placeholder="e.g. Palmeraie" className="w-full border-b border-gray-100 py-2 outline-none text-sm bg-transparent" />
                </div>
              </div>

              {/* LIGNE 4 : AREA | BEDROOMS | BATHROOMS */}
              <div className="grid grid-cols-3 gap-4 p-5 bg-[#F9F7F2]/50 rounded-2xl border border-[#C7A987]/10">
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Area (sqm)</label>
                  <input name="area_sqm" value={formData.area_sqm} onChange={handleChange} type="number" className="w-full bg-transparent border-b border-gray-200 py-1 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Bedrooms</label>
                  <input name="bedrooms" value={formData.bedrooms} onChange={handleChange} type="number" className="w-full bg-transparent border-b border-gray-200 py-1 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Bathrooms</label>
                  <input name="bathrooms" value={formData.bathrooms} onChange={handleChange} type="number" className="w-full bg-transparent border-b border-gray-200 py-1 text-sm outline-none" />
                </div>
              </div>

              {/* UPLOAD PHOTO ZONE */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1 flex items-center gap-2">
                  <ImageIcon size={14} className="text-[#C7A987]" /> Featured Visual (Module 9)
                </label>
                <div className={`relative group border-2 border-dashed rounded-[2rem] p-6 transition-all flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden
                  ${previewUrl ? 'border-[#C7A987] bg-[#F9F7F2]/50' : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-[#C7A987]/30'}`}>

                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 z-20 cursor-pointer" onChange={handleImageChange} />

                  {previewUrl ? (
                    <div className="flex items-center gap-4 text-left w-full">
                      <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-xl shadow-lg border-2 border-white" />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[11px] font-bold text-[#2D3321] truncate">{selectedImage?.name}</p>
                        <p className="text-[9px] text-[#C7A987] font-bold uppercase tracking-widest mt-1">Image Loaded ✓</p>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setSelectedImage(null); }} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-all">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="py-2">
                      <div className="w-10 h-10 bg-white rounded-2xl shadow-sm text-gray-300 group-hover:text-[#C7A987] transition-all flex items-center justify-center mx-auto mb-2">
                        <ImageIcon size={18} />
                      </div>
                      <p className="text-xs font-bold text-[#2D3321]">Click to upload villa visual</p>
                    </div>
                  )}
                </div>
              </div>

              {/* LIGNE 6 : KEY FEATURES */}
              <div>
                <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Key Features (AI Input)</label>
                <textarea name="features" value={formData.features} onChange={handleChange} rows={3} placeholder="Infinity pool, marble finishes..." className="w-full mt-2 p-4 bg-gray-50 rounded-2xl border-none outline-none text-xs focus:ring-1 focus:ring-[#C7A987]" />
              </div>

              {/* BOUTON GÉNÉRER */}
              <button onClick={handleGenerate} disabled={loading} className="w-full bg-[#2D3321] hover:bg-black text-[#F9F7F2] py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                {loading ? "PROCESSING ASSETS..." : "GENERATE FULL MARKETING PACK"}
              </button>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : PREVIEW */}
        <div className="lg:col-span-7">
          {!generated ? (
            <div className="h-full min-h-[600px] border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-400 bg-white/30 text-center px-10">
              <Sparkles size={40} className="opacity-10 text-[#C7A987] mb-4" />
              <p className="text-xs italic">Complete the technical characteristics on the left to start AI generation.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-1000">
              {/* DIGITAL AUTHORITY PACK */}
              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative">
                <div className="absolute top-8 right-10">
                  <span className="bg-[#C7A987]/10 text-[#C7A987] px-4 py-1.5 rounded-full text-[9px] font-bold uppercase border border-[#C7A987]/20">Luxury Standard : Active</span>
                </div>
                <h3 className="text-xl font-serif text-[#2D3321] mb-8 flex items-center gap-3">
                  <FileText className="text-[#C7A987]" size={22} /> Digital Authority Pack
                </h3>

                <div className="bg-[#F9F7F2]/50 p-8 rounded-[2rem] min-h-[500px] overflow-auto border border-[#C7A987]/10">
                  {isEditing ? (
                    <textarea
                      value={editableContent}
                      onChange={(e) => {
                        const newText = e.target.value;
                        setEditableContent(newText);
                        const newAnalysis = calculateLiveSEO(newText, formData.title);
                        setAiData((prev: any) => ({
                          ...prev,
                          seo_analysis: newAnalysis,
                        }));
                      }}
                      className="w-full h-[500px] bg-transparent border-none outline-none focus:ring-0 text-sm leading-relaxed font-mono text-[#2D3321]"
                    />
                  ) : (
                    <article className="prose prose-sm md:prose-base prose-stone max-w-none prose-headings:font-serif prose-headings:text-[#2D3321] prose-p:text-[#2D3321]/90">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {editableContent}
                      </ReactMarkdown>
                    </article>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50 flex justify-end gap-5">
                  <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400 hover:text-[#C7A987] transition-all">
                    {isEditing ? <Save size={14} /> : <Edit3 size={14} />}
                    {isEditing ? "SAVE MANUAL EDITS" : "MODIFY RAW CONTENT"}
                  </button>
                  <button 
  onClick={handleApproveAndStream} // <-- On branche la fonction ici
  disabled={loading}
  className="text-[#C7A987] text-[10px] font-bold uppercase border border-[#C7A987] px-8 py-3 rounded-2xl hover:bg-[#C7A987] hover:text-white transition-all shadow-md active:scale-95 flex items-center gap-2"
>
  {loading ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
  Approve & Stream to Site
</button>
                </div>
              </div>

              {/* SOCIAL CARDS */}
              <div className="grid grid-cols-2 gap-6 pb-20">
                {/* INSTAGRAM CARD */}
                <div className="bg-[#2D3321] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                  <h4 className="text-[9px] font-bold uppercase text-[#C7A987] mb-6 tracking-widest flex justify-between">
                    Instagram Content
                    <span className="opacity-40 italic">#Engagement_Optimized</span>
                  </h4>

                  {!socialData ? <Loader2 className="animate-spin text-[#C7A987]" /> : (
                    <>
                      <p className="text-xs opacity-80 leading-relaxed whitespace-pre-wrap h-40 overflow-auto pr-4 mb-6 italic border-l-2 border-[#C7A987]/30 pl-4">
                        {socialData.instagram}
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => copyToClipboard(socialData.instagram)}
                          className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl text-[10px] font-bold uppercase hover:bg-[#C7A987] hover:text-[#2D3321] transition-all"
                        >
                          Copy Content
                        </button>
                        <button className="p-3 bg-[#C7A987] text-[#2D3321] rounded-xl hover:scale-105 transition-all shadow-lg">
                          <Share2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* FACEBOOK CARD */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl relative group">
                  <h4 className="text-[9px] font-bold uppercase text-gray-400 mb-6 tracking-widest flex justify-between">
                    Facebook Insight
                    <span className="text-[#C7A987] font-bold underline cursor-pointer">Preview Post</span>
                  </h4>

                  {!socialData ? <Loader2 className="animate-spin text-gray-200" /> : (
                    <>
                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap h-40 overflow-auto pr-4 mb-6 border-l-2 border-gray-100 pl-4">
                        {socialData.facebook}
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => copyToClipboard(socialData.facebook)}
                          className="flex-1 bg-gray-50 text-[#2D3321] py-3 rounded-xl text-[10px] font-bold uppercase border border-gray-100 hover:bg-[#2D3321] hover:text-white transition-all"
                        >
                          Prepare Briefing
                        </button>
                        <button className="bg-[#2D3321] text-white px-5 rounded-xl text-[10px] font-bold uppercase flex items-center gap-2 hover:bg-black transition-all">
                          Publish <ExternalLink size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* SEO AUDIT PANEL */}
              {aiData?.seo_analysis && (
                <div className="mt-12 bg-[#2D3321] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#C7A987]/10 blur-[80px] rounded-full" />

                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="max-w-md">
                      <h4 className="text-[#C7A987] text-[9px] font-bold uppercase tracking-[0.4em] mb-4">
                        Strategic Marketing Audit
                      </h4>
                      <h3 className="text-4xl font-serif font-bold mb-4 leading-tight">
                        Search Authority
                      </h3>
                      <p className="text-xs text-white/50 leading-relaxed italic">
                        High-performance analysis based on Marrakech market velocity.
                        Current Grade:
                        <span className={`font-bold ${aiData.seo_analysis.total_score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {" "}{aiData.seo_analysis.grade}
                        </span>
                      </p>
                    </div>

                    <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                        <circle
                          cx="64" cy="64" r="58"
                          stroke="currentColor" strokeWidth="8" fill="transparent"
                          strokeDasharray="364.4"
                          strokeDashoffset={364.4 - (364.4 * aiData.seo_analysis.total_score) / 100}
                          className={`transition-all duration-[1500ms] ${aiData.seo_analysis.total_score >= 80 ? 'text-emerald-400' : 'text-amber-500'}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-serif font-bold">{Math.round(aiData.seo_analysis.total_score)}%</span>
                        <span className="text-[7px] uppercase font-bold tracking-widest text-[#C7A987] mt-1">SEO Integrity</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-12 gap-y-6 mt-10 border-t border-white/5 pt-8">
                    {aiData.seo_analysis.details.map((check: any, i: number) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 shadow-sm
                          ${check.status === "excellent" ? "bg-emerald-400 shadow-emerald-400/40" : check.status === "good" ? "bg-amber-400" : "bg-rose-400"}`}
                        />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">{check.label}</p>
                          <p className="text-[11px] text-[#C7A987] font-serif italic leading-tight">{check.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ESPACE DE SÉCURITÉ EN BAS */}
              <div className="h-20" />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
