"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/public/Navbar";
import Footer from '@/components/public/Footer';
import {
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
  Lock
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function Journal() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🚀 LOGIQUE AUTH UNIFIÉE
  const isAuthenticated = !!localStorage.getItem('gateone_token');

  useEffect(() => {
    // 🚀 ON UTILISE LE CHEMIN EXACT DE TON BACKEND
    fetch('${API_BASE_URL}/api/blogs/public/blogs') 
      .then(res => {
        if (!res.ok) throw new Error("Catalog unreachable");
        return res.json();
      })
      .then(data => {
        // Ta route renvoie déjà une liste formatée avec les champs : 
        // id, topic, seo_title, content, etc.
        setArticles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
}, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-28 px-8 overflow-hidden text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=2070&auto=format&fit=crop"
            className="w-full h-full object-cover"
            alt="Luxury Editorial"
          />
          <div className="absolute inset-0 bg-[#0B1F33]/80" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <span className="text-[10px] uppercase font-bold text-[#5DA9E9] tracking-[0.5em] mb-6 block">
            Intelligence Reports
          </span>

          <h1 className="text-6xl md:text-7xl font-serif font-bold mb-8 leading-tight">
            The Future of <br />
            Real Estate Intelligence
          </h1>

          <p className="text-lg text-gray-300 italic max-w-3xl mx-auto">
            Strategic insights, AI-powered analytics and premium market intelligence.
          </p>
        </div>
      </section>

      {/* ARTICLES */}
      <main className="max-w-7xl mx-auto px-8 py-24">
        <div className="mb-16">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#5DA9E9] mb-3">
            Editorial Selection
          </p>
          <h2 className="text-5xl font-serif font-bold text-[#0B1F33]">
            Latest Intelligence
          </h2>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex flex-col items-center py-32 text-gray-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            Loading intelligence archives...
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-32 text-gray-400">
            No intelligence reports published yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-14">
            {articles.map((art: any) => (
              <div
                key={art.id}
                className="group cursor-pointer bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-700 flex flex-col"
              >
                {/* IMAGE */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={
                      art.thumbnail ||
                      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
                    }
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={art.topic}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F33]/80 to-transparent" />
                </div>

                {/* CONTENT */}
                <div className="p-8 flex flex-col flex-1">
                  {/* META */}
                  <div className="flex items-center gap-6 text-[10px] uppercase text-gray-400 mb-5">
                    <span className="flex items-center gap-2">
                      <Calendar size={12} className="text-[#5DA9E9]" />
                      {new Date(art.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock size={12} />
                      6 min read
                    </span>
                  </div>

                  {/* TITLE */}
                  <h3 className="text-2xl font-serif font-bold text-[#0B1F33] mb-5 group-hover:text-[#5DA9E9]">
                    {art.seo_title || art.topic}
                  </h3>

                  {/* DESCRIPTION */}
                  <p className="text-sm text-gray-500 italic line-clamp-2">
                    Strategic analysis on {art.target_region} and Morocco’s real estate evolution.
                  </p>

                  {/* CTA CONDITIONNEL */}
                  <div className="pt-6 mt-auto">
      {isAuthenticated ? (
        /* CAS 1 : CONNECTÉ - BOUTON DÉBLOQUÉ */
        <button 
           onClick={() => navigate(`/article/${art.id}`)}
           className="inline-flex items-center gap-3 bg-[#0B1F33] text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#5DA9E9] transition-all shadow-lg"
        >
          Read Full Intelligence <ArrowRight size={14} />
        </button>
      ) : (
        /* CAS 2 : VISITEUR - BOUTON DE SIGNUP */
        <button 
           onClick={() => navigate('/investor/signup')}
           className="inline-flex items-center gap-3 bg-[#0B1F33] text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] opacity-80"
        >
           <Lock size={12} className="text-[#C7A987]" /> Join to read full report
        </button>
      )}
  </div>
                </div>

                {/* GATE OVERLAY */}
                {!isAuthenticated && (
                  <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white via-white/90 to-transparent flex items-end justify-center pb-5">
                    <span className="flex items-center gap-2 bg-[#0B1F33] text-white px-5 py-2 rounded-full text-[9px] uppercase">
                      <Lock size={11} /> Premium Access
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CTA */}
      <section className="px-8 pb-20">
        <div className="max-w-7xl mx-auto bg-[#0B1F33] rounded-[3rem] p-20 text-center text-white">
          <h2 className="text-5xl font-serif mb-6">
            Stay ahead of the market
          </h2>
          <p className="text-gray-400 mb-10 italic max-w-2xl mx-auto">
            Receive exclusive intelligence reports and investment insights.
          </p>
        </div>
      </section>
	  
	  {/* --- FOOTER: FINAL IMPACT --- */}
        <Footer />
    </div>
  );
}