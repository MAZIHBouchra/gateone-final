"use client";

import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Sparkles, Loader2, FileText, Send, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function BlogStudio() {
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false); // État pour la publication
  const [blogData, setBlogData] = useState<any>(null);
  const [form, setForm] = useState({ topic: "", region: "Global", keywords: "" });
  const [isPublished, setIsPublished] = useState(false); // Pour afficher un succès
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const handleGenerate = async () => {
    if (!form.topic) return;
    setLoading(true);
    setBlogData(null);
    setIsPublished(false);

    try {
      const response = await fetch('${API_BASE_URL}/api/blogs/generate-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: form.topic,
          region: form.region,
          keywords: form.keywords.split(',').map(k => k.trim())
        })
      });

      const result = await response.json();

      if (response.ok) {
        // ✅ On récupère result.data car le backend l'a emballé dedans
        setBlogData(result.data);
        console.log("✅ Expert article generated successfully");
      } else {
        console.error("Validation error details:", result);
        alert("Validation error. Please check the console (F12).");
      }
    } catch (err) {
      console.error(err);
      alert("Connection error with the AI engine.");
    } finally {
      setLoading(false);
    }
  };

  // --- NOUVELLE FONCTION : PUBLIER SUR LE SITE ---
  const handlePublish = async () => {
    if (!blogData?.id) {
        alert("Error: Article ID not found. Please try generating again.");
        return;
    }
    
    setPublishing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/blogs/${blogData.id}/publish`, {
        method: 'PUT',
      });

      if (response.ok) {
        setIsPublished(true);
        alert("🚀 Success! The article is now live for all clients.");
      } else {
        alert("Server error during publication.");
      }
    } catch (err) {
      alert("Failed to reach the server.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-serif font-bold text-[#2D3321]">AI Blog Studio</h1>
        <p className="text-gray-500 italic">Industrialize your real estate SEO strategy with world-class expert articles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* PANNEAU DE CONFIGURATION (GAUCHE) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Article Topic</label>
            <textarea 
              className="w-full mt-2 p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-1 focus:ring-[#C7A987] mb-6 text-sm"
              rows={3}
              placeholder="e.g. Why Marrakech is outperforming Dubai in rental yields..."
              onChange={(e) => setForm({...form, topic: e.target.value})}
            />

            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Target Audience / Region</label>
            <select 
              className="w-full mt-2 p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-1 focus:ring-[#C7A987] mb-6 text-sm appearance-none"
              onChange={(e) => setForm({...form, region: e.target.value})}
            >
              <option value="Global">Global Market</option>
              <option value="Gulf">Gulf Investors (UAE/Qatar)</option>
              <option value="Europe_MRE">European Diaspora (MRE)</option>
              <option value="Africa">Casablanca Finance City Hub</option>
            </select>

            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Focus Keywords</label>
            <input 
              type="text"
              className="w-full mt-2 p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-1 focus:ring-[#C7A987] mb-8 text-sm"
              placeholder="Marrakech ROI, Luxury real estate..."
              onChange={(e) => setForm({...form, keywords: e.target.value})}
            />

            <button 
              onClick={handleGenerate}
              disabled={loading || !form.topic}
              className="w-full bg-[#000] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 disabled:opacity-50 hover:bg-zinc-800 transition-all shadow-xl active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? "AI IS WRITING..." : "GENERATE EXPERT BLOG"}
            </button>
          </div>
        </div>

        {/* PANNEAU DE PRÉVISUALISATION (DROITE) */}
        <div className="lg:col-span-8">
          {!blogData ? (
            <div className="h-full min-h-[500px] border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-300 bg-white/30 text-center px-10">
               <FileText size={40} className="mb-4 opacity-10" />
               <p className="italic text-sm">Fill in the topic on the left and let the AI perform market research and copywriting for you.</p>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-50 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* SEO METADATA BOX */}
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100 relative overflow-hidden">
                    <div className="absolute right-4 top-4 text-green-200">
                        <CheckCircle2 size={40} />
                    </div>
                    <p className="text-[10px] text-green-700 font-bold uppercase tracking-widest mb-3">SEO Strategy Optimized</p>
                    <div className="space-y-1">
                        <p className="text-xs text-green-800"><strong>Google Title:</strong> {blogData.seo_title}</p>
                        <p className="text-xs text-green-800"><strong>URL Slug:</strong> /{blogData.slug}</p>
                    </div>
                </div>

                {/* ARTICLE CONTENT */}
                <article className="prose prose-stone max-w-none 
                 prose-headings:font-serif prose-headings:text-[#2D3321]
                 prose-p:text-[#2D3321]/80 prose-p:leading-relaxed prose-p:text-base">
                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
                   {blogData.body_content}
                 </ReactMarkdown>
                </article>

                {/* ACTION FOOTER */}
                <div className="mt-10 pt-10 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">
                        Status: <span className={isPublished ? "text-green-500" : "text-amber-500"}>{isPublished ? "LIVE ON SITE" : "DRAFT READY"}</span>
                    </p>
                    
                    <button 
                        onClick={handlePublish}
                        disabled={publishing || isPublished}
                        className={`px-10 py-4 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] flex items-center gap-3 transition-all shadow-lg active:scale-95 ${
                            isPublished 
                            ? "bg-green-500 text-white cursor-default" 
                            : "bg-[#C7A987] text-white hover:bg-[#b59876] shadow-[#C7A987]/20"
                        }`}
                    >
                        {publishing ? <Loader2 className="animate-spin" /> : isPublished ? <CheckCircle2 size={18} /> : <Send size={18} />}
                        {publishing ? "PUBLISHING..." : isPublished ? "PUBLISHED" : "Approve & Publish to Site"}
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}