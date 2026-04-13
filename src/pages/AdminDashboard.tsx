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
  Search as SearchIcon,
  TrendingUp,
  History
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

      await addAttachment(file.name, publicUrl, file.size);
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
    const results = items.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.description?.toLowerCase().includes(query.toLowerCase())
    ).map(item => ({
      ...item,
      section: sections.find(s => s.id === item.section_id)
    }));
    setGlobalSearchResults(results);
  };


  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password) return;
    await addUser(newUser);
    setNewUser({ username: '', password: '', role: 'user' });
    setIsAddingUser(false);
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
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
                <h2 className="text-4xl font-black neon-text-cyan uppercase tracking-tight">
                  {t('analytics')}
                </h2>
                <p className="text-gray-400 font-medium tracking-tight">
                  {t('welcome')}, {user?.username}
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl glass-morphism border-neon-magenta/30 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-neon-magenta" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-morphism p-6 rounded-[24px] border-l-4 border-neon-cyan">
                <p className="text-[10px] font-black text-neon-cyan tracking-widest uppercase mb-1">TOTAL SECTIONS</p>
                <h4 className="text-3xl font-black">{sections.length}</h4>
              </div>
              <div className="glass-morphism p-6 rounded-[24px] border-l-4 border-neon-magenta">
                <p className="text-[10px] font-black text-neon-magenta tracking-widest uppercase mb-1">TOTAL USERS</p>
                <h4 className="text-3xl font-black">{users.length}</h4>
              </div>
            </div>

            {/* Top 5 Searches Chart */}
            <div className="glass-morphism p-8 rounded-[32px] space-y-6">
              <h3 className="text-xl font-black flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-neon-cyan" />
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
                      itemStyle={{ color: '#00f2ff' }}
                    />
                    <Bar dataKey="count" fill="#00f2ff" radius={[4, 4, 0, 0]}>
                      {searchLogs.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00f2ff' : '#ff00ff'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* User Activity List */}
            <div className="glass-morphism p-8 rounded-[32px] space-y-6">
              <h3 className="text-xl font-black flex items-center gap-3">
                <History className="w-6 h-6 text-neon-magenta" />
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
                      <p className="text-xs font-bold text-neon-cyan">{log.count} {t('search_count')}</p>
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
              <h2 className="text-4xl font-black neon-text-cyan uppercase tracking-tight">
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
                className="w-full bg-white/5 border-2 border-white/10 rounded-[28px] pl-16 pr-6 py-5 focus:outline-none focus:border-neon-cyan transition-all text-lg"
              />
            </div>

            <div className="space-y-6">
              {globalSearchResults.map((item) => (
                <div key={item.id} className="glass-morphism rounded-[32px] p-8 border-l-8 border-neon-magenta relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-black text-neon-magenta tracking-widest uppercase mb-1">
                        {item.section?.name}
                      </p>
                      <h4 className="text-xl font-black">{item.title}</h4>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
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
                        className="p-2 text-neon-cyan hover:bg-neon-cyan/10 rounded-xl"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
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
                    <h3 className="text-3xl font-black neon-text-magenta">{t('sections')}</h3>
                    <button 
                      onClick={() => seedSections()}
                      className="text-[10px] font-black px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-gray-500 hover:text-neon-cyan transition-all uppercase tracking-widest"
                    >
                      Seed Defaults
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsAddingSection(true)}
                    className="p-3 bg-neon-cyan/20 rounded-xl text-neon-cyan hover:bg-neon-cyan/30 transition-all"
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
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan transition-all"
                    />
                    <input 
                      type="text"
                      value={newSection.emoji}
                      onChange={(e) => setNewSection({...newSection, emoji: e.target.value})}
                      placeholder="Emoji"
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan transition-all"
                    />
                    <input 
                      type="text"
                      value={newSection.slug}
                      onChange={(e) => setNewSection({...newSection, slug: e.target.value})}
                      placeholder="Slug (e.g. contracts)"
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan transition-all"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleAddSection} className="flex-1 bg-neon-cyan text-dark-bg font-bold py-3 rounded-xl">Add</button>
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
                            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan transition-all"
                          />
                          <input 
                            type="text"
                            value={newSection.emoji}
                            onChange={(e) => setNewSection({...newSection, emoji: e.target.value})}
                            placeholder="Emoji"
                            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan transition-all"
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={async () => {
                                await updateSection(section.id, newSection);
                                setEditingSection(null);
                                setNewSection({ name: '', emoji: '', slug: '' });
                              }} 
                              className="flex-1 bg-neon-cyan text-dark-bg font-bold py-3 rounded-xl"
                            >
                              Update
                            </button>
                            <button onClick={() => setEditingSection(null)} className="flex-1 bg-white/10 font-bold py-3 rounded-xl">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setSelectedSection(section.id)}
                            className="flex-1 glass-morphism p-6 rounded-[24px] flex justify-between items-center hover:border-neon-cyan/50 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-2xl">{section.emoji}</span>
                              <span className="text-xl font-black tracking-tight">{section.title || section.name}</span>
                            </div>
                            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-neon-cyan" />
                          </button>
                          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => {
                                setEditingSection(section.id);
                                setNewSection({ name: section.name, emoji: section.emoji, slug: section.slug });
                              }}
                              className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-neon-cyan"
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
                    onClick={() => setSelectedSection(null)}
                    className="flex items-center gap-2 text-neon-cyan font-bold uppercase tracking-widest text-xs"
                  >
                    <ArrowLeft className="w-4 h-4" /> {t('back_to_sections')}
                  </button>
                  <button 
                    onClick={() => setIsAddingItem(true)}
                    className="p-3 bg-neon-magenta/20 rounded-xl text-neon-magenta hover:bg-neon-magenta/30 transition-all"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>

                <h3 className="text-3xl font-black neon-text-cyan flex items-center gap-4">
                  <span>{sections.find(s => s.id === selectedSection)?.emoji}</span>
                  {sections.find(s => s.id === selectedSection)?.title || sections.find(s => s.id === selectedSection)?.name}
                </h3>

                {/* Special Logic for Prices Section */}
                {sections.find(s => s.id === selectedSection)?.slug === 'prices' && (
                  <div className="space-y-8">
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

                    <div className="flex justify-between items-center">
                      <h4 className="text-xl font-black">{t('prices')} Database</h4>
                      <button 
                        onClick={() => setIsAddingPrice(true)}
                        className="p-2 bg-neon-magenta/20 text-neon-magenta rounded-lg"
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
                          <button onClick={handleAddPrice} className="flex-1 bg-neon-cyan text-dark-bg font-bold py-2 rounded-xl">Save</button>
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
                                  className="p-1 text-neon-cyan"
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
                                <p className="font-black text-neon-cyan">{p.analysis_name}</p>
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
                                    className="text-neon-cyan"
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
                          className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan transition-all"
                        />
                        
                        {/* Special Logic for Application Section */}
                        {sections.find(s => s.id === selectedSection)?.slug === 'application' && (
                          <select 
                            value={newItem.category}
                            onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:border-neon-cyan outline-none transition-all appearance-none cursor-pointer font-bold text-white"
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2300f2ff\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
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
                          className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan transition-all min-h-[100px]"
                        />

                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase">Attachment URL</p>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={newItem.attachment_url}
                              onChange={(e) => setNewItem({...newItem, attachment_url: e.target.value})}
                              placeholder="https://..."
                              className="flex-1 bg-white/5 border-2 border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-neon-cyan transition-all"
                            />
                            <select 
                              onChange={(e) => setNewItem({...newItem, attachment_url: e.target.value})}
                              className="bg-white/5 border-2 border-white/10 rounded-xl px-2 py-2 text-xs focus:border-neon-cyan outline-none transition-all appearance-none cursor-pointer font-bold text-white pr-8"
                              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2300f2ff\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.2em' }}
                            >
                              <option value="" className="bg-dark-bg">Select from files</option>
                              {attachments.map(f => (
                                <option key={f.id} value={f.url} className="bg-dark-bg">{f.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={handleAddItem} className="flex-1 bg-neon-magenta text-white font-bold py-3 rounded-xl">
                            {editingItem ? 'Update Item' : 'Add Item'}
                          </button>
                          <button onClick={() => { setIsAddingItem(false); setEditingItem(null); }} className="flex-1 bg-white/10 font-bold py-3 rounded-xl">Cancel</button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-6">
                      {items.filter(i => i.section_id === selectedSection).map((item) => (
                        <div key={item.id} className="glass-morphism rounded-[32px] p-8 border-l-8 border-neon-cyan relative group">
                          <div className="absolute right-6 top-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => toggleFavorite(item.id)}
                              className={`p-2 rounded-xl border transition-all ${favorites.some(f => f.item_id === item.id && f.user_id === user?.id) ? 'bg-neon-magenta/20 border-neon-magenta text-neon-magenta' : 'bg-white/5 border-white/10 text-gray-500'}`}
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
                              className="p-2 text-neon-cyan hover:bg-neon-cyan/10 rounded-xl transition-all"
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
                                <p className="text-[10px] font-black text-neon-cyan tracking-widest uppercase mb-1">NAME</p>
                                <h4 className="text-xl font-black">{item.title}</h4>
                              </div>
                              {item.category && (
                                <span className="px-3 py-1 bg-neon-cyan/10 text-neon-cyan text-[10px] font-black rounded-full uppercase tracking-widest">
                                  {item.category}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-neon-cyan tracking-widest uppercase mb-1">DESCRIPTION</p>
                              <p className="text-gray-300">{item.description}</p>
                            </div>
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
              <h2 className="text-4xl font-black neon-text-magenta uppercase tracking-tight">
                {t('favorites')}
              </h2>
              <p className="text-gray-400 font-medium tracking-tight">
                Your quick access starred items
              </p>
            </div>

            <div className="space-y-6">
              {items.filter(i => favorites.some(f => f.item_id === i.id && f.user_id === user?.id)).map((item) => (
                <div key={item.id} className="glass-morphism rounded-[32px] p-8 border-l-[12px] border-neon-magenta relative overflow-hidden">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black text-neon-magenta tracking-[0.2em] uppercase mb-3">
                          {sections.find(s => s.id === item.section_id)?.name}
                        </p>
                        <div className="inline-block glass-morphism bg-neon-magenta/20 px-8 py-3 rounded-2xl border border-neon-magenta/40">
                          <h4 className="text-2xl font-black text-white">{item.title}</h4>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
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
                          className="p-3 bg-neon-cyan/20 rounded-2xl text-neon-cyan"
                        >
                          <Edit className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-neon-magenta tracking-[0.2em] uppercase mb-3">DESCRIPTION</p>
                      <p className="text-lg font-bold leading-relaxed text-gray-100">{item.description}</p>
                    </div>
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
              <h3 className="text-3xl font-black neon-text-cyan">{t('attachments')}</h3>
              <label className="cursor-pointer p-3 bg-neon-magenta/20 rounded-xl text-neon-magenta hover:bg-neon-magenta/30 transition-all">
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
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-neon-cyan"
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              {attachments
                .filter(f => f.name.toLowerCase().includes(attachmentSearch.toLowerCase()))
                .map((file) => (
                <div key={file.id} className="glass-morphism p-8 rounded-[32px] flex justify-between items-center group">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center border border-white/10">
                      <FileText className="w-8 h-8 text-neon-magenta" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black truncate max-w-[200px]">{file.name}</h4>
                      <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">
                        {(file.size / 1024).toFixed(1)} KB | {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-white/5 rounded-xl text-neon-cyan hover:bg-neon-cyan/10"
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
              <h3 className="text-3xl font-black neon-text-magenta">{t('users')}</h3>
              <button 
                onClick={() => setIsAddingUser(true)}
                className="p-3 bg-neon-cyan/20 rounded-xl text-neon-cyan hover:bg-neon-cyan/30 transition-all"
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
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan transition-all"
                />
                <input 
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Password"
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan transition-all"
                />
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:border-neon-cyan outline-none transition-all appearance-none cursor-pointer font-bold text-white"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2300f2ff\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                >
                  <option value="user" className="bg-dark-bg">User</option>
                  <option value="admin" className="bg-dark-bg">Admin</option>
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
                    className="flex-1 bg-neon-cyan text-dark-bg font-bold py-3 rounded-xl"
                  >
                    Add User
                  </button>
                  <button onClick={() => setIsAddingUser(false)} className="flex-1 bg-white/10 font-bold py-3 rounded-xl">Cancel</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {users.map((u) => (
                <div key={u.id} className="glass-morphism p-6 rounded-[24px] flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <UserIcon className={`w-6 h-6 ${u.role === 'admin' ? 'text-neon-magenta' : 'text-neon-cyan'}`} />
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
              <h3 className="text-3xl font-black neon-text-magenta">{t('settings')}</h3>
              <button 
                onClick={logout}
                className="p-3 bg-red-500/20 text-red-500 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> {t('logout')}
              </button>
            </div>

            <div className="glass-morphism p-8 rounded-[32px] space-y-6">
              <h4 className="text-xl font-black flex items-center gap-3">
                <UserIcon className="w-6 h-6 text-neon-cyan" />
                {t('profile')}
              </h4>
              <div className="space-y-4">
                <input 
                  type="text"
                  defaultValue={user?.username}
                  id="admin-username"
                  placeholder="New Username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-neon-cyan outline-none transition-all"
                />
                <input 
                  type="password"
                  id="admin-password"
                  placeholder="New Password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-neon-cyan outline-none transition-all"
                />
                <button 
                  onClick={async () => {
                    const username = (document.getElementById('admin-username') as HTMLInputElement).value;
                    const password = (document.getElementById('admin-password') as HTMLInputElement).value;
                    await updateCurrentUser({ username, password });
                    alert('Profile updated successfully');
                  }}
                  className="w-full bg-neon-cyan text-dark-bg font-black py-3 rounded-xl uppercase tracking-widest text-xs"
                >
                  Save Changes
                </button>
              </div>
            </div>

            <div className="glass-morphism p-8 rounded-[32px] space-y-6">
              <h4 className="text-xl font-black flex items-center gap-3">
                <Users className="w-6 h-6 text-neon-cyan" />
                {t('user_management')}
              </h4>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="Username"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2"
                  />
                  <input 
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Password"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2"
                  />
                  <button 
                    onClick={handleAddUser}
                    className="p-2 bg-neon-cyan text-dark-bg rounded-xl"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-2">
                  {users.map((u) => (
                    <div key={u.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                      {editingUser === u.id ? (
                        <div className="flex-1 flex gap-2">
                          <input 
                            type="text"
                            value={newUser.username}
                            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1"
                          />
                          <input 
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1"
                          />
                          <button 
                            onClick={async () => {
                              await updateUser(u.id, newUser);
                              setEditingUser(null);
                              setNewUser({ username: '', password: '', role: 'user' });
                            }}
                            className="p-1 text-neon-cyan"
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
                            <p className="text-[10px] text-neon-magenta uppercase font-black tracking-widest">{u.role}</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setEditingUser(u.id);
                                setNewUser({ username: u.username, password: '', role: u.role });
                              }}
                              className="p-2 text-neon-cyan hover:bg-neon-cyan/10 rounded-lg"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => deleteUser(u.id)}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
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
                <Palette className="w-6 h-6 text-neon-magenta" />
                {t('theme')}
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {['teal', 'pink', 'blue'].map((t) => (
                  <button 
                    key={t}
                    onClick={() => setTheme(t as any)}
                    className={`p-4 rounded-2xl border-2 transition-all capitalize font-bold ${theme === t ? 'border-neon-cyan bg-neon-cyan/10' : 'border-white/10 bg-white/5'}`}
                  >
                    {t}
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
