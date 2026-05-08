"use client";

import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { propertiesApi, Property } from '../../lib/api';
import { 
  Home, 
  MapPin, 
  X, 
  Search, 
  FileText, 
  Share2, 
  ExternalLink,
  Loader2,
  Sparkles, // <-- IL MANQUAIT CELUI-LÀ
  Search as SearchIcon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'article' | 'social'>('article');
  const [fetchingData, setFetchingData] = useState(false);
  
  // Content States
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const [aiArticle, setAiArticle] = useState<any>(null);
  const [socialPosts, setSocialPosts] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await propertiesApi.getAll();
      setProperties(data);
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenIntelligence = async (prop: Property) => {
    setSelectedProp(prop);
    setFetchingData(true);
    setIsModalOpen(true);
    setActiveTab('article');

    try {
      const [article, social] = await Promise.all([
        propertiesApi.getAIArticle(prop.id),
        propertiesApi.getSocialPosts(prop.id)
      ]);
      setAiArticle(article);
      setSocialPosts(social);
    } catch (error) {
      console.error("Content not ready yet");
      setAiArticle(null);
      setSocialPosts(null);
    } finally {
      setFetchingData(false);
    }
  };

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* HEADER SECTION */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2D3321]">Real Estate Portfolio</h1>
          <p className="text-gray-500 mt-1 italic">Manage your listings and AI-generated marketing intelligence.</p>
        </div>
        
        {/* SEARCH BAR */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C7A987] transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search by title or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#C7A987]/20 focus:border-[#C7A987] transition-all w-80 shadow-sm text-sm"
          />
        </div>
      </div>

      {/* PROPERTIES TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F9F7F2] text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold border-b border-gray-100">
              <th className="px-8 py-5 text-left">Property Asset</th>
              <th className="px-8 py-5 text-left">Location</th>
              <th className="px-8 py-5 text-left">Price</th>
              <th className="px-8 py-5 text-left">Status</th>
              <th className="px-8 py-5 text-right">Marketing Pack</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center text-gray-400 italic">Analyzing database...</td></tr>
            ) : filteredProperties.length === 0 ? (
              <tr><td colSpan={5} className="py-20 text-center text-gray-400 italic">No properties found.</td></tr>
            ) : (
              filteredProperties.map((prop) => (
                <tr key={prop.id} className="hover:bg-[#F9F7F2]/30 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#2D3321] text-[#C7A987] w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-[#2D3321]/10">
                        <Home size={20} />
                      </div>
                      <div>
                        <div className="font-serif font-bold text-[#2D3321] text-base">{prop.title}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{prop.type} • {prop.area_sqm} sqm</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <MapPin size={14} className="text-[#C7A987]" />
                      {prop.neighborhood || 'N/A'}, {prop.location}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-serif font-bold text-[#C7A987] text-lg">
                      {prop.price ? prop.price.toLocaleString() : '0'} <span className="text-[10px] ml-0.5 uppercase">MAD</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                      prop.status === 'available' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                      {prop.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleOpenIntelligence(prop)}
                      className="inline-flex items-center gap-2 bg-[#2D3321] text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95"
                    >
                      <Sparkles size={14} className="text-[#C7A987]" />
                      AI Intelligence
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- INTELLIGENCE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#2D3321]/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-white/20">
            
            <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-[#F9F7F2]/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#2D3321] rounded-2xl flex items-center justify-center text-[#C7A987]">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h2 className="font-serif text-2xl font-bold text-[#2D3321]">{selectedProp?.title}</h2>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Marketing Intelligence Pack</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-3 bg-white rounded-2xl text-gray-400 hover:text-red-500 shadow-sm border border-gray-100 transition-all hover:rotate-90"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-10 py-4 flex gap-8 border-b border-gray-50">
                <button 
                    onClick={() => setActiveTab('article')}
                    className={`flex items-center gap-2 pb-2 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'article' ? 'border-[#C7A987] text-[#2D3321]' : 'border-transparent text-gray-400'}`}
                >
                    <FileText size={16} /> Expert SEO Article
                </button>
                <button 
                    onClick={() => setActiveTab('social')}
                    className={`flex items-center gap-2 pb-2 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'social' ? 'border-[#C7A987] text-[#2D3321]' : 'border-transparent text-gray-400'}`}
                >
                    <Share2 size={16} /> Social Media Pack
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 bg-white">
              {fetchingData ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                    <Loader2 className="animate-spin text-[#C7A987]" size={40} />
                    <p className="text-sm italic">Retrieving AI content from secure storage...</p>
                </div>
              ) : !aiArticle ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                    <p className="text-gray-400 text-sm">This property doesn't have AI content yet.</p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'article' ? (
                        <article className="prose prose-stone max-w-none 
                            prose-headings:font-serif prose-headings:text-[#2D3321] 
                            prose-p:text-[#2D3321]/80 prose-p:leading-relaxed
                            prose-table:border prose-table:rounded-2xl prose-table:overflow-hidden
                            prose-th:bg-[#F9F7F2] prose-th:p-4 prose-td:p-4">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {aiArticle.content}
                            </ReactMarkdown>
                        </article>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-[#2D3321] p-8 rounded-[2rem] text-white shadow-xl">
                                <h4 className="text-[10px] font-bold uppercase text-[#C7A987] mb-6 tracking-widest border-b border-white/10 pb-4">Instagram</h4>
                                <p className="text-sm opacity-90 leading-relaxed whitespace-pre-wrap">{socialPosts?.instagram}</p>
                            </div>
                            <div className="bg-[#F9F7F2] p-8 rounded-[2rem] border border-[#C7A987]/10">
                                <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-6 tracking-widest border-b border-gray-100 pb-4">Facebook</h4>
                                <p className="text-sm text-[#2D3321]/80 leading-relaxed whitespace-pre-wrap">{socialPosts?.facebook}</p>
                            </div>
                        </div>
                    )}
                </div>
              )}
            </div>

            <div className="p-8 border-t border-gray-100 flex justify-end items-center bg-[#F9F7F2]/30">
              <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
              >
                  Close
              </button>
              <button className="bg-[#C7A987] text-white px-8 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-[#b69a7a] transition-all shadow-lg">
                  <ExternalLink size={16} /> Push to Website
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}