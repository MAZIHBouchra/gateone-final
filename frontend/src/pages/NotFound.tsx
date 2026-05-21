import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F9F7F2]">
      <h1 className="text-9xl font-serif text-[#C7A987]/20 absolute select-none">404</h1>
      <div className="relative z-10 text-center">
        <h2 className="text-3xl font-serif font-bold text-[#2D3321] mb-4">Discovery Failed</h2>
        <p className="text-gray-400 mb-8 italic">The coordinates you followed do not lead to any verified asset.</p>
        <button 
          onClick={() => navigate('/')}
          className="text-[10px] font-bold uppercase tracking-widest border-b border-[#2D3321] pb-1 hover:text-[#C7A987] hover:border-[#C7A987] transition-all"
        >
          Return to Hub
        </button>
      </div>
    </div>
  );
}