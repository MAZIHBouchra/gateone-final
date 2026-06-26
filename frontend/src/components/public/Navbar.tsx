"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);

  const [user, setUser] = useState<{
    name: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const checkAuth = () => {
      const token = localStorage.getItem("gateone_token");

      const name =
        localStorage.getItem("gateone_user_name") ||
        localStorage.getItem("client_name") ||
        localStorage.getItem("agent_name");

      const role =
        localStorage.getItem("gateone_role") || "client";

      if (token && name) {
        setUser({
          name,
          role,
        });
      } else {
        setUser(null);
      }
    };

    handleScroll();
    checkAuth();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("gateone_token");
    localStorage.removeItem("gateone_user_name");
    localStorage.removeItem("gateone_role");
    localStorage.removeItem("gateone_client_id");

    /* anciennes clés */
    localStorage.removeItem("client_token");
    localStorage.removeItem("client_id");
    localStorage.removeItem("client_name");

    localStorage.removeItem("agent_name");

    setUser(null);

    navigate("/");

    window.location.reload();
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 px-6 md:px-12
      ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl py-4 shadow-xl border-b border-gray-100"
          : "bg-transparent py-8"
      }`}
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">

        {/* LOGO */}
        <div className="flex-1">
          <h1
            onClick={() => navigate("/")}
            className={`cursor-pointer inline-block transition-colors duration-300
            text-2xl font-serif font-bold tracking-tighter
            ${
              isScrolled
                ? "text-[#0B1F33]"
                : "text-white"
            }`}
          >
            GateOne

            <span className="text-[#5DA9E9] italic block text-[9px] uppercase tracking-[0.4em] mt-0.5 font-sans">
              Intelligence
            </span>
          </h1>
        </div>

        {/* MENU */}
        <div className="hidden lg:flex flex-1 justify-center items-center gap-10">
          {[
            { label: "Overview", path: "/" },
            { label: "Properties", path: "/properties" },
            { label: "Journal", path: "/journal" },
            { label: "About", path: "/about" },
            { label: "Contact", path: "/contact" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative py-2 text-[9px] uppercase font-bold tracking-[0.3em]
              transition-all
              ${
                location.pathname === item.path
                  ? "text-[#5DA9E9]"
                  : isScrolled
                  ? "text-[#0B1F33]/70 hover:text-[#0B1F33]"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {item.label}

              {location.pathname === item.path && (
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#5DA9E9]" />
              )}
            </button>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex flex-1 justify-end items-center gap-4">

          {user ? (
            <>
              <span
                className={`hidden lg:block text-[9px] uppercase tracking-widest font-bold
                ${
                  isScrolled
                    ? "text-[#C7A987]"
                    : "text-white"
                }`}
              >
                Welcome, {user.name}
              </span>

              <button
                onClick={logout}
                className={`px-5 py-2.5 rounded-full text-[9px]
                font-bold uppercase tracking-widest transition-all
                ${
                  isScrolled
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-white/10 border border-white/20 text-white hover:bg-red-500/20"
                }`}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/admin/login")}
                className={`px-5 py-2.5 rounded-full text-[9px]
                font-bold uppercase tracking-widest transition-all
                ${
                  isScrolled
                    ? "border border-[#0B1F33]/10 text-[#0B1F33] hover:bg-[#0B1F33] hover:text-white"
                    : "border border-white/20 text-white hover:bg-white/10"
                }`}
              >
                Staff Entry
              </button>

              <button
                onClick={() => navigate("/investor/signup")}
                className="px-6 py-2.5 rounded-full text-[9px]
                font-bold uppercase tracking-widest flex items-center gap-3
                shadow-lg transition-all
                bg-[#0B1F33] text-white hover:bg-[#5DA9E9]"
              >
                <ShieldCheck
                  size={14}
                  className="text-[#C7A987]"
                />

                Join Investor Circle
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}