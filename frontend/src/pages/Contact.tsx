"use client";

import React, { useState } from 'react';

import Navbar from '@/components/public/Navbar';

import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Send,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function Contact() {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    console.log(formData);

    // Backend API later
  };

  return (

    <div className="min-h-screen bg-white overflow-hidden">

      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-28 px-8 overflow-hidden text-white">

        {/* Background */}
        <div className="absolute inset-0 z-0">

          <img
            src="https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=2070&auto=format&fit=crop"
            className="w-full h-full object-cover"
            alt="Luxury Contact"
          />

          <div className="absolute inset-0 bg-[#0B1F33]/85" />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-[#5DA9E9]/5 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">

          <span className="text-[10px] uppercase font-bold text-[#5DA9E9] tracking-[0.5em] mb-6 block">

            Contact Orchid Island
          </span>

          <h1 className="text-6xl md:text-8xl font-serif font-bold leading-[1.1] tracking-tighter mb-10">

            Let’s discuss your <br />
            next investment
          </h1>

          <p className="max-w-3xl mx-auto text-lg text-gray-300 leading-relaxed font-serif italic">

            Connect with our luxury real estate
            specialists and access premium
            investment opportunities, strategic
            insights and institutional expertise.
          </p>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="py-28 px-8">

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

          {/* LEFT SIDE */}
          <div>

            <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#5DA9E9] mb-5">

              Get in Touch
            </p>

            <h2 className="text-5xl font-serif font-bold text-[#0B1F33] mb-8 leading-tight">

              Premium real estate <br />
              advisory & intelligence
            </h2>

            <p className="text-gray-500 leading-relaxed text-lg italic mb-14">

              Orchid Island combines luxury
              real estate expertise with advanced
              technology and AI-driven workflows
              to deliver exceptional client
              experiences across Morocco.
            </p>

            {/* INFO CARDS */}
            <div className="space-y-6">

              {/* EMAIL */}
              <div className="flex items-start gap-5 bg-[#F8FAFC] rounded-[2rem] p-6 border border-gray-100">

                <div className="w-14 h-14 bg-[#5DA9E9]/10 text-[#5DA9E9] rounded-2xl flex items-center justify-center shrink-0">

                  <Mail size={24} />
                </div>

                <div>

                  <h3 className="text-lg font-serif font-bold text-[#0B1F33] mb-2">

                    Email Address
                  </h3>

                  <p className="text-gray-500 italic">

                    contact@orchidisland.ma
                  </p>
                </div>
              </div>

              {/* PHONE */}
              <div className="flex items-start gap-5 bg-[#F8FAFC] rounded-[2rem] p-6 border border-gray-100">

                <div className="w-14 h-14 bg-[#5DA9E9]/10 text-[#5DA9E9] rounded-2xl flex items-center justify-center shrink-0">

                  <Phone size={24} />
                </div>

                <div>

                  <h3 className="text-lg font-serif font-bold text-[#0B1F33] mb-2">

                    Phone Number
                  </h3>

                  <p className="text-gray-500 italic">

                    +212 6 00 00 00 00
                  </p>
                </div>
              </div>

              {/* LOCATION */}
              <div className="flex items-start gap-5 bg-[#F8FAFC] rounded-[2rem] p-6 border border-gray-100">

                <div className="w-14 h-14 bg-[#5DA9E9]/10 text-[#5DA9E9] rounded-2xl flex items-center justify-center shrink-0">

                  <MapPin size={24} />
                </div>

                <div>

                  <h3 className="text-lg font-serif font-bold text-[#0B1F33] mb-2">

                    Office Location
                  </h3>

                  <p className="text-gray-500 italic">

                    Marrakech, Morocco
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-[0_20px_60px_rgba(11,31,51,0.06)] relative overflow-hidden">

            <div className="absolute inset-0 bg-[#5DA9E9]/[0.02] pointer-events-none" />

            <div className="relative z-10">

              <div className="flex items-center gap-3 mb-10">

                <div className="w-14 h-14 bg-[#5DA9E9]/10 text-[#5DA9E9] rounded-2xl flex items-center justify-center">

                  <Send size={24} />
                </div>

                <div>

                  <h3 className="text-2xl font-serif font-bold text-[#0B1F33]">

                    Send a Request
                  </h3>

                  <p className="text-gray-400 text-sm italic">

                    Our advisors will contact you shortly
                  </p>
                </div>
              </div>

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                {/* NAME */}
                <div>

                  <label className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400 block mb-3">

                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full bg-[#F8FAFC] border border-gray-100 rounded-2xl px-6 py-5 outline-none focus:border-[#5DA9E9] transition-all"
                  />
                </div>

                {/* EMAIL */}
                <div>

                  <label className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400 block mb-3">

                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@email.com"
                    className="w-full bg-[#F8FAFC] border border-gray-100 rounded-2xl px-6 py-5 outline-none focus:border-[#5DA9E9] transition-all"
                  />
                </div>

                {/* PHONE */}
                <div>

                  <label className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400 block mb-3">

                    Phone Number
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+212 6..."
                    className="w-full bg-[#F8FAFC] border border-gray-100 rounded-2xl px-6 py-5 outline-none focus:border-[#5DA9E9] transition-all"
                  />
                </div>

                {/* MESSAGE */}
                <div>

                  <label className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400 block mb-3">

                    Your Request
                  </label>

                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Tell us about your investment goals..."
                    className="w-full bg-[#F8FAFC] border border-gray-100 rounded-2xl px-6 py-5 outline-none focus:border-[#5DA9E9] transition-all resize-none"
                  />
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  className="w-full bg-[#0B1F33] text-white py-5 rounded-full font-bold uppercase text-[11px] tracking-widest hover:bg-[#5DA9E9] transition-all flex items-center justify-center gap-3"
                >

                  Send Request

                  <ArrowRight size={16} />
                </button>
              </form>

              {/* FOOTER INFO */}
              <div className="flex flex-col md:flex-row gap-6 mt-10 pt-8 border-t border-gray-100">

                <div className="flex items-center gap-3 text-gray-500 text-sm">

                  <Clock size={16} className="text-[#5DA9E9]" />

                  Response within 24h
                </div>

                <div className="flex items-center gap-3 text-gray-500 text-sm">

                  <ShieldCheck size={16} className="text-[#5DA9E9]" />

                  Secure & confidential communication
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 pb-20">

        <div className="max-w-7xl mx-auto bg-[#0B1F33] rounded-[3rem] p-16 md:p-24 relative overflow-hidden text-center text-white">

          <div className="absolute inset-0 bg-[#5DA9E9]/5 opacity-50 pointer-events-none" />

          <div className="relative z-10">

            <h2 className="text-5xl font-serif font-bold mb-8">

              Access premium opportunities
            </h2>

            <p className="max-w-3xl mx-auto text-gray-400 mb-12 text-lg font-serif italic">

              Orchid Island delivers luxury
              real estate intelligence, premium
              advisory services and AI-powered
              operational excellence.
            </p>

            <button className="bg-[#5DA9E9] text-white px-12 py-5 rounded-full font-bold uppercase text-[11px] tracking-widest shadow-2xl hover:bg-sky-400 transition-all">

              Schedule a Consultation
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-14 border-t border-gray-100 text-center text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em]">

        Orchid Island ©
        {new Date().getFullYear()}
        — Luxury Real Estate Intelligence
      </footer>
    </div>
  );
}