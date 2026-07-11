"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { leadsApi } from '@/lib/api'; // Import du nouveau service
import { 
  Users, Target, TrendingUp, MessageCircle, FileText, 
  Eye, Download, Search, ChevronRight, Clock, Loader2, X, Sparkles 
} from 'lucide-react';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false); 
  
  const [analysisData, setAnalysisData] = useState<any>(null);

  const [fetchingAnalysis, setFetchingAnalysis] = useState(false);

  // FETCHING REEL
  useEffect(() => {
    async function loadLeads() {
      try {
        const data = await leadsApi.getAllLeads();
        setLeads(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLeads();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 40) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-slate-400 bg-slate-50 border-slate-100';
  };

  const filteredLeads = leads.filter(l => 
    l.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleOpenAnalysis = async (leadId: string) => {
    setIsAnalysisOpen(true);
    setFetchingAnalysis(true);
    try {
        const data = await leadsApi.getLeadIntelligence(leadId);
        setAnalysisData(data);
    } catch (err) {
        console.error("Analysis retrieval failed");
    } finally {
        setFetchingAnalysis(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#2D3321] tracking-tight">Lead Intelligence Hub</h1>
          <p className="text-gray-500 mt-2 italic">Predictive behavior analysis and behavioral-based qualification.</p>
        </div>

        <div className="flex gap-4">
            {/* SEARCH */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5DA9E9]" size={16} />
                <input 
                    type="text"
                    placeholder="Search prospect name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#C7A987] transition-all w-72 text-sm shadow-sm"
                />
            </div>
        </div>
      </div>

      {/* TABLE REELLE */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9F7F2]/50 text-[9px] uppercase tracking-[0.3em] text-gray-400 font-bold border-b border-gray-100">
              <th className="px-10 py-7 text-left">Identity Profile</th>
              <th className="px-10 py-7 text-left">Cognitive Score</th>
              <th className="px-10 py-7 text-left">Stage</th>
              <th className="px-10 py-7 text-left">Behavioral Signal</th>
              <th className="px-10 py-7 text-right">Analysis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="py-32 text-center text-gray-300 italic"><Loader2 className="animate-spin inline mr-3"/>Recalculating Global Scoring Matrix...</td></tr>
            ) : filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-[#F9F7F2]/20 transition-all group">
                <td className="px-10 py-7">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-[#2D3321] rounded-2xl flex items-center justify-center text-[#C7A987] font-bold shadow-lg shadow-black/10">
                      {lead.full_name.split(' ').map((n:any) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-serif font-bold text-[#2D3321] text-base leading-none">{lead.full_name}</div>
                      <div className="text-[10px] text-gray-400 font-bold mt-1.5">{lead.email}</div>
                    </div>
                  </div>
                </td>

                <td className="px-10 py-7">
                    <div className="w-32">
                        <div className="flex justify-between mb-1.5">
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getScoreColor(lead.ai_score)}`}>{lead.ai_score}%</span>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                           <div className={`h-full transition-all duration-[2s] ${lead.ai_score > 70 ? 'bg-emerald-400 shadow-[0_0_10px_#4ade80]' : 'bg-[#C7A987]'}`} style={{ width: `${lead.ai_score}%` }}></div>
                        </div>
                    </div>
                </td>

                <td className="px-10 py-7">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#2D3321]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C7A987] animate-pulse"></span>
                        {lead.current_status}
                    </div>
                </td>

                <td className="px-10 py-7">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-700 capitalize flex items-center gap-2">
                          <Eye size={12} className="text-[#C7A987]"/> {lead.last_action.replace('_', ' ')}
                        </p>
                        <p className="text-[9px] text-gray-300 font-bold flex items-center gap-1.5"><Clock size={10}/> {lead.last_action_time}</p>
                    </div>
                </td>

                <td className="px-10 py-7 text-right">
                  <button
                    onClick={() => {
                     setSelectedLead(lead);
                     handleOpenAnalysis(lead.id);
                    }}
                    className="bg-gray-50 hover:bg-[#2D3321] hover:text-white p-3 rounded-2xl transition-all"
                    >
                    <ChevronRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
	  {/* MODALE ANALYSIS AVEC DONNÉES RÉELLES */}
{isAnalysisOpen && (
  <div className="fixed inset-0 bg-[#0B1F33]/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-white/20">

      {/* HEADER — toujours visible, sticky */}
      <div className="p-8 border-b border-[#EDE9E0] flex justify-between items-center bg-[#FAF8F4] shrink-0">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#0B1F33]">Prospect Insight Report</h2>
          <p className="text-[10px] uppercase font-bold text-[#C6A77D] tracking-widest mt-1">
            AI Behavioral Analysis
          </p>
        </div>
        <button
          onClick={() => setIsAnalysisOpen(false)}
          className="p-2.5 bg-white rounded-full hover:bg-[#0B1F33] hover:text-white transition-all shadow-sm border border-[#EDE9E0]"
        >
          <X size={18} />
        </button>
      </div>

      {/* CONTENU SCROLLABLE */}
      <div className="p-8 flex-1 overflow-y-auto">
        {fetchingAnalysis ? (
          <div className="flex flex-col items-center py-20 text-gray-300">
            <Loader2 className="animate-spin mb-4" size={36} />
            <p className="italic font-serif text-gray-400">Compiling behavioral data flows...</p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* SCORE BREAKDOWN */}
            <div className="grid grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl bg-[#FAF8F4] border border-[#EDE9E0]">
                <p className="text-[9px] font-bold text-[#C6A77D] uppercase tracking-[0.2em] mb-2">
                  Financial Capital
                </p>
                <div className="text-xl font-serif font-bold text-[#0B1F33]">
                  {analysisData?.financial.tier}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  Investment Score: +{analysisData?.financial.points} pts
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0B1F33] border border-white/5">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2 text-white/50">
                  Engagement Signal
                </p>
                <div className="text-xl font-serif font-bold text-white">
                  Score: {analysisData?.behavioral.points}/50
                </div>
                <div className="text-[10px] mt-1 italic text-[#C6A77D]">
                  Total Interactions: {analysisData?.behavioral.actions_count}
                </div>
              </div>
            </div>

            {/* BEHAVIORAL TIMELINE */}
            <div>
              <h4 className="text-[10px] font-bold text-[#0B1F33] uppercase tracking-widest mb-5 border-l-2 border-[#C6A77D] pl-3">
                Live Interaction Stream
              </h4>
              <div className="space-y-3">
                {analysisData?.history.map((log: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-3 border-b border-[#EDE9E0] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#C6A77D]" />
                      <span className="text-sm font-medium text-[#0B1F33]">{log.action}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">{log.time}</span>
                  </div>
                ))}
				{/* Message si l'historique est tronqué */}
                {analysisData?.history_truncated && (
                 <p className="text-[10px] text-gray-400 italic text-center mt-3">
                   Showing 5 most recent of {analysisData.behavioral.actions_count} total interactions
                 </p>
                )}
              </div>
			  
            </div>

            {/* AUTOMATED DIRECTIVE */}
            <div className="p-7 bg-[#0B1F33] rounded-2xl text-white relative overflow-hidden">
              <Sparkles className="absolute -top-4 -right-4 opacity-10 text-[#C6A77D]" size={140} />
              <h5 className="font-serif text-[#C6A77D] italic text-lg mb-3 relative z-10">
                Strategic Recommendation
              </h5>
              <p className="text-xs text-white/70 leading-relaxed relative z-10">
                The investor <b className="text-white">{analysisData?.full_name}</b> exhibits search
                velocity patterns targeting premium villas. Given the AI Score of{' '}
                <b className="text-[#C6A77D]">{analysisData?.total_score}%</b>, immediate direct contact
                is advised to secure commitment before market redistribution.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}
	  
    </AdminLayout>
	
	
  );
}

