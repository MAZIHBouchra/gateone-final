"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertiesApi } from '../../lib/api';
import { Save, RefreshCcw, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminEditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // ÉTATS DE GESTION (Il manquait 'saving' ici !)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); 
  const [isSyncing, setIsSyncing] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    // On pré-remplit le formulaire avec les données actuelles
    if (id) {
        propertiesApi.getById(id).then(data => {
            setFormData({
        ...data, // On prend tout
        // Mais on s'assure que les noms collent à tes inputs 'name=""'
        intent: data.intent || "Sale",
        features: data.description || "", // On mappe 'description' de la DB vers 'features'
        price: data.price ? data.price.toString() : "",
        area_sqm: data.area_sqm ? data.area_sqm.toString() : "",
        bedrooms: data.bedrooms ? data.bedrooms.toString() : "",
        bathrooms: data.bathrooms ? data.bathrooms.toString() : "",
            });
            setLoading(false);
        }).catch(err => {
            console.error("Error fetching data:", err);
            setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev: any) => ({
        ...prev,      
        [name]: value 
    }));
  };

  const handleQuickSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
        const response = await propertiesApi.update(id, formData);
        
        if (response.ok) {
            alert("Success! Asset specifications have been refined.");
            navigate('/admin/properties'); // Redirection après succès
        } else {
            const error = await response.json();
            alert("Error: " + JSON.stringify(error.detail));
        }
    } catch (err) {
        alert("Server communication error.");
    } finally {
        setSaving(false);
    }
 };

  const handleSmartSync = async () => {
    // Validation de sécurité
    if (window.confirm("High Impact Action: This will overwrite your existing Expert Article and Social Posts. Proceed?")) {
       setIsSyncing(true); // Active le loader spécial IA
       try {
         const res = await propertiesApi.syncAI(id!, formData);
         
         if (res.ok) {
            alert("🚀 Market Intelligence Refreshing! Mistral Large is now analyzing your technical updates in the background.");
            navigate('/admin/properties'); 
         } else {
            alert("Transmission error between the Sync Broker and AI Engine.");
         }
       } catch (err) {
         console.error(err);
       } finally {
         setIsSyncing(false);
       }
    }
  };

  if (loading || !formData) return (
      <div className="h-screen flex items-center justify-center bg-[#F9F7F2]">
          <div className="flex items-center gap-3 text-[#C7A987] font-serif italic text-lg">
             <Loader2 className="animate-spin" /> Accessing asset coordinates...
          </div>
      </div>
  );


  return (
   <AdminLayout>
    <div className="mb-10 flex justify-between items-center">
      <button onClick={() => navigate('/admin/properties')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#C7A987] transition-all">
        <ArrowLeft size={14}/> Back to property portfolio
      </button>
      <div className="text-right">
          <h1 className="text-3xl font-serif font-bold text-[#2D3321]">Refine Asset Intelligence</h1>
          <p className="text-[10px] text-[#C7A987] uppercase tracking-[0.3em] font-bold mt-1">Property UUID: {id?.slice(0,8)}...</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      
      {/* SECTION GAUCHE : FORMULAIRE ÉDITABLE */}
      <div className="lg:col-span-7 bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
         <div>
              <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Listing Title</label>
              <input name="title" value={formData.title} onChange={handleChange} type="text" className="w-full border-b border-gray-100 py-3 outline-none focus:border-[#C7A987] text-sm font-bold text-[#2D3321] bg-transparent" />
         </div>

         <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Intent</label>
              <select name="intent" value={formData.intent} onChange={handleChange} className="w-full border-b border-gray-100 py-2 bg-transparent text-sm">
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
               <option value="Luxury Villa">Luxury Villa</option>
               <option value="Historic Riad">Historic Riad</option>
               <option value="Royal Palace">Royal Palace (Palais)</option>
               <option value="Prestige Penthouse">Prestige Penthouse</option>
               <option value="Luxury Apartment">Luxury Apartment</option>
               <option value="Strategic Land">Investment Land (Terrain)</option>
               <option value="Other">Other / Exceptional Estate</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full border-b border-gray-100 py-2 bg-transparent text-sm font-bold text-[#C7A987]">
                 <option value="available">Available</option>
                 <option value="sold">Sold</option>
              </select>
            </div>
         </div>

         <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Price (MAD)</label>
                <input name="price" value={formData.price} onChange={handleChange} type="number" className="w-full border-b border-gray-100 py-2 text-sm font-bold" />
              </div>
              <div>
                <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">City</label>
                <input name="location" value={formData.location} onChange={handleChange} type="text" className="w-full border-b border-gray-100 py-2 text-sm" />
              </div>
              <div>
                <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Neighborhood</label>
                <input name="neighborhood" value={formData.neighborhood} onChange={handleChange} type="text" className="w-full border-b border-gray-100 py-2 text-sm" />
              </div>
         </div>

         <div className="grid grid-cols-3 gap-6 p-8 bg-[#F9F7F2]/60 rounded-3xl border border-[#C7A987]/10">
            <div>
               <label className="text-[9px] uppercase font-bold text-gray-400 mb-1 block">Internal Area</label>
               <input name="area_sqm" value={formData.area_sqm} onChange={handleChange} className="w-full bg-transparent border-b border-gray-200 text-sm py-1 font-bold" />
            </div>
            <div>
               <label className="text-[9px] uppercase font-bold text-gray-400 mb-1 block">Bedrooms</label>
               <input name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full bg-transparent border-b border-gray-200 text-sm py-1 font-bold" />
            </div>
            <div>
               <label className="text-[9px] uppercase font-bold text-gray-400 mb-1 block">Bathrooms</label>
               <input name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full bg-transparent border-b border-gray-200 text-sm py-1 font-bold" />
            </div>
         </div>

         <div>
            <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Property Description Features</label>
            <textarea name="features" value={formData.features} onChange={handleChange} rows={6} className="w-full mt-4 p-6 bg-gray-50 rounded-3xl border-none outline-none text-xs leading-relaxed italic text-gray-500" />
         </div>
      </div>

      {/* SECTION DROITE : ACTIONS STRATÉGIQUES */}
      <div className="lg:col-span-5 animate-in fade-in slide-in-from-right-4 duration-700">
         <div className="bg-[#2D3321] p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden h-fit">
            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Sparkles size={180} /></div>
            <div className="relative z-10">
                <h3 className="text-3xl font-serif mb-6 tracking-tight">Curation Strategy</h3>
                <p className="text-sm text-white/50 leading-relaxed mb-12 italic">
                  Refining technical specifications updates the legal registry. Decide how this affects the digital marketing assets:
                </p>
                
                <div className="space-y-6">
                   <button 
                      onClick={handleQuickSave} 
                      disabled={saving}
                      className="group w-full bg-white/5 border border-white/20 py-6 rounded-3xl font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white hover:text-[#2D3321] transition-all duration-300"
                   >
                      {saving ? <Loader2 className="animate-spin" /> : <Save size={18} className="text-[#C7A987] group-hover:text-[#2D3321]" />}
                      Update Asset Credentials
                   </button>

                   <button 
   onClick={handleSmartSync} 
   disabled={isSyncing}
   className="w-full bg-[#C7A987] text-[#2D3321] py-6 rounded-3xl font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
>
   {isSyncing ? <Loader2 className="animate-spin" /> : <RefreshCcw size={18} />}
   {isSyncing ? "SYNC IN PROGRESS..." : "Relaunch Intelligence Sync"}
</button>
                </div>

                <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                    <div className="w-2 h-2 bg-[#C7A987] rounded-full animate-pulse"></div>
                    <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Secured Edit Environment active</p>
                </div>
            </div>
         </div>
      </div>
    </div>
   </AdminLayout>
 );
};