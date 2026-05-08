"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Users, 
  Target, 
  TrendingUp, 
  MessageCircle, 
  FileText, 
  Eye, 
  Download,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

// Types fictifs basés sur ton modèle pour la démo
interface Lead {
  id: string;
  full_name: string;
  email: string;
  current_status: 'new' | 'qualified' | 'viewing' | 'negotiation' | 'closed';
  ai_score: number;
  last_action: string;
  last_action_time: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Simulation de chargement des données (à remplacer par ton fetch API plus tard)
  useEffect(() => {
    const mockLeads: Lead[] = [
      { id: '1', full_name: 'Jean-Pierre Dupont', email: 'jp.dupont@email.com', current_status: 'qualified', ai_score: 85, last_action: 'Click WhatsApp', last_action_time: '2 mins ago' },
      { id: '2', full_name: 'Sarah Benani', email: 'sarah.b@email.com', current_status: 'new', ai_score: 42, last_action: 'Viewed Villa Jade', last_action_time: '1 hour ago' },
      { id: '3', full_name: 'Mark Thompson', email: 'm.thompson@uk-invest.com', current_status: 'viewing', ai_score: 78, last_action: 'Downloaded PDF Brochure', last_action_time: '15 mins ago' },
      { id: '4', full_name: 'Ahmed Mansouri', email: 'a.mansour@business.ma', current_status: 'new', ai_score: 15, last_action: 'Viewed Listing', last_action_time: '3 hours ago' },
    ];
    
    setTimeout(() => {
      setLeads(mockLeads);
      setLoading(false);
    }, 800);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-50 border-green-100';
    if (score >= 40) return 'text-amber-600 bg-orange-50 border-orange-100';
    return 'text-gray-400 bg-gray-50 border-gray-100';
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'qualified': return <Target size={14} className="text-[#C7A987]" />;
      case 'viewing': return <Eye size={14} className="text-blue-400" />;
      default: return <Clock size={14} className="text-gray-400" />;
    }
  };

  return (
    <AdminLayout>
      {/* 1. HEADER & STATS QUICK VIEW */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2D3321]">Intelligence Leads</h1>
          <p className="text-gray-500 mt-1 italic">Predictive behavior analysis and AI-driven client scoring.</p>
        </div>

        <div className="flex gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">High Potential</div>
                    <div className="text-lg font-bold text-[#2D3321]">12 Qualified</div>
                </div>
            </div>
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C7A987] transition-colors" size={18} />
                <input 
                    type="text"
                    placeholder="Search leads..."
                    className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#C7A987]/20 focus:border-[#C7A987] transition-all w-64 shadow-sm text-sm"
                />
            </div>
        </div>
      </div>

      {/* 2. LEADS INTELLIGENCE TABLE */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F9F7F2]/50 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold border-b border-gray-100">
              <th className="px-8 py-6 text-left">Prospect Details</th>
              <th className="px-8 py-6 text-left">Behavioral Score</th>
              <th className="px-8 py-6 text-left">Lifecycle Status</th>
              <th className="px-8 py-6 text-left">Latest Intelligence</th>
              <th className="px-8 py-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center italic text-gray-400">Processing behavioral data...</td></tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#F9F7F2]/20 transition-all group">
                  {/* Lead Info */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#2D3321] rounded-full flex items-center justify-center text-[#C7A987] font-bold text-xs shadow-inner">
                        {lead.full_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-[#2D3321]">{lead.full_name}</div>
                        <div className="text-xs text-gray-400">{lead.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* AI Score */}
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5 w-32">
                        <div className="flex justify-between items-end">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getScoreColor(lead.ai_score)}`}>
                                {lead.ai_score}/100
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${lead.ai_score > 70 ? 'bg-green-500' : lead.ai_score > 40 ? 'bg-amber-400' : 'bg-gray-300'}`}
                                style={{ width: `${lead.ai_score}%` }}
                            ></div>
                        </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-50 rounded-lg">
                            {getStatusIcon(lead.current_status)}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-[#2D3321] tracking-widest">
                            {lead.current_status}
                        </span>
                    </div>
                  </td>

                  {/* Last Action */}
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                        <div className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                            {lead.last_action.includes('WhatsApp') && <MessageCircle size={12} className="text-green-500"/>}
                            {lead.last_action.includes('PDF') && <Download size={12} className="text-blue-500"/>}
                            {lead.last_action}
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock size={10} /> {lead.last_action_time}
                        </div>
                    </div>
                  </td>

                  {/* Action Button */}
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 hover:bg-[#2D3321] hover:text-white rounded-xl transition-all border border-gray-100 text-gray-400">
                        <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}