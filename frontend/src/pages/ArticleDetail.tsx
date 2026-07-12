"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { ArrowLeft, Clock, Calendar, ShieldCheck, Share2 } from 'lucide-react';

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`http://localhost:8000/api/blogs/${id}`)
      .then(res => res.json())
      .then(data => {
        setArticle(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="h-screen bg-white flex items-center justify-center font-serif italic text-gray-400 animate-pulse">De-encrypting Report Data...</div>;

  return (
  <div className="min-h-screen bg-white font-sans">
    <Navbar />

    {/* --- DARK HERO HEADER --- */}
    <div className="bg-[#0B1F33] text-white pt-48 pb-20 px-8 relative overflow-hidden">
      {/* Arabesque decorative pattern à 3% d'opacité pour le luxe */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/arabesque.png')` }} />
      
      {/* Effet de lueur AI Blue en fond */}
      <div className="absolute -bottom-24 -right-20 w-96 h-96 bg-[#5DA9E9]/10 blur-[120px] rounded-full" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Navigation et Metadonnées Light sur Dark */}
        <div className="mb-16 flex justify-between items-center border-b border-white/10 pb-8">
            <button onClick={() => navigate('/journal')} className="flex items-center gap-3 text-white/50 hover:text-[#5DA9E9] transition-all text-[10px] font-bold uppercase tracking-widest">
                <ArrowLeft size={16} /> Back to Insights Journal
            </button>
            <div className="flex gap-4 items-center">
                <button className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-white/60">
                    <Share2 size={16}/>
                </button>
                <div className="px-5 py-2 bg-[#5DA9E9]/10 border border-[#5DA9E9]/20 text-[#5DA9E9] rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldCheck size={14}/> Verified Analyst Report
                </div>
            </div>
        </div>

        {/* Header de l'Article */}
        <header className="space-y-8">
            <div className="flex items-center gap-8 text-[9px] font-bold text-[#C7A987] uppercase tracking-[0.4em]">
                <span className="flex items-center gap-2 bg-[#C7A987]/10 px-3 py-1 rounded-md italic">
                    <Calendar size={12}/> {article.created_at}
                </span>
                <span className="flex items-center gap-2">
                    <Clock size={12}/> 7 min intensive reading
                </span>
            </div>
            
            {/* Titre massiv et luxueux */}
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-[1.1] tracking-tight max-w-4xl">
                {/* On enlève les ** si jamais ils sont présents dans le titre SEO */}
                {(article.seo_title || article.topic).replace(/\*\*/g, "")}
            </h1>

            <p className="text-[#5DA9E9] text-sm font-serif italic opacity-80 max-w-2xl border-l-2 border-[#5DA9E9]/30 pl-6">
              Expert intelligence briefing regarding Moroccan luxury assets and high-net-worth portfolio strategies.
            </p>
        </header>
      </div>
    </div>

    {/* --- ARTICLE CONTENT (Sur fond blanc pour la lisibilité) --- */}
    <main className="max-w-4xl mx-auto px-6 py-24">
        <article className="prose prose-stone lg:prose-xl max-w-none 
            prose-headings:font-serif prose-headings:text-[#0B1F33]
            prose-p:text-gray-600 prose-p:leading-[1.8] prose-p:mb-10
            prose-table:border prose-table:rounded-[2rem] prose-table:overflow-hidden prose-table:shadow-2xl
            prose-th:bg-[#F9F7F2] prose-th:p-6 prose-td:p-6">
            
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {article.content}
            </ReactMarkdown>
        </article>

        {/* Footer Conversion */}
        <footer className="mt-32 p-16 bg-[#F9F7F2] rounded-[3.5rem] border border-[#0B1F33]/5 text-center">
            <h4 className="text-3xl font-serif font-bold text-[#0B1F33] mb-4">Mastering the Art of Acquisition</h4>
            <p className="text-gray-500 italic font-serif mb-10">Our Intelligence Desk is ready to provide specific ROI models for your portfolio.</p>
            <button onClick={() => navigate('/contact')} className="bg-[#0B1F33] text-white px-12 py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#5DA9E9] transition-all shadow-xl shadow-black/10">
                Contact Strategy Lead
            </button>
        </footer>
    </main>

    {/* --- FOOTER: FINAL IMPACT --- */}
       <Footer />
  </div>
);
}