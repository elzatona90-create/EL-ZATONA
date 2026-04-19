import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users,
  Palette,
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Search, 
  LogOut, 
  Send, 
  Layout as LayoutIcon,
  FileText,
  ChevronRight,
  ArrowLeft,
  Settings,
  User as UserIcon,
  Paperclip,
  Upload,
  UserPlus,
  BarChart3,
  Calculator,
  Star,
  Download,
  Search as SearchIcon,
  TrendingUp,
  History,
  Database
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { getAISearchResponse } from '../services/gemini';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const { 
    user, 
    setUser, 
    sections, 
    items, 
    prices,
    favorites,
    searchLogs,
    attachments,
    users,
    logout,
    setTheme,
    theme,
    addSection, 
    updateSection,
    deleteSection,
    addItem,
    updateItem,
    deleteItem,
    addPrice,
    updatePrice,
    deletePrice,
    addAttachment,
    deleteAttachment,
    deleteUser,
    addUser,
    updateUser,
    updateCurrentUser,
    fetchData,
    seedSections,
    toggleFavorite
  } = useStore();

  const [activeTab, setActiveTab] = useState('home');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newSection, setNewSection] = useState({ name: '', emoji: '', slug: '' });
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ title: '', description: '', category: '', section_id: '', attachment_url: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' as const });
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
  
  // Prices Calculator State
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

  const [isAddingPrice, setIsAddingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState({ analysis_name: '', company_name: '', contract_type: '', price: '' });

  // Global Search State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([]);

  // Section Search State
  const [sectionSearchQuery, setSectionSearchQuery] = useState('');

  // Attachment Search
  const [attachmentSearch, setAttachmentSearch] = useState('');

  const handleAddSection = async () => {
    if (!newSection.name || !newSection.slug) return;
    await addSection(newSection);
    setNewSection({ name: '', emoji: '', slug: '' });
    setIsAddingSection(false);
  };

  const handleAddItem = async () => {
    if (!newItem.title || !selectedSection) return;
    if (editingItem) {
      await updateItem(editingItem, newItem);
      setEditingItem(null);
    } else {
      await addItem({ ...newItem, section_id: selectedSection });
    }
    setNewItem({ title: '', description: '', category: '', section_id: '', attachment_url: '' });
    setIsAddingItem(false);
  };

  const handleAddPrice = async () => {
    if (!newPrice.analysis_name || !newPrice.price) return;
    await addPrice({ ...newPrice, price: parseFloat(newPrice.price) });
    setNewPrice({ analysis_name: '', company_name: '', contract_type: '', price: '' });
    setIsAddingPrice(false);
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(fileName);

      await addAttachment(file.name, publicUrl, file.size);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleItemAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(fileName);

      await addAttachment(newItem.title || file.name, publicUrl, file.size, editingItem || undefined, selectedSection || undefined);
      setNewItem({...newItem, attachment_url: publicUrl});
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGlobalSearch = (query: string) => {
    setGlobalSearchQuery(query);
    if (!query) {
      setGlobalSearchResults([]);
      return;
    }
    const itemResults = items.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.description?.toLowerCase().includes(query.toLowerCase())
    ).map(item => ({
      ...item,
      section: sections.find(s => s.id === item.section_id)
    }));

    const priceResults = prices.filter(p => 
      p.analysis_name.toLowerCase().includes(query.toLowerCase()) ||
      p.company_name.toLowerCase().includes(query.toLowerCase())
    ).map(p => ({
      id: p.id,
      title: p.analysis_name,
      description: `${p.company_name} | ${p.contract_type} | Price: ${p.price}`,
      section_id: sections.find(s => s.slug === 'prices')?.id,
      section: sections.find(s => s.slug === 'prices')
    }));

    setGlobalSearchResults([...itemResults, ...priceResults]);
  };


  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password) return;
    await addUser(newUser);
    setNewUser({ username: '', password: '', role: 'user' });
    setIsAddingUser(false);
  };

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
            className="space-y-8"
          >
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <h2 className="text-4xl font-black neon-text-blue uppercase tracking-tight">
                  {t('analytics')}
                </h2>
                <p className="text-gray-400 font-medium tracking-tight">
                  {t('welcome')}, {user?.username}
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl glass-morphism border-neon-pink/30 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-neon-pink" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-morphism p-6 rounded-[24px] border-l-4 border-neon-blue">
                <p className="text-[10px] font-black text-neon-blue tracking-widest uppercase mb-1">TOTAL SECTIONS</p>
                <h4 className="text-3xl font-black">{sections.length}</h4>
              </div>
              <div className="glass-morphism p-6 rounded-[24px] border-l-4 border-neon-pink shadow-[0_0_20px_rgba(255,0,127,0.1)]">
                <p className="text-[10px] font-black text-neon-pink tracking-widest uppercase mb-1">TOTAL USERS</p>
                <h4 className="text-3xl font-black neon-text-pink">{users.length}</h4>
              </div>
            </div>

            {/* Top 5 Searches Chart */}
            <div className="glass-morphism p-8 rounded-[32px] space-y-6">
              <h3 className="text-xl font-black flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-neon-blue" />
                {t('top_searches')}
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={searchLogs.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="search_term" stroke="#666" fontSize={10} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#0066ff' }}
                    />
                    <Bar dataKey="count" fill="#0066ff" radius={[4, 4, 0, 0]}>
                      {searchLogs.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0066ff' : '#ff007f'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* User Activity List */}
            <div className="glass-morphism p-8 rounded-[32px] space-y-6">
              <h3 className="text-xl font-black flex items-center gap-3">
                <History className="w-6 h-6 text-neon-pink" />
                {t('user_activity')}
              </h3>
              <div className="space-y-4">
                {searchLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div>
                      <p className="font-bold text-sm">{log.search_term}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                        {users.find(u => u.id === log.user_id)?.username || 'Anonymous'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-neon-blue">{log.count} {t('search_count')}</p>
                      <p className="text-[8px] text-gray-600 uppercase">
                        {new Date(log.last_searched_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
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
              <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
              <input 
                type="text"
                value={globalSearchQuery}
                onChange={(e) => handleGlobalSearch(e.target.value)}
                placeholder="Search everything..."
                className="w-full bg-white/5 border-2 border-white/10 rounded-[28px] pl-16 pr-6 py-5 focus:outline-none focus:border-neon-blue transition-all text-lg"
              />
            </div>

            <div className="space-y-6">
              {globalSearchResults.map((item) => (
                <div 
                  key={item.id} 
                  className="item-card-vertical cursor-pointer group"
                  onClick={() => {
                    handleSetSelectedSection(item.section_id);
                    setActiveTab('sections');
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-neon-blue tracking-[0.2em] uppercase">
                        {item.section?.emoji} {item.section?.title || item.section?.name}
                      </p>
                      <h4 className="text-xl font-black text-white">{item.title}</h4>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className={`p-2 rounded-xl transition-all ${favorites.some(f => f.item_id === item.id && f.user_id === user?.id) ? 'text-neon-pink' : 'text-gray-500 hover:text-white'}`}
                      >
                        <Star className={`w-5 h-5 ${favorites.some(f => f.item_id === item.id && f.user_id === user?.id) ? 'fill-current' : ''}`} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSection(item.section_id);
                          setEditingItem(item.id);
                          setNewItem({
                            title: item.title,
                            description: item.description || '',
                            category: item.category || '',
                            section_id: item.section_id,
                            attachment_url: item.attachment_url || ''
                          });
                          setActiveTab('sections');
                        }}
                        className="p-2 text-neon-blue hover:bg-neon-blue/10 rounded-xl"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
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
                    <div className="flex items-center gap-2 text-neon-blue text-[10px] font-black uppercase tracking-widest">
                      <Paperclip className="w-4 h-4" />
                      Has Attachment
                    </div>
                  )}
                </div>
              ))}
              {globalSearchQuery && globalSearchResults.length === 0 && (
                <div className="text-center py-12 text-gray-500 font-bold">
                  No results found for "{globalSearchQuery}"
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
            className="space-y-6"
          >
            {!selectedSection ? (
              <>
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <h3 className="text-3xl font-black neon-text-pink">{t('sections')}</h3>
                    <button 
                      onClick={() => seedSections()}
                      className="text-[10px] font-black px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-gray-500 hover:text-neon-blue transition-all uppercase tracking-widest"
                    >
                      Seed Defaults
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsAddingSection(true)}
                    className="p-3 bg-neon-blue/20 rounded-xl text-neon-blue hover:bg-neon-blue/30 transition-all"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>

                {isAddingSection && (
                  <div className="glass-morphism p-6 rounded-[24px] mb-6 space-y-4">
                    <input 
                      type="text"
                      value={newSection.name}
                      onChange={(e) => setNewSection({...newSection, name: e.target.value})}
                      placeholder="Section Name"
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-blue transition-all"
                    />
                    <input 
                      type="text"
                      value={newSection.emoji}
                      onChange={(e) => setNewSection({...newSection, emoji: e.target.value})}
                      placeholder="Emoji"
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-blue transition-all"
                    />
                    <input 
                      type="text"
                      value={newSection.slug}
                      onChange={(e) => setNewSection({...newSection, slug: e.target.value})}
                      placeholder="Slug (e.g. contracts)"
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-blue transition-all"
                    />
                    <div className="flex gap-2">
                       <button onClick={handleAddSection} className="flex-1 bg-neon-blue text-dark-bg font-bold py-3 rounded-xl">Add</button>
                      <button onClick={() => setIsAddingSection(false)} className="flex-1 bg-white/10 font-bold py-3 rounded-xl">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {sections.map((section) => (
                    <div key={section.id} className="group relative">
                      {editingSection === section.id ? (
                        <div className="glass-morphism p-6 rounded-[24px] mb-4 space-y-4">
                          <input 
                            type="text"
                            value={newSection.name}
                            onChange={(e) => setNewSection({...newSection, name: e.target.value})}
                            placeholder="Section Name"
                            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-blue transition-all"
                          />
                          <input 
                            type="text"
                            value={newSection.emoji}
                            onChange={(e) => setNewSection({...newSection, emoji: e.target.value})}
                            placeholder="Emoji"
                            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-blue transition-all"
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={async () => {
                                await updateSection(section.id, newSection);
                                setEditingSection(null);
                                setNewSection({ name: '', emoji: '', slug: '' });
                              }} 
                              className="flex-1 bg-neon-blue text-dark-bg font-bold py-3 rounded-xl"
                            >
                              Update
                            </button>
                            <button onClick={() => setEditingSection(null)} className="flex-1 bg-white/10 font-bold py-3 rounded-xl">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleSetSelectedSection(section.id)}
                            className="flex-1 glass-morphism p-6 rounded-[24px] flex justify-between items-center hover:border-neon-blue/50 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-2xl">{section.emoji}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-xl font-black tracking-tight">{section.title || section.name}</span>
                                <span className="px-2 py-0.5 rounded-lg bg-neon-blue/10 border border-neon-blue/20 text-[10px] font-black text-neon-blue">
                                  {section.slug === 'prices' ? prices.length : items.filter(i => i.section_id === section.id).length}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-neon-blue" />
                          </button>
                          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => {
                                setEditingSection(section.id);
                                setNewSection({ name: section.name, emoji: section.emoji, slug: section.slug });
                              }}
                              className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-neon-blue"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => deleteSection(section.id)}
                              className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => {
                      window.history.back();
                      setSectionSearchQuery('');
                    }}
                    className="flex items-center gap-2 text-neon-blue font-bold uppercase tracking-widest text-xs"
                  >
                    <ArrowLeft className="w-4 h-4" /> {t('back_to_sections')}
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text"
                        value={sectionSearchQuery}
                        onChange={(e) => setSectionSearchQuery(e.target.value)}
                        placeholder="Search in section..."
                        className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-neon-blue outline-none transition-all"
                      />
                    </div>
                    <button 
                      onClick={() => setIsAddingItem(true)}
                      className="p-3 bg-neon-pink/20 rounded-xl text-neon-pink hover:bg-neon-pink/30 transition-all"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <h3 className="text-3xl font-black neon-text-blue flex items-center gap-4">
                    <span>{sections.find(s => s.id === selectedSection)?.emoji}</span>
                    {sections.find(s => s.id === selectedSection)?.title || sections.find(s => s.id === selectedSection)?.name}
                  </h3>
                  <span className="px-3 py-1 rounded-xl bg-neon-blue/10 border border-neon-blue/20 text-sm font-black text-neon-blue">
                    {sections.find(s => s.id === selectedSection)?.slug === 'prices' ? prices.length : items.filter(i => i.section_id === selectedSection).length}
                  </span>
                </div>

                {/* Special Logic for Prices Section */}
                {sections.find(s => s.id === selectedSection)?.slug === 'prices' && (
                  <div className="space-y-8">
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

                    <div className="flex justify-between items-center">
                      <h4 className="text-xl font-black">{t('prices')} Database</h4>
                      <button 
                        onClick={() => setIsAddingPrice(true)}
                        className="p-2 bg-neon-pink/20 text-neon-pink rounded-lg"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {isAddingPrice && (
                      <div className="glass-morphism p-6 rounded-[24px] space-y-4">
                        <input 
                          list="analyses-list"
                          value={newPrice.analysis_name}
                          onChange={(e) => setNewPrice({...newPrice, analysis_name: e.target.value})}
                          placeholder={t('analysis_name')}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2"
                        />
                        <datalist id="analyses-list">
                          {[...new Set(prices.map(p => p.analysis_name))].map(name => (
                            <option key={name} value={name} />
                          ))}
                        </datalist>

                        <input 
                          list="companies-list"
                          value={newPrice.company_name}
                          onChange={(e) => setNewPrice({...newPrice, company_name: e.target.value})}
                          placeholder={t('company_name')}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2"
                        />
                        <datalist id="companies-list">
                          {[...new Set(prices.map(p => p.company_name))].map(name => (
                            <option key={name} value={name} />
                          ))}
                        </datalist>

                        <input 
                          list="contracts-list"
                          value={newPrice.contract_type}
                          onChange={(e) => setNewPrice({...newPrice, contract_type: e.target.value})}
                          placeholder={t('contract_type')}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2"
                        />
                        <datalist id="contracts-list">
                          {[...new Set(prices.map(p => p.contract_type))].map(type => (
                            <option key={type} value={type} />
                          ))}
                        </datalist>

                        <input 
                          type="number"
                          value={newPrice.price}
                          onChange={(e) => setNewPrice({...newPrice, price: e.target.value})}
                          placeholder="Price"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2"
                        />
                        <div className="flex gap-2">
                          <button onClick={handleAddPrice} className="flex-1 bg-neon-blue text-dark-bg font-bold py-2 rounded-xl">Save</button>
                          <button onClick={() => setIsAddingPrice(false)} className="flex-1 bg-white/10 py-2 rounded-xl">Cancel</button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {prices.map((p) => (
                        <div key={p.id} className="glass-morphism p-4 rounded-2xl flex justify-between items-center">
                          {editingItem === p.id ? (
                            <div className="flex-1 space-y-2">
                              <input 
                                type="text"
                                value={newPrice.analysis_name}
                                onChange={(e) => setNewPrice({...newPrice, analysis_name: e.target.value})}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1"
                              />
                              <div className="flex gap-2">
                                <input 
                                  type="number"
                                  value={newPrice.price}
                                  onChange={(e) => setNewPrice({...newPrice, price: e.target.value})}
                                  className="w-24 bg-white/10 border border-white/20 rounded-lg px-2 py-1"
                                />
                                <button 
                                  onClick={async () => {
                                    await updatePrice(p.id, { ...newPrice, price: parseFloat(newPrice.price) });
                                    setEditingItem(null);
                                    setNewPrice({ analysis_name: '', company_name: '', contract_type: '', price: '' });
                                  }}
                                  className="p-1 text-neon-blue"
                                >
                                  <Save className="w-5 h-5" />
                                </button>
                                <button onClick={() => setEditingItem(null)} className="p-1 text-gray-500">
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="font-black text-neon-blue">{p.analysis_name}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{p.company_name} | {p.contract_type}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-black text-xl">{p.price}</span>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => {
                                      setEditingItem(p.id);
                                      setNewPrice({
                                        analysis_name: p.analysis_name,
                                        company_name: p.company_name,
                                        contract_type: p.contract_type,
                                        price: p.price.toString()
                                      });
                                    }}
                                    className="text-neon-blue"
                                  >
                                    <Edit className="w-5 h-5" />
                                  </button>
                                  <button onClick={() => deletePrice(p.id)} className="text-red-400">
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Standard Items Management */}
                {sections.find(s => s.id === selectedSection)?.slug !== 'prices' && (
                  <>
                    {(isAddingItem || editingItem) && (
                      <div className="glass-morphism p-8 rounded-[32px] space-y-4">
                         <input 
                          type="text"
                          value={newItem.title}
                          onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                          placeholder="Item Title"
                          className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-blue transition-all"
                        />
                        
                        {/* Special Logic for Application Section */}
                        {sections.find(s => s.id === selectedSection)?.slug === 'application' && (
                          <select 
                            value={newItem.category}
                            onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:border-neon-blue outline-none transition-all appearance-none cursor-pointer font-bold text-white"
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%230066ff\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                          >
                            <option value="" className="bg-dark-bg">Select Type</option>
                            <option value="Email" className="bg-dark-bg">Email</option>
                            <option value="Ticket" className="bg-dark-bg">Ticket</option>
                          </select>
                        )}

                        <textarea 
                          value={newItem.description}
                          onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                          placeholder="Description"
                          className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-blue transition-all min-h-[100px]"
                        />

                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase">Attachment (Image or PDF)</p>
                          <div className="flex gap-2">
                            <label className="flex-1 bg-white/5 border-2 border-white/10 rounded-xl px-4 py-2 hover:border-neon-blue transition-all cursor-pointer flex items-center justify-between">
                              <span className="text-gray-400 truncate">
                                {isUploading ? 'Uploading...' : (newItem.attachment_url ? 'File Selected' : 'Choose File...')}
                              </span>
                              <Upload className={`w-5 h-5 text-neon-blue ${isUploading ? 'animate-bounce' : ''}`} />
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*,.pdf,.doc,.docx"
                                onChange={handleItemAttachmentUpload} 
                                disabled={isUploading} 
                              />
                            </label>
                            <select 
                              onChange={(e) => setNewItem({...newItem, attachment_url: e.target.value})}
                              className="bg-white/5 border-2 border-white/10 rounded-xl px-2 py-2 text-xs focus:border-neon-blue outline-none transition-all appearance-none cursor-pointer font-bold text-white pr-8"
                              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%230066ff\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.2em' }}
                            >
                              <option value="" className="bg-dark-bg">Select from files</option>
                              {attachments.map(f => (
                                <option key={f.id} value={f.url} className="bg-dark-bg">{f.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={handleAddItem} className="flex-1 bg-neon-pink text-white font-bold py-3 rounded-xl">
                            {editingItem ? 'Update Item' : 'Add Item'}
                          </button>
                          <button onClick={() => { setIsAddingItem(false); setEditingItem(null); }} className="flex-1 bg-white/10 font-bold py-3 rounded-xl">Cancel</button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-6">
                      {items
                        .filter(i => i.section_id === selectedSection)
                        .filter(i => 
                          i.title.toLowerCase().includes(sectionSearchQuery.toLowerCase()) || 
                          i.description?.toLowerCase().includes(sectionSearchQuery.toLowerCase())
                        )
                        .map((item) => (
                        <div key={item.id} className="item-card-vertical group">
                          <div className="absolute right-6 top-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                            <button 
                              onClick={() => toggleFavorite(item.id)}
                              className={`p-2 rounded-xl transition-all ${favorites.some(f => f.item_id === item.id && f.user_id === user?.id) ? 'text-neon-pink' : 'text-gray-500 hover:text-white'}`}
                            >
                              <Star className={`w-5 h-5 ${favorites.some(f => f.item_id === item.id && f.user_id === user?.id) ? 'fill-current' : ''}`} />
                            </button>
                            <button 
                              onClick={() => {
                                setEditingItem(item.id);
                                setNewItem({
                                  title: item.title,
                                  description: item.description || '',
                                  category: item.category || '',
                                  section_id: item.section_id,
                                  attachment_url: item.attachment_url || ''
                                });
                              }}
                              className="p-2 text-neon-blue hover:bg-neon-blue/10 rounded-xl transition-all"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => deleteItem(item.id)}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[10px] font-black text-neon-blue tracking-[0.2em] uppercase mb-1">NAME</p>
                                <div className="inline-block bg-neon-blue/10 px-4 py-1.5 rounded-lg border border-neon-blue/20">
                                  <h4 className="text-lg font-bold text-neon-blue">{item.title}</h4>
                                </div>
                              </div>
                            </div>

                            <div>
                              <p className="text-[10px] font-black text-neon-blue tracking-[0.2em] uppercase mb-1">DESCRIPTION</p>
                              <div className="space-y-1">
                                {item.description?.split('\n').map((line: string, i: number) => (
                                  <p key={i} className="description-text">
                                    {line}
                                  </p>
                                )) || null /* Ensure null safety */}
                              </div>
                            </div>

                            {item.category && (
                              <div className="pt-2">
                                <span className="inline-block bg-[#001233] text-neon-blue text-xs font-bold px-3 py-1 rounded-md border border-neon-blue/20">
                                  {item.category}
                                </span>
                              </div>
                            )}

                            {item.attachment_url && (
                              <div className="pt-2">
                                <p className="text-[10px] font-black text-neon-blue tracking-[0.2em] uppercase mb-2">ATTACHMENT</p>
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
                        </div>
                      ))}
                    </div>
                  </>
                )}
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
                <div key={item.id} className="glass-morphism rounded-2xl p-6 relative overflow-hidden">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black text-neon-pink tracking-[0.2em] uppercase mb-1">
                          {sections.find(s => s.id === item.section_id)?.name}
                        </p>
                        <div className="inline-block bg-neon-pink/10 px-4 py-1.5 rounded-lg border border-neon-pink/20">
                          <h4 className="text-lg font-bold text-neon-pink">{item.title}</h4>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            handleSetSelectedSection(item.section_id);
                            setEditingItem(item.id);
                            setNewItem({
                              title: item.title,
                              description: item.description || '',
                              category: item.category || '',
                              section_id: item.section_id,
                              attachment_url: item.attachment_url || ''
                            });
                            setActiveTab('sections');
                          }}
                          className="p-2 bg-neon-blue/10 rounded-xl text-neon-blue hover:bg-neon-blue/20 transition-all"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => toggleFavorite(item.id)}
                          className="p-2 rounded-xl transition-all text-neon-pink hover:bg-white/5"
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-neon-pink tracking-[0.2em] uppercase mb-1">DESCRIPTION</p>
                      <div className="space-y-1">
                        {item.description?.split('\n').map((line: string, i: number) => (
                          <p key={i} className="text-sm font-medium leading-relaxed text-gray-200">
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
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black neon-text-blue">{t('attachments')}</h3>
              <label className="cursor-pointer p-3 bg-neon-pink/20 rounded-xl text-neon-pink hover:bg-neon-pink/30 transition-all">
                <Upload className={`w-6 h-6 ${isUploading ? 'animate-bounce' : ''}`} />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleAttachmentUpload} 
                  disabled={isUploading} 
                />
              </label>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                value={attachmentSearch}
                onChange={(e) => setAttachmentSearch(e.target.value)}
                placeholder="Search attachments..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-neon-blue transition-all"
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              {attachments
                .filter(f => f.name.toLowerCase().includes(attachmentSearch.toLowerCase()))
                .map((file) => (
                <div key={file.id} className="glass-morphism p-8 rounded-[32px] flex justify-between items-center group">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(0,102,255,0.1)]">
                      <FileText className="w-8 h-8 text-neon-pink" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black truncate max-w-[200px]">{file.name}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">
                          {(file.size / 1024).toFixed(1)} KB | {new Date(file.created_at).toLocaleDateString()}
                        </p>
                        {file.section_id && (
                          <span className="text-[8px] font-black text-neon-blue tracking-widest uppercase bg-neon-blue/10 px-2 py-0.5 rounded border border-neon-blue/20">
                            {sections.find(s => s.id === file.section_id)?.emoji} {sections.find(s => s.id === file.section_id)?.title || sections.find(s => s.id === file.section_id)?.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-white/5 rounded-xl text-neon-blue hover:bg-neon-blue/10 transition-all"
                    >
                      <Paperclip className="w-6 h-6" />
                    </a>
                    <button 
                      onClick={() => deleteAttachment(file.id)}
                      className="p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black neon-text-pink">{t('users')}</h3>
              <button 
                onClick={() => setIsAddingUser(true)}
                className="p-3 bg-neon-blue/20 rounded-xl text-neon-blue hover:bg-neon-blue/30 transition-all border border-neon-blue/30"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {isAddingUser && (
              <div className="glass-morphism p-8 rounded-[32px] space-y-4">
                <input 
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="Username"
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-blue transition-all"
                />
                <input 
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Password"
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-blue transition-all"
                />
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:border-neon-blue outline-none transition-all appearance-none cursor-pointer font-bold text-white pr-10"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%230066ff\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                >
                  <option value="user" className="bg-dark-bg font-sans">User</option>
                  <option value="admin" className="bg-dark-bg font-sans">Admin</option>
                </select>
                <div className="flex gap-2">
                  <button 
                    onClick={async () => {
                      if (!newUser.username || !newUser.password) return;
                      await addUser(newUser);
                      setIsAddingUser(false);
                      setNewUser({ username: '', password: '', role: 'user' });
                      await fetchData(true);
                    }} 
                    className="flex-1 bg-neon-blue text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(0,102,255,0.4)]"
                  >
                    Add User
                  </button>
                  <button onClick={() => setIsAddingUser(false)} className="flex-1 bg-white/10 font-bold py-3 rounded-xl">Cancel</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {users.map((u) => (
                <div key={u.id} className="glass-morphism p-6 rounded-[24px] flex justify-between items-center group hover:border-neon-blue transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-neon-blue/30 transition-all">
                      <UserIcon className={`w-6 h-6 ${u.role === 'admin' ? 'text-neon-pink' : 'text-neon-blue'}`} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black">{u.username}</h4>
                      <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">{u.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => deleteUser(u.id)}
                      className="p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'me' && (
          <motion.div 
            key="me"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black neon-text-pink">{t('settings')}</h3>
              <button 
                onClick={logout}
                className="p-3 bg-red-500/20 text-red-500 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> {t('logout')}
              </button>
            </div>

            <div className="glass-morphism p-8 rounded-[32px] space-y-6">
              <h4 className="text-xl font-black flex items-center gap-3">
                <UserIcon className="w-6 h-6 text-neon-blue" />
                {t('profile')}
              </h4>
              <div className="space-y-4">
                <input 
                  type="text"
                  defaultValue={user?.username}
                  id="admin-username"
                  placeholder="New Username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-neon-blue outline-none transition-all"
                />
                <input 
                  type="password"
                  id="admin-password"
                  placeholder="New Password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-neon-blue outline-none transition-all"
                />
                <button 
                  onClick={async () => {
                    const username = (document.getElementById('admin-username') as HTMLInputElement).value;
                    const password = (document.getElementById('admin-password') as HTMLInputElement).value;
                    await updateCurrentUser({ username, password });
                    alert('Profile updated successfully');
                  }}
                  className="w-full bg-neon-blue text-white font-black py-3 rounded-xl uppercase tracking-widest text-xs shadow-[0_0_15px_rgba(0,102,255,0.3)] hover:shadow-[0_0_25px_rgba(0,102,255,0.5)] transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>

            {deferredPrompt && (
              <div className="glass-morphism p-8 rounded-[32px] space-y-6">
                <h4 className="text-xl font-black flex items-center gap-3">
                  <Settings className="w-6 h-6 text-neon-blue" />
                  Download App
                </h4>
                <button 
                  onClick={handleInstall}
                  className="w-full bg-neon-blue/10 text-neon-blue border border-neon-blue/20 font-black py-4 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-neon-blue/20 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Install Application
                </button>
              </div>
            )}

            <div className="glass-morphism p-8 rounded-[32px] space-y-6">
              <h4 className="text-xl font-black flex items-center gap-3">
                <Users className="w-6 h-6 text-neon-blue" />
                {t('user_management')}
              </h4>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="Username"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-neon-blue outline-none transition-all"
                  />
                  <input 
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Password"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-neon-blue outline-none transition-all"
                  />
                  <button 
                    onClick={handleAddUser}
                    className="p-2 bg-neon-blue text-white rounded-xl shadow-[0_0_10px_rgba(0,102,255,0.3)]"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-2">
                  {users.map((u) => (
                    <div key={u.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                      {editingUser === u.id ? (
                        <div className="flex-1 flex gap-2">
                          <input 
                            type="text"
                            value={newUser.username}
                            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 focus:border-neon-blue outline-none"
                          />
                          <input 
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 focus:border-neon-blue outline-none"
                          />
                          <button 
                            onClick={async () => {
                              await updateUser(u.id, newUser);
                              setEditingUser(null);
                              setNewUser({ username: '', password: '', role: 'user' });
                            }}
                            className="p-1 text-neon-blue"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                          <button onClick={() => setEditingUser(null)} className="p-1 text-gray-500">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="font-bold">{u.username}</p>
                            <p className="text-[10px] text-neon-pink uppercase font-black tracking-widest">{u.role}</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setEditingUser(u.id);
                                setNewUser({ username: u.username, password: '', role: u.role });
                              }}
                              className="p-2 text-neon-blue hover:bg-neon-blue/10 rounded-lg transition-all"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => deleteUser(u.id)}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-morphism p-8 rounded-[32px] space-y-6">
              <h4 className="text-xl font-black flex items-center gap-3">
                <Palette className="w-6 h-6 text-neon-pink" />
                {t('theme')}
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {['teal', 'pink', 'blue'].map((themeName) => (
                  <button 
                    key={themeName}
                    onClick={() => setTheme(themeName as any)}
                    className={`p-4 rounded-2xl border-2 transition-all capitalize font-bold ${theme === themeName ? 'border-neon-blue bg-neon-blue/10 text-white' : 'border-white/10 bg-white/5 text-gray-500'}`}
                  >
                    {themeName}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
