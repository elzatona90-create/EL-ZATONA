import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  LogOut, 
  Send, 
  Globe, 
  Layout as LayoutIcon,
  FileText,
  ChevronRight,
  Mic,
  ArrowLeft,
  Settings,
  Trash2,
  Paperclip,
  User,
  Star,
  Calculator,
  MessageSquare,
  Clock,
  Zap,
  Filter
} from 'lucide-react';
import { getAISearchResponse } from '../services/gemini';
import Layout from '../components/Layout';

export default function UserDashboard() {
  const { t, i18n } = useTranslation();
  const { 
    user, 
    setUser, 
    sections,
    items,
    attachments,
    favorites,
    toggleFavorite,
    logSearch,
    prices,
    updateCurrentUser
  } = useStore();
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [sectionSearch, setSectionSearch] = useState('');
  const [profileUpdate, setProfileUpdate] = useState({ username: user?.username || '', password: '' });

  // Filtered lists for the Home tab
  const latestItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const dateA = a.created_at?.toMillis?.() || 0;
      const dateB = b.created_at?.toMillis?.() || 0;
      return dateB - dateA;
    }).slice(0, 5);
  }, [items]);

  const contractItems = useMemo(() => {
    return items.filter(item => {
      const section = sections.find(s => s.id === item.section_id);
      return section?.slug === 'contracts' || section?.name?.toLowerCase().includes('contract');
    }).slice(0, 10);
  }, [items, sections]);

  const handleAISearch = async () => {
    if (!searchQuery) return;
    setIsAiLoading(true);
    
    const results = items.filter(item => 
      (item.title || item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    ).map(item => ({
      ...item,
      section: sections.find(s => s.id === item.section_id)
    }));
    
    setGlobalSearchResults(results);
    logSearch(searchQuery, 'global');

    const context = JSON.stringify(results.slice(0, 5));
    const response = await getAISearchResponse(searchQuery, context);
    setAiResponse(response || null);
    setIsAiLoading(false);
  };

  const [calcAnalysis, setCalcAnalysis] = useState('');
  const [calcCompany, setCalcCompany] = useState('');
  const [calcContract, setCalcContract] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);

  const handleAddTest = () => {
    if (!calcAnalysis || !calcCompany || !calcContract) return;
    const priceEntry = prices.find(p => 
      p.analysis_name === calcAnalysis && 
      p.company_name === calcCompany && 
      p.contract_type === calcContract
    );
    if (priceEntry) {
      setInvoiceItems([...invoiceItems, priceEntry]);
      setCalcAnalysis('');
    }
  };

  const filteredItems = items.filter(item => 
    item.section_id === selectedSection &&
    ((item.title || item.name || '').toLowerCase().includes(sectionSearch.toLowerCase()) ||
     (item.description || '').toLowerCase().includes(sectionSearch.toLowerCase()))
  );


  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 pb-20"
          >
            {/* Header section */}
            <div className="flex items-center justify-between">
              <div className="space-y-1 text-left">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  {t('welcome')}, <span className="text-teal-600">{user?.username}</span>
                </h2>
                <p className="text-slate-500 font-medium">{t('search_exclusive')}</p>
              </div>
            </div>

            {/* AI Search Assistant Card */}
            <div className="bg-white border border-slate-200 rounded-[32px] shadow-xl relative overflow-hidden flex flex-col mx-auto w-full max-w-[400px]">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100">
                    <MessageSquare className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{t('ai_assistant')}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('ai_powered')}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm leading-relaxed text-slate-600">
                  {aiResponse || t('ai_greeting')}
                </div>

                {globalSearchResults.map((item) => (
                  <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-100 flex items-center gap-3 hover:border-teal-200 transition-colors cursor-pointer" onClick={() => {
                    setSelectedSection(item.section_id);
                    setActiveTab('sections');
                  }}>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs truncate text-slate-900">{item.title || item.name}</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{item.section?.title || 'GENERAL'}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
                    placeholder={t('ai_placeholder')}
                    className="flex-1 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 text-sm focus:border-teal-600 outline-none transition-all placeholder:text-slate-400"
                  />
                  <button 
                    onClick={handleAISearch}
                    disabled={isAiLoading}
                    className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Send className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Other tabs remain refined with the same item-card-technical style */}
        {activeTab === 'sections' && (
          <motion.div 
            key="sections"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6 pb-20"
          >
            {!selectedSection ? (
              <div className="grid grid-cols-1 gap-4">
                {sections.map((section) => (
                  <button 
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className="item-card-technical flex justify-between items-center group !p-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center border border-neon-cyan/20">
                        <FileText className="w-5 h-5 text-neon-cyan" />
                      </div>
                      <span className="text-base font-bold text-white group-hover:text-neon-cyan transition-colors">{section.title || section.name}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <button 
                  onClick={() => setSelectedSection(null)}
                  className="flex items-center gap-2 micro-label text-neon-cyan hover:opacity-80 transition-all mb-4"
                >
                  <ArrowLeft className="w-4 h-4" /> RET TO CATEGORIES
                </button>

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-neon-cyan/10 flex items-center justify-center border border-neon-cyan/20">
                    <FileText className="w-7 h-7 text-neon-cyan" />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight">
                    {sections.find(s => s.id === selectedSection)?.title || sections.find(s => s.id === selectedSection)?.name}
                  </h3>
                </div>

                <div className="relative mb-8">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text"
                    value={sectionSearch}
                    onChange={(e) => setSectionSearch(e.target.value)}
                    placeholder="Filter records..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:border-neon-cyan/50 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredItems.map((item) => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      favorites={favorites} 
                      user={user} 
                      sections={sections} 
                      toggleFavorite={toggleFavorite} 
                    />
                  ))}
                  {filteredItems.length === 0 && <div className="text-center py-20 opacity-50 col-span-full">No records found.</div>}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Settings / Profile */}
        {activeTab === 'me' && (
          <motion.div 
            key="me"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto space-y-8 pb-20"
          >
            <div className="bg-white border border-slate-200 p-8 rounded-[32px] text-center space-y-4 shadow-xl">
              <div className="w-24 h-24 rounded-full border border-slate-100 p-1 mx-auto shadow-inner">
                <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center">
                  <User className="w-10 h-10 text-teal-600" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">{user?.username}</h3>
                <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest">{user?.role}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-[32px] space-y-6 shadow-xl">
              <h4 className="text-lg font-black flex items-center gap-3 text-slate-900">
                <Settings className="w-5 h-5 text-teal-600" />
                {t('settings')}
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('username')}</p>
                  <input 
                    type="text"
                    value={profileUpdate.username}
                    onChange={(e) => setProfileUpdate({...profileUpdate, username: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 focus:border-teal-600 outline-none transition-all"
                  />
                  <button 
                    onClick={async () => {
                      if (user) {
                        await updateCurrentUser({ username: profileUpdate.username });
                        alert('Updated.');
                      }
                    }}
                    className="w-full bg-teal-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-teal-700 transition-colors"
                  >
                    {t('save')}
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="font-bold text-sm text-slate-700">{t('language')}</span>
                  <button 
                    onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
                    className="text-teal-600 font-bold text-xs uppercase tracking-widest"
                  >
                    {i18n.language === 'en' ? 'العربية' : 'English'}
                  </button>
                </div>

                <button 
                  onClick={() => setUser(null)}
                  className="w-full flex justify-between items-center p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-colors"
                >
                  <span>{t('sign_out')}</span>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </Layout>
  );
}

function ItemCard({ item, favorites, user, sections, toggleFavorite }: { item: any, favorites: any[], user: any, sections: any[], toggleFavorite: (id: string) => Promise<void> | void, key?: any }) {
  const { t } = useTranslation();
  const isFav = favorites.some(f => f.item_id === item.id && f.user_id === user?.id);
  const section = sections.find(s => s.id === item.section_id);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{section?.title || section?.name || 'GENERAL'}</p>
          <h4 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">
            {item.title || item.name}
          </h4>
        </div>
        <button 
          onClick={() => toggleFavorite(item.id)}
          className={`p-2 rounded-xl border transition-all ${isFav ? 'text-pink-600 bg-pink-50 border-pink-100' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50 border-slate-100'}`}
        >
          <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="space-y-3 flex-1">
        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 italic">
          {item.description || 'No description provided.'}
        </p>
      </div>
      
      <div className="flex items-center justify-between pt-4 mt-auto border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {item.created_at ? new Date(item.created_at.toMillis?.() || item.created_at).toLocaleDateString() : ''}
        </span>
        {item.attachment_url && (
          <a 
            href={item.attachment_url} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 text-[10px] font-black text-teal-600 hover:text-teal-700 uppercase tracking-widest px-3 py-1 bg-teal-50 rounded-lg transition-colors"
          >
            <Paperclip className="w-3 h-3" />
            {t('view_attachment')}
          </a>
        )}
      </div>
    </div>
  );
}
