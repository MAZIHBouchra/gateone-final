"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/public/Navbar';

import {
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';

export default function Journal() {

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {

    fetch('http://localhost:8000/api/blogs/')
      .then(res => res.json())
      .then(data => {

        setArticles(
          data.filter((a: any) =>
            a.status === "published"
          )
        );

        setLoading(false);

      })
      .catch(() => setLoading(false));

  }, []);

  return (

    <div className="min-h-screen bg-white">

      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-28 px-8 overflow-hidden text-white">

        {/* Background Image */}
        <div className="absolute inset-0 z-0">

          <img
            src="https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=2070&auto=format&fit=crop"
            className="w-full h-full object-cover"
            alt="Luxury Editorial"
          />

          <div className="absolute inset-0 bg-[#0B1F33]/80" />
        </div>

        {/* Decorative Blur */}
        <div className="absolute top-0 left-0 w-full h-full bg-[#5DA9E9]/5 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">

          <span className="text-[10px] uppercase font-bold text-[#5DA9E9] tracking-[0.5em] mb-6 block">
            Intelligence Reports
          </span>

          <h1 className="text-6xl md:text-7xl font-serif font-bold mb-8 tracking-tighter leading-tight">

            The Future of <br />
            Real Estate Intelligence
          </h1>

          <p className="text-lg text-gray-300 font-serif italic max-w-3xl mx-auto leading-relaxed">
            Strategic insights, investment forecasts,
            AI-powered analytics and premium market
            intelligence shaping the future of luxury
            real estate across Morocco.
          </p>
        </div>
      </section>

      {/* ARTICLES */}
      <main className="max-w-7xl mx-auto px-8 py-24">

        {/* Section Heading */}
        <div className="flex justify-between items-end mb-20">

          <div>

            <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#5DA9E9] mb-3">
              Editorial Selection
            </p>

            <h2 className="text-5xl font-serif font-bold text-[#0B1F33]">
              Latest Intelligence
            </h2>
          </div>
        </div>

        {loading ? (

          <div className="flex flex-col items-center justify-center py-32 text-gray-300">

            <Loader2
              className="animate-spin mb-4"
              size={40}
            />

            <p className="font-serif italic text-lg text-gray-400">
              Loading intelligence archives...
            </p>
          </div>

        ) : articles.length === 0 ? (

          <div className="text-center py-32 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">

            <p className="text-gray-400 italic">
              No intelligence reports published yet.
            </p>
          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">

            {articles.map((art) => (

              <div
                key={art.id}
                onClick={() =>
                  navigate(`/article/${art.id}`)
                }
                className="group cursor-pointer bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 hover:shadow-[0_20px_60px_rgba(11,31,51,0.12)] transition-all duration-700 flex flex-col"
              >

                {/* IMAGE */}
                <div className="relative h-72 overflow-hidden">

                  <img
                    src={
                      art.thumbnail ||
                      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
                    }
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1500ms]"
                    alt={art.topic}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F33]/80 to-transparent" />

                  {/* Tag */}
                  <div className="absolute top-6 left-6">

                    <span className="bg-white/10 backdrop-blur-md border border-white/10 text-[#5DA9E9] px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-xl">

                      Expert Insight
                    </span>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-8 flex flex-col flex-1">

                  {/* META */}
                  <div className="flex items-center gap-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-5">

                    <span className="flex items-center gap-2">

                      <Calendar
                        size={12}
                        className="text-[#5DA9E9]"
                      />

                      {new Date(
                        art.created_at
                      ).toLocaleDateString()}
                    </span>

                    <span className="flex items-center gap-2">

                      <Clock size={12} />

                      6 min read
                    </span>
                  </div>

                  {/* TITLE */}
                  <h3 className="text-2xl font-serif font-bold text-[#0B1F33] leading-tight mb-5 group-hover:text-[#5DA9E9] transition-colors">

                    {art.seo_title || art.topic}
                  </h3>

                  {/* DESC */}
                  <p className="text-sm text-gray-500 leading-relaxed italic line-clamp-3">

                    Strategic analysis on
                    {` ${art.target_region} `}
                    and the evolution of Morocco’s
                    luxury real estate ecosystem.
                  </p>

                  {/* CTA */}
                  <div className="pt-8 mt-auto">

                    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B1F33] border-b border-[#0B1F33]/10 pb-1 group-hover:gap-4 group-hover:text-[#5DA9E9] transition-all">

                      Read Intelligence Brief

                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CTA SECTION */}
      <section className="px-8 pb-20">

        <div className="max-w-7xl mx-auto bg-[#0B1F33] rounded-[3rem] p-16 md:p-24 relative overflow-hidden text-center text-white">

          <div className="absolute inset-0 bg-[#5DA9E9]/5 opacity-50 pointer-events-none" />

          <div className="relative z-10">

            <h2 className="text-5xl font-serif font-bold mb-8">

              Stay ahead of the market
            </h2>

            <p className="max-w-2xl mx-auto text-gray-400 mb-12 text-lg font-serif italic">

              Receive exclusive intelligence reports,
              investment forecasts and premium
              off-market opportunities directly
              from GateOne Intelligence.
            </p>

            <button className="bg-[#5DA9E9] text-white px-12 py-5 rounded-full font-bold uppercase text-[11px] tracking-widest shadow-2xl hover:bg-sky-400 transition-all">

              Subscribe to Reports
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-14 border-t border-gray-100 text-center text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em]">

        GateOne Intelligence ©
        {new Date().getFullYear()}
        — Luxury Real Estate Intelligence
      </footer>
    </div>
  );
}