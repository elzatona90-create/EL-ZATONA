import React, { useState, useEffect } from 'react';
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
  MessageSquare
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
    updateCurrentUser,
    theme,
    setTheme,
    language,
    setLanguage,
    deferredPrompt,
    setDeferredPrompt
  } = useStore();
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [sectionSearch, setSectionSearch] = useState('');
  const [profileUpdate, setProfileUpdate] = useState({ username: user?.username || '', password: '' });

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleAISearch = async () => {
    if (!searchQuery) return;
    setIsAiLoading(true);
    
    // Perform local search across all items
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
      setCalcAnalysis(''); // Reset analysis for next entry
    } else {
      alert('Price not found for this combination.');
    }
  };

  const filteredItems = items.filter(item => 
    item.section_id === selectedSection &&
    ((item.title || item.name || '').toLowerCase().includes(sectionSearch.toLowerCase()) ||
     (item.description || '').toLowerCase().includes(sectionSearch.toLowerCase()))
  );

  const handleSetSelectedSection = (sectionId: string | null) => {
    if (sectionId !== selectedSection) {
      window.history.pushState({ tab: activeTab, sub: sectionId }, '', '');
      setSelectedSection(sectionId);
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      selectedSubState={selectedSection}
      setSelectedSubState={setSelectedSection}
    >
      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="space-y-0.5 text-center">
              <h2 className="text-2xl font-black neon-text-blue tracking-tight">
                Welcome Back, {user?.username}!
              </h2>
              <p className="text-gray-400 font-medium tracking-tight text-sm">
                Search through our exclusive database
              </p>
            </div>

            {deferredPrompt && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleInstall}
                className="w-full glass-morphism p-4 rounded-[24px] border-2 border-neon-pink/50 flex items-center justify-between group hover:bg-neon-pink/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-neon-pink/20 flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-neon-pink rotate-180" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-white leading-none">INSTALL APP</p>
                    <p className="text-[8px] font-black text-neon-pink tracking-widest uppercase mt-1">Add to home screen</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neon-pink group-hover:translate-x-1 transition-transform" />
              </motion.button>
            )}

            {/* AI Search Assistant Card */}
            <div className="glass-morphism rounded-[32px] border-2 border-neon-blue/50 relative overflow-hidden flex flex-col shadow-[0_0_30px_rgba(0,102,255,0.15)] mx-auto w-full max-w-md min-h-[500px]">
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md relative">
                {/* Pink neon line at top of assistant card */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-pink to-transparent opacity-70"></div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neon-pink/10 flex items-center justify-center border border-neon-pink/20">
                    <MessageSquare className="w-5 h-5 text-neon-pink" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-white leading-none">{t('ai_assistant')}</h3>
                    <p className="text-[8px] font-black text-neon-pink tracking-[0.1em] uppercase">BY ISLAM AL SAPAA</p>
                  </div>
                </div>
                <button onClick={() => { setAiResponse(null); setGlobalSearchResults([]); }} className="text-gray-600 hover:text-white transition-colors p-1">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col gap-4">
                <div className="bg-[#1a1f35]/80 p-5 rounded-[24px] border border-white/5 relative shadow-inner">
                  <p className="text-base font-bold leading-relaxed text-white">
                    {aiResponse || t('ai_greeting')}
                  </p>
                </div>

                {globalSearchResults.length > 0 && (
                  <div className="space-y-3 pb-4">
                    <p className="text-[10px] font-black text-neon-blue uppercase tracking-[0.2em] px-2">Results</p>
                    {globalSearchResults.map((item) => (
                      <div key={item.id} className="item-card-vertical !border-l-0 !p-4 !rounded-[20px] bg-[#1a1f35]/60 border border-white/10">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-0.5">
                              <p className="text-[7px] font-black text-neon-blue tracking-[0.1em] uppercase">NAME</p>
                              <div className="inline-block px-3 py-0.5 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
                                <h4 className="text-sm font-black text-neon-blue">{item.title || item.name}</h4>
                              </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <div className="px-2 py-0.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-[7px] font-black text-blue-400 uppercase tracking-widest">
                                {item.section?.title || item.section?.name}
                              </div>
                              <button 
                                onClick={() => toggleFavorite(item.id)}
                                className={`p-1 rounded-lg transition-all ${favorites.some(f => f.item_id === item.id && f.user_id === user?.id) ? 'text-neon-pink' : 'text-gray-500 hover:text-white'}`}
                              >
                                <Star className={`w-4 h-4 ${favorites.some(f => f.item_id === item.id && f.user_id === user?.id) ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[7px] font-black text-neon-blue tracking-[0.1em] uppercase">DESCRIPTION</p>
                            <div className="space-y-0.5">
                              {item.description?.split('\n').map((line: string, i: number) => (
                                <p key={i} className="text-xs font-bold text-white leading-tight">
                                  {line}
                                </p>
                              ))}
                            </div>
                          </div>

                          {item.attachment_url && (
                            <a 
                              href={item.attachment_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 bg-neon-blue/5 border border-neon-blue/30 text-neon-blue font-black tracking-widest text-[7px] uppercase px-3 py-1.5 rounded-full hover:bg-neon-blue/20 transition-all w-fit"
                            >
                              <Paperclip className="w-3 h-3" />
                              VIEW
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Input Area */}
              <div className="p-4 pt-2 bg-dark-bg/40 backdrop-blur-sm border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-3 bg-[#1a1f35] rounded-[20px] px-4 py-3 border border-neon-blue/30 shadow-[0_0_10px_rgba(0,102,255,0.1)] focus-within:shadow-[0_0_15px_rgba(255,0,127,0.3)] focus-within:border-neon-pink/50 transition-all">
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
                      placeholder="Ask me..."
                      className="flex-1 bg-transparent focus:outline-none text-sm font-bold text-white placeholder:text-gray-600"
                    />
                    <button className="p-1 text-gray-500 hover:text-neon-blue transition-colors">
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>
                  <button 
                    onClick={handleAISearch}
                    disabled={isAiLoading}
                    className="p-3.5 bg-gradient-to-br from-neon-blue to-neon-pink text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                  >
                    <Send className={`w-4 h-4 ${isAiLoading ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="space-y-1">
              <h2 className="text-4xl font-black neon-text-blue uppercase tracking-tight">
                {t('global_search')}
              </h2>
              <p className="text-gray-400 font-medium tracking-tight">
                Search across all sections and items
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-neon-blue" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // Perform local search across all items and prices
                  const itemResults = items.filter(item => 
                    (item.title || item.name || '').toLowerCase().includes(e.target.value.toLowerCase()) ||
                    (item.description || '').toLowerCase().includes(e.target.value.toLowerCase())
                  ).map(item => ({
                    ...item,
                    type: 'item',
                    section: sections.find(s => s.id === item.section_id)
                  }));

                  const priceResults = prices.filter(price => 
                    price.analysis_name.toLowerCase().includes(e.target.value.toLowerCase()) ||
                    price.company_name.toLowerCase().includes(e.target.value.toLowerCase())
                  ).map(price => ({
                    ...price,
                    id: `price-${price.id}`,
                    title: `${price.analysis_name} (${price.company_name})`,
                    description: `${t('price')}: ${price.price} | ${t('contract')}: ${price.contract_type}`,
                    type: 'price',
                    section: sections.find(s => s.slug === 'prices')
                  }));

                  setGlobalSearchResults([...itemResults, ...priceResults]);
                }}
                placeholder="Search everything..."
                className="w-full glass-morphism border border-neon-blue/50 rounded-[28px] pl-16 pr-6 py-5 focus:outline-none focus:border-neon-blue transition-all text-lg"
              />
            </div>

            <div className="space-y-6">
              {globalSearchResults.map((item) => (
                <div key={item.id} className="item-card-vertical">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-neon-blue tracking-[0.2em] uppercase">
                        {item.section?.emoji} {item.section?.title || item.section?.name}
                      </p>
                      <h4 className="text-xl font-black text-white">{item.title || item.name}</h4>
                    </div>
                    <button 
                      onClick={() => toggleFavorite(item.id)}
                      className={`p-2 rounded-xl transition-all ${favorites.some(f => f.item_id === item.id && f.user_id === user?.id) ? 'text-neon-pink' : 'text-gray-500 hover:text-white'}`}
                    >
                      <Star className={`w-5 h-5 ${favorites.some(f => f.item_id === item.id && f.user_id === user?.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-neon-pink tracking-[0.2em] uppercase">DESCRIPTION</p>
                    <div className="space-y-1">
                      {item.description?.split('\n').map((line: string, i: number) => (
                        <p key={i} className="description-text">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>

                  {item.attachment_url && (
                    <div className="pt-2">
                      <a 
                        href={item.attachment_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-neon-blue/10 text-neon-blue font-bold tracking-wider text-[10px] uppercase px-4 py-2 rounded-full hover:bg-neon-blue/20 transition-all"
                      >
                        <Paperclip className="w-4 h-4" />
                        {t('view_attachment')}
                      </a>
                    </div>
                  )}
                </div>
              ))}
              {searchQuery && globalSearchResults.length === 0 && (
                <div className="text-center py-12 text-gray-500 font-bold">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'sections' && (
          <motion.div 
            key="sections"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {!selectedSection ? (
              <>
                <div className="space-y-4">
                  {sections.map((section) => (
                    <button 
                      key={section.id}
                      onClick={() => handleSetSelectedSection(section.id)}
                      className="w-full glass-morphism p-5 rounded-2xl flex justify-between items-center group hover:border-neon-blue/80 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <FileText className="w-5 h-5 text-neon-blue" />
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold tracking-tight text-white">{section.title || section.name}</span>
                          <span className="px-2 py-0.5 rounded-lg bg-neon-blue/10 border border-neon-blue/20 text-[10px] font-black text-neon-blue">
                            {section.slug === 'prices' ? prices.length : items.filter(i => i.section_id === section.id).length}
                          </span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-neon-blue/20 transition-all">
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-neon-blue" />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <button 
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2 text-neon-blue font-black uppercase tracking-[0.2em] text-[10px] hover:opacity-80 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> BACK TO SECTIONS
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-neon-blue/10 flex items-center justify-center border border-neon-blue/20">
                    <FileText className="w-6 h-6 text-neon-blue" />
                  </div>
                  <div className="flex items-center gap-4">
                    <h3 className="text-3xl font-black text-neon-blue tracking-tight">
                      {sections.find(s => s.id === selectedSection)?.title || sections.find(s => s.id === selectedSection)?.name}
                    </h3>
                    <span className="px-3 py-1 rounded-xl bg-neon-blue/10 border border-neon-blue/20 text-xs font-black text-neon-blue">
                      {sections.find(s => s.id === selectedSection)?.slug === 'prices' ? prices.length : items.filter(i => i.section_id === selectedSection).length}
                    </span>
                  </div>
                </div>

                {sections.find(s => s.id === selectedSection)?.slug === 'prices' && (
                  <div className="glass-morphism p-8 rounded-[32px] space-y-6">
                    <h4 className="text-xl font-black flex items-center gap-3">
                      <Calculator className="w-6 h-6 text-neon-blue" />
                      {t('calculate')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase px-2">{t('select_analysis')}</p>
                        <select 
                          value={calcAnalysis}
                          onChange={(e) => setCalcAnalysis(e.target.value)}
                          className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:border-neon-blue outline-none transition-all appearance-none cursor-pointer font-bold text-white"
                          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%230066ff\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                        >
                          <option value="" className="bg-dark-bg">{t('select_analysis')}</option>
                          {[...new Set(prices.map(p => p.analysis_name))].map(name => (
                            <option key={name} value={name} className="bg-dark-bg">{name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase px-2">{t('select_company')}</p>
                        <select 
                          value={calcCompany}
                          onChange={(e) => setCalcCompany(e.target.value)}
                          className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:border-neon-blue outline-none transition-all appearance-none cursor-pointer font-bold text-white"
                          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%230066ff\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                        >
                          <option value="" className="bg-dark-bg">{t('select_company')}</option>
                          {[...new Set(prices.map(p => p.company_name))].map(name => (
                            <option key={name} value={name} className="bg-dark-bg">{name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase px-2">{t('select_contract')}</p>
                        <select 
                          value={calcContract}
                          onChange={(e) => setCalcContract(e.target.value)}
                          className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:border-neon-blue outline-none transition-all appearance-none cursor-pointer font-bold text-white"
                          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%230066ff\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                        >
                          <option value="" className="bg-dark-bg">{t('select_contract')}</option>
                          {[...new Set(prices.map(p => p.contract_type))].map(type => (
                            <option key={type} value={type} className="bg-dark-bg">{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleAddTest}
                        className="flex-1 bg-neon-blue text-dark-bg font-black py-4 rounded-xl uppercase tracking-widest"
                      >
                        Add
                      </button>
                      <button 
                        onClick={() => {
                          setCalcAnalysis('');
                          setCalcCompany('');
                          setCalcContract('');
                          setInvoiceItems([]);
                        }}
                        className="px-6 bg-white/10 text-white font-black py-4 rounded-xl uppercase tracking-widest"
                      >
                        {t('clear')}
                      </button>
                    </div>

                    {invoiceItems.length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-bold">{t('total')}</span>
                          <span className="text-2xl font-black text-neon-blue">
                            {invoiceItems.reduce((acc, curr) => acc + parseFloat(curr.price), 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {invoiceItems.map((res, idx) => (
                            <div key={idx} className="flex justify-between text-sm items-center bg-white/5 p-3 rounded-xl border border-white/5">
                              <div>
                                <p className="font-bold text-white">{res.analysis_name}</p>
                                <p className="text-[10px] text-gray-400">{res.company_name} - {res.contract_type}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-black text-neon-pink">{res.price}</span>
                                <button 
                                  onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))}
                                  className="text-gray-500 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-blue" />
                  <input 
                    type="text"
                    value={sectionSearch}
                    onChange={(e) => setSectionSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full glass-morphism border border-neon-blue/50 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-neon-blue transition-all text-white placeholder-gray-500"
                  />
                </div>

                <div className="space-y-8">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="item-card-vertical !border-l-0 !p-8 !rounded-[40px] bg-[#1a1f35]/60 border border-white/10">
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-neon-blue tracking-[0.2em] uppercase">NAME</p>
                            <div className="inline-block px-6 py-2 rounded-2xl bg-neon-blue/10 border border-neon-blue/30">
                              <h4 className="text-2xl font-black text-neon-blue">{item.title}</h4>
                            </div>
                          </div>
                          <button 
                            onClick={() => toggleFavorite(item.id)}
                            className={`p-3 rounded-2xl transition-all ${favorites.some(f => f.item_id === item.id && f.user_id === user?.id) ? 'text-neon-pink bg-neon-pink/10' : 'text-gray-500 hover:text-white bg-white/5'}`}
                          >
                            <Star className={`w-6 h-6 ${favorites.some(f => f.item_id === item.id && f.user_id === user?.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-neon-blue tracking-[0.2em] uppercase">DESCRIPTION</p>
                          <div className="space-y-2">
                            {item.description?.split('\n').map((line: string, i: number) => (
                              <p key={i} className="text-lg font-bold text-white leading-relaxed">
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <div className="px-4 py-2 rounded-full bg-blue-900/40 border border-blue-500/30 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                            {sections.find(s => s.id === item.section_id)?.title || sections.find(s => s.id === item.section_id)?.name}
                          </div>
                        </div>

                        {item.attachment_url && (
                          <div className="space-y-3 pt-2">
                            <p className="text-[10px] font-black text-neon-blue tracking-[0.2em] uppercase">ATTACHMENT</p>
                            <a 
                              href={item.attachment_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-3 bg-neon-blue/5 border border-neon-blue/30 text-neon-blue font-black tracking-widest text-[10px] uppercase px-6 py-3 rounded-full hover:bg-neon-blue/20 transition-all"
                            >
                              <Paperclip className="w-4 h-4" />
                              VIEW ATTACHMENT
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'favorites' && (
          <motion.div 
            key="favorites"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="space-y-1">
              <h2 className="text-4xl font-black neon-text-pink uppercase tracking-tight">
                {t('favorites')}
              </h2>
              <p className="text-gray-400 font-medium tracking-tight">
                Your quick access starred items
              </p>
            </div>

            <div className="space-y-6">
              {items.filter(i => favorites.some(f => f.item_id === i.id && f.user_id === user?.id)).map((item) => (
                <div key={item.id} className="item-card-vertical border-neon-pink neon-border-pink">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-neon-pink tracking-[0.2em] uppercase">
                        {sections.find(s => s.id === item.section_id)?.emoji} {sections.find(s => s.id === item.section_id)?.title || sections.find(s => s.id === item.section_id)?.name}
                      </p>
                      <h4 className="text-xl font-black text-white">{item.title}</h4>
                    </div>
                    <button 
                      onClick={() => toggleFavorite(item.id)}
                      className="p-2 rounded-xl transition-all text-neon-pink hover:bg-white/5"
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-neon-pink tracking-[0.2em] uppercase">DESCRIPTION</p>
                    <div className="space-y-1">
                      {item.description?.split('\n').map((line: string, i: number) => (
                        <p key={i} className="description-text">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>

                  {item.attachment_url && (
                    <div className="pt-2">
                      <p className="text-[10px] font-black text-neon-pink tracking-[0.2em] uppercase mb-2">ATTACHMENT</p>
                      <a 
                        href={item.attachment_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-neon-pink/10 text-neon-pink font-bold tracking-wider text-[10px] uppercase px-4 py-2 rounded-full hover:bg-neon-pink/20 transition-all"
                      >
                        <Paperclip className="w-4 h-4" />
                        {t('view_attachment')}
                      </a>
                    </div>
                  )}
                </div>
              ))}
              {favorites.filter(f => f.user_id === user?.id).length === 0 && (
                <div className="text-center py-20 glass-morphism rounded-[32px] border-dashed border-2 border-white/10">
                  <Star className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold">No favorites yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'files' && (
          <motion.div 
            key="files"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <h3 className="text-3xl font-black neon-text-blue">{t('attachments')}</h3>
            <div className="grid grid-cols-1 gap-6">
              {attachments.map((file) => (
                <div key={file.id} className="glass-morphism p-8 rounded-[32px] space-y-6 border border-white/5 hover:border-neon-pink/30 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-neon-pink/10 transition-all">
                      <FileText className="w-8 h-8 text-neon-pink" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black truncate max-w-[200px] text-white">{file.name}</h4>
                      <p className="text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase">
                        REF: {file.name.split('.')[0].toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full glass-morphism bg-white/5 py-5 rounded-[24px] flex items-center justify-center gap-3 font-black tracking-widest text-xs uppercase hover:bg-neon-blue/20 hover:text-neon-blue transition-all border border-white/10"
                  >
                    <Paperclip className="w-5 h-5" />
                    {t('view_document')}
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'me' && (
          <motion.div 
            key="me"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md mx-auto space-y-8"
          >
            <div className="glass-morphism p-8 rounded-[32px] text-center space-y-6">
              <div className="w-32 h-32 rounded-full border-4 border-neon-blue p-1 mx-auto shadow-[0_0_20px_rgba(0,102,255,0.2)]">
                <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center overflow-hidden">
                  <User className="w-16 h-16 text-neon-blue" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">{user?.username}</h3>
                <p className="text-neon-pink font-bold uppercase tracking-widest text-xs">{user?.role}</p>
              </div>
            </div>

            <div className="glass-morphism p-8 rounded-[32px] space-y-6">
              <h4 className="text-xl font-black flex items-center gap-3">
                <Settings className="w-6 h-6 text-neon-blue" />
                {t('settings')}
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase px-2">Update Profile</p>
                  <input 
                    type="text"
                    value={profileUpdate.username}
                    onChange={(e) => setProfileUpdate({...profileUpdate, username: e.target.value})}
                    placeholder="New Username"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-neon-blue outline-none transition-all text-white"
                  />
                  <button 
                    onClick={async () => {
                      if (user) {
                        await updateCurrentUser({ username: profileUpdate.username });
                        alert('Profile updated successfully');
                      }
                    }}
                    className="w-full bg-neon-blue text-white font-black py-3 rounded-xl uppercase tracking-widest text-xs shadow-[0_0_15px_rgba(0,102,255,0.3)] hover:bg-white hover:text-dark-bg transition-all"
                  >
                    Save Changes
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 glass-morphism bg-white/5 rounded-2xl">
                  <span className="font-bold text-white">{t('language')}</span>
                  <button 
                    onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
                    className="text-neon-blue font-black uppercase tracking-widest text-xs"
                  >
                    {i18n.language === 'en' ? 'العربية' : 'English'}
                  </button>
                </div>

                <button 
                  onClick={() => setUser(null)}
                  className="w-full flex justify-between items-center p-4 glass-morphism bg-red-400/10 border-red-400/20 rounded-2xl text-red-500 font-bold hover:bg-red-400/20 transition-all"
                >
                  <span>{t('logout')}</span>
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
