"use client";

import React from 'react';

import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

import {
  ShieldCheck,
  Target,
  Award,
  Sparkles,
  Database,
  BrainCircuit,
  Building2,
  ArrowRight,
  Users,
  FileText,
  BarChart3
} from 'lucide-react';

export default function About() {

  return (

    <div className="min-h-screen bg-white overflow-hidden">

      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-32 px-8 overflow-hidden text-white">

        {/* Background */}
        <div className="absolute inset-0 z-0">

          <img
            src="https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=2070&auto=format&fit=crop"
            className="w-full h-full object-cover"
            alt="Luxury Real Estate"
          />

          <div className="absolute inset-0 bg-[#0B1F33]/85" />
        </div>

        {/* Decorative Blur */}
        <div className="absolute inset-0 bg-[#5DA9E9]/5 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center">

          <span className="text-[10px] uppercase font-bold text-[#5DA9E9] tracking-[0.5em] mb-6 block">

            About Orchid Island
          </span>

          <h1 className="text-6xl md:text-8xl font-serif font-bold leading-[1.1] tracking-tighter mb-10">

            Reinventing Luxury <br />
            Real Estate Intelligence
          </h1>

          <p className="max-w-3xl mx-auto text-lg text-gray-300 leading-relaxed font-serif italic">

            Orchid Island is a luxury real estate
            intelligence platform specialized in
            premium asset management, AI-driven
            operations and high-value client
            experiences across Morocco’s elite
            property market.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 px-8 border-b border-gray-100">

        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">

          {[
            {
              number: "AI",
              label: "Powered Operations"
            },
            {
              number: "24/7",
              label: "Data Synchronization"
            },
            {
              number: "Premium",
              label: "Client Experience"
            },
            {
              number: "Secure",
              label: "Legal Infrastructure"
            }
          ].map((item, i) => (

            <div
              key={i}
              className="text-center"
            >

              <h2 className="text-5xl font-serif font-bold text-[#0B1F33] mb-3">

                {item.number}
              </h2>

              <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400">

                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CORE OPERATIONS */}
      <section className="py-28 px-8 bg-[#F8FAFC]">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-20">

            <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#5DA9E9] mb-4">

              Core Operations
            </p>

            <h2 className="text-5xl font-serif font-bold text-[#0B1F33]">

              Intelligent Business Processes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {[
              {
                icon: Users,
                title: "Client Relationship Intelligence",
                desc: "Advanced CRM workflows combining behavioral analysis, prospect qualification and personalized client experiences."
              },

              {
                icon: Building2,
                title: "Real Estate Portfolio Management",
                desc: "Real-time synchronization of luxury property assets, technical information and multichannel publishing."
              },

              {
                icon: BarChart3,
                title: "Transaction Orchestration",
                desc: "Coordinated management of high-value transactions involving agents, clients and institutional stakeholders."
              },

              {
                icon: FileText,
                title: "Legal & Administrative AI",
                desc: "AI-assisted analysis, preparation and secure archiving of contractual and legal documentation."
              }

            ].map((item, i) => (

              <div
                key={i}
                className="bg-white rounded-[2.5rem] p-10 border border-gray-100 hover:shadow-[0_20px_60px_rgba(11,31,51,0.08)] transition-all duration-700 group"
              >

                <div className="w-16 h-16 bg-[#5DA9E9]/10 text-[#5DA9E9] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#0B1F33] group-hover:text-white transition-all">

                  <item.icon size={30} />
                </div>

                <h3 className="text-2xl font-serif font-bold text-[#0B1F33] mb-5">

                  {item.title}
                </h3>

                <p className="text-gray-500 leading-relaxed italic">

                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DATA SECTION */}
      <section className="py-28 px-8">

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* LEFT */}
          <div>

            <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#5DA9E9] mb-5">

              Data & Infrastructure
            </p>

            <h2 className="text-5xl font-serif font-bold text-[#0B1F33] mb-8 leading-tight">

              Enterprise-grade <br />
              architecture powered <br />
              by intelligent systems
            </h2>

            <p className="text-gray-500 leading-relaxed text-lg italic mb-10">

              Orchid Island operates through a
              robust digital ecosystem capable of
              processing heterogeneous data flows,
              including legal documents, high-definition
              media assets, transactional histories
              and behavioral analytics.
            </p>

            <div className="space-y-6">

              {[
                "AI-assisted document analysis",
                "Secure legal archiving systems",
                "Real-time data consistency",
                "Luxury property intelligence"
              ].map((item, i) => (

                <div
                  key={i}
                  className="flex items-center gap-4"
                >

                  <div className="w-3 h-3 rounded-full bg-[#5DA9E9]" />

                  <span className="text-[#0B1F33] font-medium">

                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-[#0B1F33] rounded-[3rem] p-14 text-white relative overflow-hidden">

            <div className="absolute inset-0 bg-[#5DA9E9]/5 pointer-events-none" />

            <div className="relative z-10">

              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-10 text-[#5DA9E9]">

                <BrainCircuit size={40} />
              </div>

              <h3 className="text-4xl font-serif font-bold mb-8 leading-tight">

                AI-driven operational excellence
              </h3>

              <p className="text-gray-300 leading-relaxed mb-10 italic">

                Combining luxury real estate expertise
                with advanced automation technologies,
                Orchid Island delivers institutional-grade
                intelligence and premium client servicing.
              </p>

              <button className="bg-[#5DA9E9] text-white px-10 py-5 rounded-full font-bold uppercase text-[11px] tracking-widest hover:bg-sky-400 transition-all flex items-center gap-3">

                Explore the Ecosystem

                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-28 px-8 bg-[#F8FAFC]">

        <div className="max-w-6xl mx-auto text-center">

          <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#5DA9E9] mb-5">

            Institutional Standards
          </p>

          <h2 className="text-5xl font-serif font-bold text-[#0B1F33] mb-20">

            Built on trust, precision & security
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

            {[
              {
                icon: Award,
                title: "Luxury Excellence"
              },

              {
                icon: Target,
                title: "Strategic Precision"
              },

              {
                icon: ShieldCheck,
                title: "Legal Security"
              }

            ].map((item, i) => (

              <div
                key={i}
                className="bg-white rounded-[2.5rem] p-12 border border-gray-100"
              >

                <div className="w-20 h-20 bg-[#5DA9E9]/10 text-[#5DA9E9] rounded-3xl flex items-center justify-center mx-auto mb-8">

                  <item.icon size={36} />
                </div>

                <h3 className="text-2xl font-serif font-bold text-[#0B1F33]">

                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-8 pb-20">

        <div className="max-w-7xl mx-auto bg-[#0B1F33] rounded-[3rem] p-16 md:p-24 relative overflow-hidden text-center text-white">

          <div className="absolute inset-0 bg-[#5DA9E9]/5 opacity-50 pointer-events-none" />

          <div className="relative z-10">

            <h2 className="text-5xl font-serif font-bold mb-8">

              Transforming luxury real estate through intelligence
            </h2>

            <p className="max-w-3xl mx-auto text-gray-400 mb-12 text-lg font-serif italic">

              Orchid Island combines advanced
              technology, AI-powered workflows
              and institutional expertise to redefine
              premium real estate operations.
            </p>

            <button className="bg-[#5DA9E9] text-white px-12 py-5 rounded-full font-bold uppercase text-[11px] tracking-widest shadow-2xl hover:bg-sky-400 transition-all">

              Contact Our Team
            </button>
          </div>
        </div>
      </section>
	  {/* --- FOOTER: FINAL IMPACT --- */}
       <Footer />
    </div>
  );
}