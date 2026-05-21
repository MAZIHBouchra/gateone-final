"use client";

import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle, 
  Loader2, 
  FileText, 
  Users, 
  Shield, 
  Car, 
  MapPin,
  Accessibility
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { propertiesApi } from '../../lib/api';

export default function AdminAIStudio() {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [aiData, setAiData] = React.useState<any>(null);

  // ÉTAT DES DONNÉES : Aligné avec le schéma PropertyCreate du Backend
  const [formData, setFormData] = useState({
    title: "",
    intent: "Sale",
    type: "Luxury Villa",
    location: "",
    price: "",
    plot_size: "",
    area_sqm: "", // Changé de built_size pour correspondre au backend
    bedrooms: "",
    bathrooms: "",
    staff_rooms: "",
    parking: "",
    security: "",
    distance_center: "",
    accessibility: "",
    features: "" // Contient les atouts clés
  });

  // Gestionnaire de changement universel
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
  if (!formData.title || !formData.price) {
    alert("Veuillez remplir au moins le titre et le prix.");
    return;
  }

  setLoading(true); // On commence le chargement
  try {
    // 1. Appel initial : Création du bien et lancement de l'IA en tâche de fond
    const result = await propertiesApi.addWithAI(formData);
    const newPropertyId = result.property_id;
    console.log("Villa créée avec l'ID:", newPropertyId);

    // 2. Mise en place du Polling pour récupérer le contenu IA
    let attempts = 0;
    const maxAttempts = 20; // On attend max 60 secondes (20 * 3s)

    const checkAIContent = setInterval(async () => {
      attempts++;
      console.log(`Vérification IA (Tentative ${attempts})...`);

      try {
        // On appelle ta route de récupération d'article
        const response = await fetch(`http://localhost:8000/api/properties/${newPropertyId}/ai-article`);
        
        if (response.ok) {
          const aiResult = await response.json();
          
          // SUCCESS : L'IA a fini !
          setAiData(aiResult); // On stocke les données (article + meta)
          setGenerated(true);   // On affiche la zone de preview
          setLoading(false);    // On arrête le spinner
          clearInterval(checkAIContent); // On arrête de boucler
          console.log(" Contenu IA reçu !");
        } 
        else if (attempts >= maxAttempts) {
          // TIMEOUT : Trop long
          clearInterval(checkAIContent);
          setLoading(false);
          alert("L'IA prend plus de temps que prévu. Vous pourrez voir l'article dans la liste des propriétés d'ici une minute.");
        }
      } catch (err) {
        // Le serveur ne répond pas encore, on laisse la boucle continuer
      }
    }, 3000); // On vérifie toutes les 3 secondes

  } catch (error) {
    console.error("Erreur :", error);
    setLoading(false);
    alert("Erreur lors de la création du bien.");
  }
  // Note : on retire setLoading(false) d'ici car on veut qu'il reste 
  // en chargement tant que l'IA n'a pas répondu.
};

  return (
    <AdminLayout>
      {/* HEADER */}
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2D3321]">AI Content Studio</h1>
          <p className="text-gray-500 mt-1 italic">Industrialisation du marketing immobilier via l'IA Mistral Pro.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Infrastructure Cloud Active
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* COLONNE GAUCHE : SAISIE TECHNIQUE */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-serif mb-8 flex items-center gap-3 text-[#2D3321]">
              <div className="w-1 h-6 bg-[#C7A987]"></div> Caractéristiques du Bien
            </h2>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Titre Commercial</label>
                  <input name="title" value={formData.title} onChange={handleChange} type="text" placeholder="Villa Jade Targa" className="w-full border-b border-gray-100 py-2 outline-none focus:border-[#C7A987] transition-all text-sm bg-transparent" />
                </div>
                <div>
                    <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Intention</label>
                    <select name="intent" value={formData.intent} onChange={handleChange} className="w-full border-b border-gray-100 py-2 bg-transparent text-sm outline-none">
                        <option value="Sale">À Vendre</option>
                        <option value="Rent">À Louer</option>
                    </select>
                </div>
                <div>
                    <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full border-b border-gray-100 py-2 bg-transparent text-sm outline-none">
                        <option value="Luxury Villa">Luxury Villa</option>
                        <option value="Riad">Riad</option>
                        <option value="Apartment">Apartment</option>
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Prix (MAD)</label>
                  <input name="price" value={formData.price} onChange={handleChange} type="number" placeholder="8500000" className="w-full border-b border-gray-100 py-2 outline-none text-sm bg-transparent" />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Quartier</label>
                  <input name="location" value={formData.location} onChange={handleChange} type="text" placeholder="Hivernage" className="w-full border-b border-gray-100 py-2 outline-none text-sm bg-transparent" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-5 bg-[#F9F7F2]/50 rounded-2xl border border-[#C7A987]/10">
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Terrain (m²)</label>
                  <input name="plot_size" value={formData.plot_size} onChange={handleChange} type="text" placeholder="1200" className="w-full bg-transparent border-b border-gray-200 py-1 outline-none text-sm" />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Habitable (m²)</label>
                  <input name="area_sqm" value={formData.area_sqm} onChange={handleChange} type="text" placeholder="450" className="w-full bg-transparent border-b border-gray-200 py-1 outline-none text-sm" />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Chambres</label>
                  <input name="bedrooms" value={formData.bedrooms} onChange={handleChange} type="number" className="w-full bg-transparent border-b border-gray-200 py-1 outline-none text-sm" />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Salles de Bain</label>
                  <input name="bathrooms" value={formData.bathrooms} onChange={handleChange} type="number" className="w-full bg-transparent border-b border-gray-200 py-1 outline-none text-sm" />
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest flex items-center gap-1"><Users size={10}/> Personnel</label>
                        <input name="staff_rooms" value={formData.staff_rooms} onChange={handleChange} type="text" placeholder="1 suite" className="w-full border-b border-gray-100 py-1 outline-none text-xs bg-transparent" />
                    </div>
                    <div className="flex-1">
                        <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest flex items-center gap-1"><Shield size={10}/> Sécurité</label>
                        <input name="security" value={formData.security} onChange={handleChange} type="text" placeholder="CCTV, 24/7" className="w-full border-b border-gray-100 py-1 outline-none text-xs bg-transparent" />
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest flex items-center gap-1"><Car size={10}/> Parking</label>
                        <input name="parking" value={formData.parking} onChange={handleChange} type="text" placeholder="2 places" className="w-full border-b border-gray-100 py-1 outline-none text-xs bg-transparent" />
                    </div>
                    <div className="flex-1">
                        <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest flex items-center gap-1"><Accessibility size={10}/> Accès</label>
                        <input name="accessibility" value={formData.accessibility} onChange={handleChange} type="text" placeholder="PMR" className="w-full border-b border-gray-100 py-1 outline-none text-xs bg-transparent" />
                    </div>
                 </div>
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Atouts Clés (Matériaux, Vue, etc.)</label>
                <textarea name="features" value={formData.features} onChange={handleChange} rows={3} placeholder="Marbre italien, Piscine, Panneaux solaires..." className="w-full mt-2 p-4 bg-gray-50 rounded-2xl border-none outline-none text-xs focus:ring-1 focus:ring-[#C7A987]" />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-[#2D3321] hover:bg-black text-[#F9F7F2] py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                {loading ? "ANALYSE ET RÉDACTION..." : "GÉNÉRER LE PACK MARKETING"}
              </button>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : PREVIEW */}
        <div className="lg:col-span-7">
          {!generated ? (
            <div className="h-full min-h-[600px] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 bg-white/30">
               <Sparkles size={40} className="opacity-10 text-[#C7A987] mb-4" />
               <p className="text-xs italic text-center px-10">Veuillez compléter les spécifications pour lancer l'IA.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-1000">
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 relative">
                <div className="absolute top-6 right-8">
                   <span className="bg-[#C7A987] text-white px-3 py-1 rounded-md text-[9px] font-bold uppercase">Yoast SEO : Ready</span>
                </div>
                <h3 className="text-xl font-serif text-[#2D3321] mb-6 flex items-center gap-2">
                   <FileText className="text-[#C7A987]" size={20} /> Article Expert
                </h3>
                <div className="text-xs text-gray-600 leading-relaxed italic bg-[#F9F7F2]/30 p-6 rounded-2xl">
                  [L'article de 1500 mots s'affichera ici après appel de l'API /add-with-ai]
                </div>
                <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end gap-4">
                    <button className="text-[10px] font-bold uppercase text-gray-400">Modifier</button>
                    <button className="text-[#C7A987] text-[10px] font-bold uppercase border border-[#C7A987] px-5 py-2 rounded-lg hover:bg-[#C7A987] hover:text-white transition-all shadow-sm">
                        Approuver & Publier
                    </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#2D3321] p-6 rounded-2xl text-white shadow-lg">
                   <h4 className="text-[9px] font-bold uppercase text-[#C7A987] mb-3 tracking-widest">Instagram Copy</h4>
                   <p className="text-[10px] opacity-80 leading-relaxed italic">"Sobriété et élégance à {formData.location}... ✨"</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                   <h4 className="text-[9px] font-bold uppercase text-gray-400 mb-3 tracking-widest">Facebook Post</h4>
                   <p className="text-[10px] text-gray-600 leading-relaxed italic">"Découvrez une opportunité unique à Marrakech..."</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}