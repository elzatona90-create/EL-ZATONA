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
    setLanguage
  } = useStore();
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [sectionSearch, setSectionSearch] = useState('');
  const [profileUpdate, setProfileUpdate] = useState({ username: user?.username || '', password: '' });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

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

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="space-y-1">
              <h2 className="text-3xl font-black neon-text-cyan">
                {t('welcome')}, {user?.username}!
              </h2>
              <p className="text-gray-400 font-medium tracking-tight">
                {t('search_exclusive')}
              </p>
            </div>

            {/* AI Search Assistant Card */}
            <div className="glass-morphism rounded-[32px] border border-white/5 space-y-6 relative overflow-hidden min-h-[500px] flex flex-col">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-neon-cyan/20 flex items-center justify-center border border-neon-cyan/30">
                    <MessageSquare className="w-6 h-6 text-neon-cyan" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl leading-tight">{t('ai_assistant')}</h3>
                    <p className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase">{t('ai_powered')}</p>
                  </div>
                </div>
                <button onClick={() => { setAiResponse(null); setGlobalSearchResults([]); }} className="text-gray-600 hover:text-white transition-colors">
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 flex-1 flex flex-col gap-8 overflow-y-auto max-h-[600px]">
                <div className="bg-[#2a2f4c] p-8 rounded-[32px] border border-white/5 relative">
                  <div className="absolute -left-2 top-8 w-4 h-4 bg-[#2a2f4c] rotate-45 border-l border-b border-white/5"></div>
                  <p className="text-lg font-bold leading-relaxed text-white">
                    {aiResponse || t('ai_greeting')}
                  </p>
                </div>

                {globalSearchResults.length > 0 && (
                  <div className="space-y-6">
                    <p className="text-sm font-black text-neon-cyan uppercase tracking-widest px-4">Search Results</p>
                    {globalSearchResults.map((item) => (
                      <div key={item.id} className="item-card-vertical">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-neon-cyan tracking-[0.2em] uppercase">
                              {item.section?.emoji} {item.section?.title || item.section?.name}
                            </p>
                            <h4 className="text-xl font-black text-white">{item.title || item.name}</h4>
                          </div>
                          <button 
                            onClick={() => toggleFavorite(item.id)}
                            className={`p-2 rounded-xl transition-all ${favorites.some(f => f.item_id === item.id && f.user_id === user?.id) ? 'text-neon-magenta' : 'text-gray-500 hover:text-white'}`}
                          >
                            <Star className={`w-5 h-5 ${favorites.some(f => f.item_id === item.id && f.user_id === user?.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-neon-magenta tracking-[0.2em] uppercase">DESCRIPTION</p>
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
                              className="inline-flex items-center gap-2 bg-neon-cyan/10 text-neon-cyan font-bold tracking-wider text-[10px] uppercase px-4 py-2 rounded-full hover:bg-neon-cyan/20 transition-all"
                            >
                              <Paperclip className="w-4 h-4" />
                              {t('view_attachment')}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Input Area */}
              <div className="p-8 pt-0">
                <div className="flex items-center gap-4 bg-[#2a2f4c] rounded-[24px] px-6 py-4 border-2 border-white/10 focus-within:border-neon-cyan transition-all">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
                    placeholder={t('ai_placeholder')}
                    className="flex-1 bg-transparent focus:outline-none text-lg font-bold px-2"
                  />
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Mic className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={handleAISearch}
                      disabled={isAiLoading}
                      className="p-3 bg-neon-cyan text-dark-bg rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,242,255,0.4)]"
                    >
                      <Send className={`w-6 h-6 ${isAiLoading ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>
                </div>
                <div className="text-center mt-6 space-y-1">
                  <p className="text-[10px] font-black text-neon-cyan tracking-[0.2em] uppercase">{t('footer_team')}</p>
                  <p className="text-[9px] font-black text-neon-magenta tracking-[0.2em] uppercase">{t('branding_content')}</p>
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
              <h2 className="text-4xl font-black neon-text-cyan uppercase tracking-tight">
                {t('global_search')}
              </h2>
              <p className="text-gray-400 font-medium tracking-tight">
                Search across all sections and items
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-neon-cyan" />
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
                className="w-full glass-morphism border border-neon-cyan/50 rounded-[28px] pl-16 pr-6 py-5 focus:outline-none focus:border-neon-cyan transition-all text-lg"
              />
            </div>

            <div className="space-y-6">
              {globalSearchResults.map((item) => (
                <div key={item.id} className="item-card-vertical">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-neon-cyan tracking-[0.2em] uppercase">
                        {item.section?.emoji} {item.section?.title || item.section?.name}
                      </p>
                      <h4 className="text-xl font-black text-white">{item.title || item.name}</h4>
                    </div>
                    <button 
                      onClick={() => toggleFavorite(item.id)}
                      className={`p-2 rounded-xl transition-all ${favorites.some(f => f.item_id === item.id && f.user_id === user?.id) ? 'text-neon-magenta' : 'text-gray-500 hover:text-white'}`}
                    >
                      <Star className={`w-5 h-5 ${favorites.some(f => f.item_id === item.id && f.user_id === user?.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-neon-magenta tracking-[0.2em] uppercase">DESCRIPTION</p>
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
                        className="inline-flex items-center gap-2 bg-neon-cyan/10 text-neon-cyan font-bold tracking-wider text-[10px] uppercase px-4 py-2 rounded-full hover:bg-neon-cyan/20 transition-all"
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
                      onClick={() => setSelectedSection(section.id)}
                      className="w-full glass-morphism p-5 rounded-2xl flex justify-between items-center group hover:border-neon-cyan/80 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <FileText className="w-5 h-5 text-neon-cyan" />
                        <span className="text-lg font-bold tracking-tight text-white">{section.title || section.name}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-neon-cyan/20 transition-all">
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-neon-cyan" />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <button 
                  onClick={() => setSelectedSection(null)}
                  className="flex items-center gap-2 text-neon-cyan font-bold uppercase tracking-widest text-xs hover:opacity-80 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> BACK TO SECTIONS
                </button>

                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-neon-cyan" />
                  <h3 className="text-2xl font-black text-neon-cyan">
                    {sections.find(s => s.id === selectedSection)?.title || sections.find(s => s.id === selectedSection)?.name}
                  </h3>
                </div>

                {sections.find(s => s.id === selectedSection)?.slug === 'prices' && (
                  <div className="glass-morphism p-8 rounded-[32px] space-y-6">
                    <h4 className="text-xl font-black flex items-center gap-3">
                      <Calculator className="w-6 h-6 text-neon-cyan" />
                      {t('calculate')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase px-2">{t('select_analysis')}</p>
                        <select 
                          value={calcAnalysis}
                          onChange={(e) => setCalcAnalysis(e.target.value)}
                          className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:border-neon-cyan outline-none transition-all appearance-none cursor-pointer font-bold text-white"
                          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2300f2ff\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
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
                          className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:border-neon-cyan outline-none transition-all appearance-none cursor-pointer font-bold text-white"
                          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2300f2ff\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
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
                          className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:border-neon-cyan outline-none transition-all appearance-none cursor-pointer font-bold text-white"
                          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2300f2ff\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
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
                        className="flex-1 bg-neon-cyan text-dark-bg font-black py-4 rounded-xl uppercase tracking-widest"
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
                          <span className="text-2xl font-black text-neon-cyan">
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
                                <span className="font-black text-neon-magenta">{res.price}</span>
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
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-cyan" />
                  <input 
                    type="text"
                    value={sectionSearch}
                    onChange={(e) => setSectionSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full glass-morphism border border-neon-cyan/50 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-neon-cyan transition-all text-white placeholder-gray-500"
                  />
                </div>

                <div className="space-y-6">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="item-card-vertical">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-neon-cyan tracking-[0.2em] uppercase">
                            {sections.find(s => s.id === item.section_id)?.emoji} {sections.find(s => s.id === item.section_id)?.title || sections.find(s => s.id === item.section_id)?.name}
                          </p>
                          <h4 className="text-xl font-black text-white">{item.title}</h4>
                        </div>
                        <button 
                          onClick={() => toggleFavorite(item.id)}
                          className={`p-2 rounded-xl transition-all ${favorites.some(f => f.item_id === item.id && f.user_id === user?.id) ? 'text-neon-magenta' : 'text-gray-500 hover:text-white'}`}
                        >
                          <Star className={`w-5 h-5 ${favorites.some(f => f.item_id === item.id && f.user_id === user?.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-neon-magenta tracking-[0.2em] uppercase">DESCRIPTION</p>
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
                            className="inline-flex items-center gap-2 bg-neon-cyan/10 text-neon-cyan font-bold tracking-wider text-[10px] uppercase px-4 py-2 rounded-full hover:bg-neon-cyan/20 transition-all"
                          >
                            <Paperclip className="w-4 h-4" />
                            {t('view_attachment')}
                          </a>
                        </div>
                      )}
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
              <h2 className="text-4xl font-black neon-text-magenta uppercase tracking-tight">
                {t('favorites')}
              </h2>
              <p className="text-gray-400 font-medium tracking-tight">
                Your quick access starred items
              </p>
            </div>

            <div className="space-y-6">
              {items.filter(i => favorites.some(f => f.item_id === i.id && f.user_id === user?.id)).map((item) => (
                <div key={item.id} className="item-card-vertical border-neon-magenta neon-border-magenta">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-neon-magenta tracking-[0.2em] uppercase">
                        {sections.find(s => s.id === item.section_id)?.emoji} {sections.find(s => s.id === item.section_id)?.title || sections.find(s => s.id === item.section_id)?.name}
                      </p>
                      <h4 className="text-xl font-black text-white">{item.title}</h4>
                    </div>
                    <button 
                      onClick={() => toggleFavorite(item.id)}
                      className="p-2 rounded-xl transition-all text-neon-magenta hover:bg-white/5"
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-neon-magenta tracking-[0.2em] uppercase">DESCRIPTION</p>
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
                      <p className="text-[10px] font-black text-neon-magenta tracking-[0.2em] uppercase mb-2">ATTACHMENT</p>
                      <a 
                        href={item.attachment_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-neon-magenta/10 text-neon-magenta font-bold tracking-wider text-[10px] uppercase px-4 py-2 rounded-full hover:bg-neon-magenta/20 transition-all"
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
            <h3 className="text-3xl font-black neon-text-cyan">{t('attachments')}</h3>
            <div className="grid grid-cols-1 gap-6">
              {attachments.map((file) => (
                <div key={file.id} className="glass-morphism p-8 rounded-[32px] space-y-6 border border-white/5 hover:border-neon-magenta/30 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-neon-magenta/10 transition-all">
                      <FileText className="w-8 h-8 text-neon-magenta" />
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
                    className="w-full glass-morphism bg-white/5 py-5 rounded-[24px] flex items-center justify-center gap-3 font-black tracking-widest text-xs uppercase hover:bg-neon-cyan/20 hover:text-neon-cyan transition-all border border-white/10"
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
              <div className="w-32 h-32 rounded-full border-4 border-neon-cyan p-1 mx-auto">
                <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center overflow-hidden">
                  <User className="w-16 h-16 text-neon-cyan" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black">{user?.username}</h3>
                <p className="text-neon-magenta font-bold uppercase tracking-widest text-xs">{user?.role}</p>
              </div>
            </div>

            <div className="glass-morphism p-8 rounded-[32px] space-y-6">
              <h4 className="text-xl font-black flex items-center gap-3">
                <Settings className="w-6 h-6 text-neon-cyan" />
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-neon-cyan outline-none transition-all"
                  />
                  <button 
                    onClick={async () => {
                      if (user) {
                        await updateCurrentUser({ username: profileUpdate.username });
                        alert('Profile updated successfully');
                      }
                    }}
                    className="w-full bg-neon-cyan text-dark-bg font-black py-3 rounded-xl uppercase tracking-widest text-xs"
                  >
                    Save Changes
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 glass-morphism bg-white/5 rounded-2xl">
                  <span className="font-bold">{t('language')}</span>
                  <button 
                    onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
                    className="text-neon-cyan font-black uppercase tracking-widest text-xs"
                  >
                    {i18n.language === 'en' ? 'العربية' : 'English'}
                  </button>
                </div>

                {deferredPrompt && (
                  <button 
                    onClick={handleInstall}
                    className="w-full flex justify-between items-center p-4 glass-morphism bg-neon-cyan/10 border-neon-cyan/20 rounded-2xl text-neon-cyan font-bold"
                  >
                    <span>Download App</span>
                    <Settings className="w-5 h-5" />
                  </button>
                )}

                <button 
                  onClick={() => setUser(null)}
                  className="w-full flex justify-between items-center p-4 glass-morphism bg-red-400/10 border-red-400/20 rounded-2xl text-red-400 font-bold"
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
