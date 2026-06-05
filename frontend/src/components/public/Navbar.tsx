"use client";
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // CORRECTION : meilleur contraste au scroll sur Home
  const navBackground = isHomePage
    ? (scrolled
        ? "bg-white shadow-md border-b border-gray-100"          // ← plus de /90, ombre visible, bordure grise
        : "bg-transparent")
    : "bg-[#0B1F33]/95 backdrop-blur-xl border-b border-white/5 shadow-lg";

  const textColor = isHomePage
    ? (scrolled ? "text-[#0B1F33]" : "text-white")
    : "text-white";

  const logoIntelligenceColor = "text-[#5DA9E9]";

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] px-8 md:px-12 py-5 transition-all duration-500 ${navBackground}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* LOGO */}
        <div className="cursor-pointer group" onClick={() => navigate('/')}>
          <h1 className={`text-2xl font-serif font-bold tracking-tighter transition-all duration-500 ${textColor}`}>
            GateOne
            <span className={`block text-[10px] uppercase tracking-[0.4em] italic mt-0.5 ${logoIntelligenceColor} group-hover:tracking-[0.5em] transition-all`}>
              Intelligence
            </span>
          </h1>
        </div>

        {/* LINKS */}
        <div className="hidden md:flex items-center gap-12">
          {[
            { label: 'Properties', path: '/properties' },
            { label: 'Journal',    path: '/journal'    },
            { label: 'About',      path: '/about'      },
            { label: 'Contact',    path: '/contact'    },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                text-[10px] uppercase font-bold tracking-[0.3em] transition-all duration-300 relative py-2
                after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1px]
                after:bg-[#5DA9E9] after:transition-all
                ${location.pathname === item.path
                  ? 'text-[#5DA9E9] after:w-full'
                  : `after:w-0 hover:after:w-full
                     ${isHomePage && !scrolled
                        ? 'text-white/80 hover:text-white'
                        : isHomePage && scrolled
                          ? 'text-[#0B1F33]/70 hover:text-[#5DA9E9]'   // ← CORRECTION : hover bleu sur fond blanc
                          : 'text-white/80 hover:text-white'
                     }`
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* BUTTON */}
        <button
          onClick={() => navigate('/admin/login')}
          className={`
            text-[10px] uppercase font-bold tracking-[0.2em] px-7 py-3 rounded-full transition-all border
            ${isHomePage && !scrolled
              ? "border-white/30 bg-white/10 text-white hover:bg-white hover:text-[#0B1F33]"
              : "border-[#5DA9E9] text-[#5DA9E9] bg-transparent hover:bg-[#5DA9E9] hover:text-white shadow-sm"  // ← CORRECTION : texte visible sur blanc
            }
          `}
        >
          Private Access
        </button>

      </div>
    </nav>
  );
}
