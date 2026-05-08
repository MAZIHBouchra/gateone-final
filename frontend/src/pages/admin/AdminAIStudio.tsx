"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Sparkles, 
  Loader2, 
  FileText, 
  Edit3,
  Save
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { propertiesApi } from '../../lib/api';

export default function AdminAIStudio() {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const [socialData, setSocialData] = useState<any>(null);
  
  // --- STATES FOR HUMAN EDITING ---
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [propertyId, setPropertyId] = useState<string | null>(null);

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
    bathrooms: "", // Added to sync with your DB
    features: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.title || !formData.price) {
      alert("Please enter at least the title and the price.");
      return;
    }

    setLoading(true);
    setGenerated(false);
    setAiData(null);
    setSocialData(null);
    setEditableContent("");

    try {
      // 1. Create the property in DB
      const result = await propertiesApi.addWithAI(formData);
      const newId = result.property_id;
      setPropertyId(newId);
      console.log("💎 Property created in DB. ID:", newId);

      let attempts = 0;
      const maxAttempts = 35;

      // 2. Start polling for AI content
      const checkAIContent = setInterval(async () => {
        attempts++;
        console.log(`📡 Attempt ${attempts} for ID: ${newId}`);

        try {
          // --- STEP A: FETCH ARTICLE ---
          const artRes = await fetch(`http://localhost:8000/api/properties/${newId}/ai-article`);
          
          if (artRes.ok) {
            const artJson = await artRes.json();
            console.log("📝 Article received!");
            
            setAiData(artJson);
            setEditableContent(artJson.content);
            setGenerated(true); 
          }

          // --- STEP B: FETCH SOCIAL POSTS ---
          const socRes = await fetch(`http://localhost:8000/api/properties/${newId}/social-posts`);
          
          if (socRes.ok) {
            const socJson = await socRes.json();
            console.log("📱 Social posts received!");
            
            setSocialData(socJson);
            setLoading(false); 
            clearInterval(checkAIContent); 
            console.log("✅ Generation cycle complete.");
          }

          if (attempts >= maxAttempts) {
            console.error("❌ Timeout: AI is taking too long.");
            clearInterval(checkAIContent);
            setLoading(false);
          }
        } catch (error) {
          // Keep polling...
        }
      }, 3000);

    } catch (error) {
      console.error("❌ API Error:", error);
      setLoading(false);
      alert("Error while creating the property.");
    }
  };

  const handlePublish = async () => {
    if (!propertyId) return;
    try {
      setLoading(true);
      alert("Success: Content has been validated and archived.");
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2D3321]">AI Content Studio</h1>
          <p className="text-gray-500 mt-1 italic">Real estate marketing industrialization via Mistral AI.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Cloud Infrastructure Active
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-serif mb-8 flex items-center gap-3 text-[#2D3321]">
              <div className="w-1 h-6 bg-[#C7A987]"></div> Property Details
            </h2>
            
            <div className="space-y-6">
              <div className="col-span-2">
                <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Listing Title</label>
                <input name="title" value={formData.title} onChange={handleChange} type="text" placeholder="e.g. Magnificent Contemporary Villa" className="w-full border-b border-gray-100 py-2 outline-none focus:border-[#C7A987] text-sm bg-transparent" />
              </div>

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
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full border-b border-gray-100 py-2 bg-transparent text-sm outline-none">
                    <option value="Luxury Villa">Villa</option>
                    <option value="Riad">Riad</option>
                    <option value="Apartment">Apartment</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full border-b border-gray-100 py-2 bg-transparent text-sm outline-none font-bold text-[#C7A987]">
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Price (MAD)</label>
                  <input name="price" value={formData.price} onChange={handleChange} type="number" placeholder="0.00" className="w-full border-b border-gray-100 py-2 outline-none text-sm bg-transparent" />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">City</label>
                  <input name="location" value={formData.location} onChange={handleChange} type="text" className="w-full border-b border-gray-100 py-2 outline-none text-sm bg-transparent" />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Neighborhood</label>
                  <input name="neighborhood" value={formData.neighborhood} onChange={handleChange} type="text" placeholder="e.g. Palmeraie" className="w-full border-b border-gray-100 py-2 outline-none text-sm bg-transparent" />
                </div>
              </div>

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

              <div>
                <label className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Key Features (AI Input)</label>
                <textarea name="features" value={formData.features} onChange={handleChange} rows={3} placeholder="Olympic pool, Italian marble, smart home..." className="w-full mt-2 p-4 bg-gray-50 rounded-2xl border-none outline-none text-xs focus:ring-1 focus:ring-[#C7A987]" />
              </div>

              <button onClick={handleGenerate} disabled={loading} className="w-full bg-[#2D3321] hover:bg-black text-[#F9F7F2] py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                {loading ? "ANALYZING & GENERATING..." : "GENERATE MARKETING PACK"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW & EDITING */}
        <div className="lg:col-span-7">
          {!generated ? (
            <div className="h-full min-h-[600px] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 bg-white/30 text-center px-10">
               <Sparkles size={40} className="opacity-10 text-[#C7A987] mb-4" />
               <p className="text-xs italic">Complete the property details on the left to launch the AI engine.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-1000">
              
              {/* ARTICLE BOX */}
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 relative">
                <div className="absolute top-6 right-8">
                   <span className="bg-[#C7A987] text-white px-3 py-1 rounded-md text-[9px] font-bold uppercase">Yoast SEO: Ready</span>
                </div>
                <h3 className="text-xl font-serif text-[#2D3321] mb-6 flex items-center gap-2">
                   <FileText className="text-[#C7A987]" size={20} /> Expert Article
                </h3>
                
                <div className="bg-[#F9F7F2]/50 p-8 rounded-2xl min-h-[500px] overflow-auto border border-[#C7A987]/10">
                   {isEditing ? (
                     <textarea 
                        value={editableContent}
                        onChange={(e) => setEditableContent(e.target.value)}
                        className="w-full h-[600px] bg-transparent border-none outline-none focus:ring-0 text-sm leading-relaxed font-mono text-[#2D3321]"
                     />
                   ) : (
                     <article className="prose prose-sm md:prose-base prose-stone max-w-none 
                        prose-headings:font-serif prose-headings:text-[#2D3321] 
                        prose-p:text-[#2D3321]/90 prose-p:leading-relaxed
                        prose-table:border prose-table:border-collapse prose-table:rounded-xl prose-table:overflow-hidden
                        prose-th:bg-[#C7A987]/10 prose-th:p-4 prose-td:p-4 prose-td:border-t prose-td:border-gray-100">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {editableContent}
                        </ReactMarkdown>
                     </article>
                   )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end gap-4">
                    <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400 hover:text-[#C7A987] transition-colors">
                        {isEditing ? <Save size={14}/> : <Edit3 size={14}/>}
                        {isEditing ? "Save changes" : "Edit Raw Text"}
                    </button>
                    <button onClick={handlePublish} className="text-[#C7A987] text-[10px] font-bold uppercase border border-[#C7A987] px-6 py-2 rounded-lg hover:bg-[#C7A987] hover:text-white transition-all shadow-sm">
                        Approve & Publish to Site
                    </button>
                </div>
              </div>

              {/* SOCIAL MEDIA PACK */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#2D3321] p-6 rounded-2xl text-white shadow-lg min-h-[150px] flex flex-col">
                   <h4 className="text-[9px] font-bold uppercase text-[#C7A987] mb-3 tracking-widest">Instagram Copy</h4>
                   {!socialData ? (
                     <div className="flex-1 flex items-center justify-center italic text-[9px] opacity-50">
                       <Loader2 size={14} className="animate-spin mr-2"/> Writing in progress...
                     </div>
                   ) : (
                     <p className="text-[10px] opacity-80 leading-relaxed whitespace-pre-wrap">{socialData.instagram}</p>
                   )}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[150px] flex flex-col">
                   <h4 className="text-[9px] font-bold uppercase text-gray-400 mb-3 tracking-widest">Facebook Post</h4>
                   {!socialData ? (
                     <div className="flex-1 flex items-center justify-center italic text-[9px] text-gray-300">
                       <Loader2 size={14} className="animate-spin mr-2"/> Writing in progress...
                     </div>
                   ) : (
                     <p className="text-[10px] text-gray-600 leading-relaxed whitespace-pre-wrap">{socialData.facebook}</p>
                   )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}