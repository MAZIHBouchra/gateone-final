import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink, Globe } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#0B1F33] text-white">
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 text-left">

          {/* 1. Brand Section */}
          <div className="space-y-4">
            <h2 className="text-3xl font-serif font-bold tracking-tight cursor-pointer hover:text-[#5DA9E9] transition-all" onClick={() => navigate('/')}>
              GateOne
            </h2>
            <p className="text-[#5DA9E9] italic text-[10px] uppercase tracking-[0.4em] mb-6 font-bold">
              Intelligence
            </p>
            <p className="text-white/60 text-xs leading-relaxed max-w-xs font-serif italic">
              AI-powered luxury real estate operating system designed for international investors.
            </p>
          </div>

          {/* 2. Explore Section */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-[#C7A987] opacity-80 text-left">
              Intelligence Hub
            </h3>
            <ul className="space-y-5 text-[11px] font-bold uppercase tracking-widest text-white/40">
              <li onClick={() => navigate('/properties')} className="hover:text-[#5DA9E9] cursor-pointer transition-all flex items-center gap-2 group">
                <span className="w-0 group-hover:w-4 h-[1px] bg-[#5DA9E9] transition-all"></span> Assets Portfolio
              </li>
              <li onClick={() => navigate('/journal')} className="hover:text-[#5DA9E9] cursor-pointer transition-all flex items-center gap-2 group">
                <span className="w-0 group-hover:w-4 h-[1px] bg-[#5DA9E9] transition-all"></span> Digital Journal
              </li>
              <li onClick={() => navigate('/about')} className="hover:text-[#5DA9E9] cursor-pointer transition-all flex items-center gap-2 group">
                <span className="w-0 group-hover:w-4 h-[1px] bg-[#5DA9E9] transition-all"></span> Methodology
              </li>
              <li onClick={() => navigate('/contact')} className="hover:text-[#5DA9E9] cursor-pointer transition-all flex items-center gap-2 group">
                <span className="w-0 group-hover:w-4 h-[1px] bg-[#5DA9E9] transition-all"></span> Contact HQ
              </li>
            </ul>
          </div>

          {/* 3. Investor Access Section */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-[#C7A987] opacity-80 text-left">
              Account Management
            </h3>
            <ul className="space-y-5 text-[11px] font-bold uppercase tracking-widest text-white/40">
              <li onClick={() => navigate('/investor/signup')} className="hover:text-white cursor-pointer transition-all flex items-center gap-2">
                <div className="w-1 h-1 bg-[#5DA9E9] rounded-full"></div> Investor Signup
              </li>
              <li onClick={() => navigate('/admin/login')} className="hover:text-[#C7A987] cursor-pointer transition-all flex items-center gap-2 border border-white/5 bg-white/5 px-3 py-2 rounded-lg inline-block w-fit">
                 Staff Portal <ExternalLink size={10} className="inline ml-1" />
              </li>
            </ul>
          </div>

          {/* 4. Contact Details Section */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-[#C7A987] opacity-80 text-left">
              Headquarters
            </h3>
            <ul className="space-y-5 text-xs text-white/60 italic font-serif">
              <li className="flex items-center gap-3">
                 <MapPin size={14} className="text-[#5DA9E9]"/> Centre d’affaire Oualid, Jbel Gueliz 10, 40010 Marrakech, Morocco
              </li>
              <li className="flex items-center gap-3">
                 <Phone size={14} className="text-[#5DA9E9]"/> +212 618-688-888
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="border-t border-white/5 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/20">
              © {new Date().getFullYear()} GateOne Intelligence Architecture.
            </p>
        </div>
      </div>
    </footer>
  );
}