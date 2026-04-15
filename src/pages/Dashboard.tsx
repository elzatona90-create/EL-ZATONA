import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useTranslation } from 'react-i18next';
import { 
  Home, Search, Layers, Star, Paperclip, Users, User, 
  Brain, Settings, LogOut, MessageSquare, Trash2, Mic, Send,
  Upload, Plus, FileText, DollarSign, TestTube, Microscope, Wrench,
  TrendingUp, BarChart2, ChevronRight, Activity, HelpCircle
} from 'lucide-react';
import { BRANDING } from '../constants';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user, logout, sections, items, users, attachments, searchLogs, addSection, updateSection, deleteSection, addItem, updateItem, deleteItem, addUser, updateUser, deleteUser, addAttachment, deleteAttachment, seedSections } = useStore();
  const [activeTab, setActiveTab] = useState('home');
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState<any>({});
  const [profileName, setProfileName] = useState(user?.username || '');

  useEffect(() => {
    if (user?.username) {
      setProfileName(user.username);
    }
  }, [user?.username]);

  const isAdmin = user?.role === 'admin';

  const tabs = isAdmin ? [
    { id: 'home', icon: Home, label: 'HOME' },
    { id: 'search', icon: Search, label: 'Global Search' },
    { id: 'sections', icon: Layers, label: 'SECTIONS' },
    { id: 'favorites', icon: Star, label: 'Favorites' },
    { id: 'files', icon: Paperclip, label: 'FILES' },
    { id: 'users', icon: Users, label: 'users' },
    { id: 'me', icon: User, label: 'ME' },
  ] : [
    { id: 'home', icon: Home, label: 'HOME' },
    { id: 'sections', icon: Layers, label: 'SECTIONS' },
    { id: 'favorites', icon: Star, label: 'Favorites' },
    { id: 'files', icon: Paperclip, label: 'FILES' },
    { id: 'me', icon: User, label: 'ME' },
  ];

  const renderHeader = () => (
    <div className="flex items-center gap-3 mb-8 px-4 pt-6">
      <div className="w-10 h-10 rounded-xl border border-neon-cyan flex items-center justify-center neon-glow-cyan">
        <Brain className="w-6 h-6 text-neon-cyan" />
      </div>
      <h1 className="text-2xl font-black neon-text-cyan tracking-widest uppercase">
        {BRANDING.app_name}
      </h1>
    </div>
  );

  const renderHome = () => {
    if (isAdmin) {
      return (
        <div className="px-4 pb-24 space-y-6 animate-in fade-in duration-300">
          {renderHeader()}
          <div className="relative">
            <h2 className="text-3xl font-black neon-text-cyan uppercase tracking-widest mb-1">ANALYTICS</h2>
            <p className="text-gray-300 text-lg">Welcome Back, {user?.username}</p>
            <div className="absolute top-0 right-0 w-12 h-12 glass-morphism neon-border-magenta flex items-center justify-center rounded-xl">
              <TrendingUp className="w-6 h-6 text-neon-magenta" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="glass-morphism neon-border-cyan p-6 rounded-2xl">
              <p className="text-neon-cyan text-xs font-bold tracking-widest uppercase mb-2">TOTAL SECTIONS</p>
              <p className="text-4xl font-black text-white">{sections.length}</p>
            </div>
            <div className="glass-morphism neon-border-magenta p-6 rounded-2xl">
              <p className="text-neon-magenta text-xs font-bold tracking-widest uppercase mb-2">TOTAL USERS</p>
              <p className="text-4xl font-black text-white">{users.length}</p>
            </div>
          </div>

          <div className="glass-morphism neon-border-cyan p-6 rounded-2xl mt-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart2 className="w-6 h-6 text-neon-cyan" />
              <h3 className="text-xl font-bold text-white">Top Searches</h3>
            </div>
            <div className="h-48 border border-white/10 rounded-xl flex items-center justify-center relative">
              {/* Chart placeholder */}
              <div className="absolute bottom-2 text-center w-full">
                <p className="text-xs font-bold neon-text-cyan tracking-widest uppercase">DESIGN BY : ISLAM AL SAPAA</p>
                <p className="text-[10px] font-bold neon-text-magenta tracking-widest uppercase mt-1">CONTENT DEVELOPED BY : KIH</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="px-4 pt-6 pb-24 space-y-4 animate-in fade-in duration-300 h-full flex flex-col min-h-screen">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl border border-neon-cyan flex items-center justify-center neon-glow-cyan">
            <Brain className="w-6 h-6 text-neon-cyan" />
          </div>
          <h1 className="text-2xl font-black neon-text-cyan tracking-widest uppercase">
            {BRANDING.app_name}
          </h1>
        </div>
        <div>
          <h2 className="text-2xl font-black neon-text-cyan mb-1">Welcome Back, {user?.username}!</h2>
          <p className="text-gray-300 text-sm">Search through our exclusive database</p>
        </div>

        <div className="glass-morphism p-4 rounded-3xl flex-1 flex flex-col relative overflow-hidden mt-2 border border-neon-cyan/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-neon-cyan/30">
                <MessageSquare className="w-5 h-5 text-neon-cyan" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">El Zatona Assistant</h3>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">POWERED BY GEMINI AI</p>
              </div>
            </div>
            <button className="p-2 text-gray-500 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            <div className="bg-[#1e1b3a] p-4 rounded-2xl rounded-tl-sm max-w-[90%] border border-white/5">
              <p className="text-white text-sm leading-relaxed">
                Hello! I am your El Zatona Assistant. Type a keyword to search across all sections.
              </p>
            </div>
          </div>

          <div className="relative mt-auto">
            <input 
              type="text" 
              placeholder="Ask me anything..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-full py-3 pl-5 pr-20 text-white placeholder-gray-400 focus:outline-none focus:border-neon-cyan transition-colors text-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Mic className="w-4 h-4" />
              </button>
              <button className="p-2 text-white hover:text-neon-cyan transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-[10px] font-bold neon-text-cyan tracking-widest uppercase">DESIGN BY : ISLAM AL SAPAA</p>
            <p className="text-[8px] font-bold neon-text-magenta tracking-widest uppercase mt-1">CONTENT DEVELOPED BY : KIH</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSearch = () => (
    <div className="px-4 pb-24 space-y-6 animate-in fade-in duration-300">
      {renderHeader()}
      <div>
        <h2 className="text-3xl font-black neon-text-cyan uppercase tracking-widest mb-2">GLOBAL SEARCH</h2>
        <p className="text-gray-300 text-lg">Search across all sections and items</p>
      </div>

      <div className="relative mt-8">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search everything..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-cyan transition-colors"
        />
      </div>
      
      <div className="absolute bottom-24 left-0 w-full text-center">
        <p className="text-xs font-bold neon-text-cyan tracking-widest uppercase">DESIGN BY : ISLAM AL SAPAA</p>
        <p className="text-[10px] font-bold neon-text-magenta tracking-widest uppercase mt-1">CONTENT DEVELOPED BY : KIH</p>
      </div>
    </div>
  );

  const renderSections = () => {
    if (activeSectionId) {
      const section = sections.find((s: any) => s.id === activeSectionId);
      const sectionItems = items.filter((i: any) => i.section_id === activeSectionId && (i.title?.toLowerCase().includes(searchQuery.toLowerCase()) || i.description?.toLowerCase().includes(searchQuery.toLowerCase())));

      return (
        <div className="px-4 pb-24 space-y-6 animate-in fade-in duration-300">
          {renderHeader()}
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setActiveSectionId(null)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
              <ChevronRight className="w-6 h-6 text-white rotate-180" />
            </button>
            <h2 className="text-2xl font-black neon-text-magenta uppercase tracking-widest">{section?.name || 'Section'}</h2>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search in this section..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-neon-cyan transition-colors"
            />
          </div>

          {isAdmin && (
            <button 
              onClick={() => { setEditingEntity(null); setFormData({ section_id: activeSectionId }); setShowItemModal(true); }}
              className="w-full bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-neon-cyan/30 transition-colors mb-6"
            >
              <Plus className="w-5 h-5" /> ADD NEW RECORD
            </button>
          )}

          <div className="space-y-4">
            {sectionItems.length > 0 ? sectionItems.map((item: any) => (
              <div key={item.id} className="glass-morphism neon-border-cyan p-5 rounded-2xl relative group">
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">{item.description}</p>
                {item.attachment_url && (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    {item.attachment_url.startsWith('data:image') ? (
                      <img src={item.attachment_url} alt="Attachment" className="max-h-48 rounded-lg object-contain" />
                    ) : (
                      <a href={item.attachment_url} download="attachment" className="flex items-center gap-2 text-neon-cyan hover:underline text-sm font-bold">
                        <Paperclip className="w-4 h-4" /> Download Attachment
                      </a>
                    )}
                  </div>
                )}
                
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingEntity(item); setFormData(item); setShowItemModal(true); }} className="p-2 bg-white/10 rounded-lg hover:text-neon-cyan transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="p-2 bg-white/10 rounded-lg hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-12 text-gray-500 font-bold">No records found in this section.</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="px-4 pb-24 space-y-6 animate-in fade-in duration-300">
        {renderHeader()}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black neon-text-magenta uppercase tracking-widest">SECTIONS</h2>
          <div className="flex items-center gap-3">
            {isAdmin && sections.length === 0 && (
              <button onClick={seedSections} className="px-4 py-2 rounded-lg border border-white/20 text-xs font-bold tracking-widest uppercase text-neon-cyan hover:bg-white/5 transition-colors">
                SEED DEFAULTS
              </button>
            )}
            {isAdmin && (
              <button onClick={() => { setEditingEntity(null); setFormData({}); setShowSectionModal(true); }} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-neon-cyan hover:bg-white/20 transition-colors">
                <Plus className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {sections.length > 0 ? sections.map((s: any) => (
            <div key={s.id} className="glass-morphism neon-border-cyan p-5 rounded-2xl flex items-center justify-between group">
              <div 
                className="flex items-center gap-4 flex-1 cursor-pointer"
                onClick={() => { setActiveSectionId(s.id); setSearchQuery(''); }}
              >
                <span className="text-2xl">{s.emoji || <FileText className="w-6 h-6 text-white" />}</span>
                <span className="text-xl font-bold text-white">{s.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                    <button onClick={(e) => { e.stopPropagation(); setEditingEntity(s); setFormData(s); setShowSectionModal(true); }} className="p-2 bg-white/10 rounded-lg hover:text-neon-cyan transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteSection(s.id); }} className="p-2 bg-white/10 rounded-lg hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <ChevronRight className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-gray-500 font-bold">No sections available.</div>
          )}
        </div>
      </div>
    );
  };

  const renderFavorites = () => (
    <div className="px-4 pb-24 space-y-6 animate-in fade-in duration-300">
      {renderHeader()}
      <div>
        <h2 className="text-3xl font-black neon-text-magenta uppercase tracking-widest mb-2">FAVORITES</h2>
        <p className="text-gray-300 text-lg">Your quick access starred items</p>
      </div>

      <div className="glass-morphism border border-white/5 border-dashed p-12 rounded-3xl flex flex-col items-center justify-center text-center mt-8 min-h-[300px]">
        <Star className="w-16 h-16 text-gray-500 mb-4" />
        <p className="text-xl font-bold text-gray-400">No favorites yet</p>
      </div>
      
      <div className="absolute bottom-24 left-0 w-full text-center">
        <p className="text-xs font-bold neon-text-cyan tracking-widest uppercase">DESIGN BY : ISLAM AL SAPAA</p>
        <p className="text-[10px] font-bold neon-text-magenta tracking-widest uppercase mt-1">CONTENT DEVELOPED BY : KIH</p>
      </div>
    </div>
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addAttachment(file.name, reader.result as string, file.size);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderFiles = () => (
    <div className="px-4 pb-24 space-y-6 animate-in fade-in duration-300">
      {renderHeader()}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black neon-text-cyan uppercase tracking-widest">Attachments</h2>
        <label className="w-12 h-12 rounded-xl bg-neon-magenta/20 flex items-center justify-center text-neon-magenta hover:bg-neon-magenta/30 transition-colors cursor-pointer">
          <Upload className="w-6 h-6" />
          <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" />
        </label>
      </div>

      <div className="relative mt-4 mb-6">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search attachments..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-gray-400 focus:outline-none focus:border-neon-cyan transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {attachments.map((file: any) => (
          <div key={file.id} className="glass-morphism p-4 rounded-xl border border-white/10 relative group">
            {file.url?.startsWith('data:image') ? (
              <img src={file.url} alt={file.name} className="w-full h-32 object-cover rounded-lg mb-3" />
            ) : (
              <div className="w-full h-32 bg-white/5 rounded-lg mb-3 flex items-center justify-center">
                <Paperclip className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <p className="text-sm font-bold text-white truncate">{file.name}</p>
            <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
            {isAdmin && (
              <button 
                onClick={() => deleteAttachment(file.id)}
                className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      
      <div className="absolute bottom-24 left-0 w-full text-center">
        <p className="text-xs font-bold neon-text-cyan tracking-widest uppercase">DESIGN BY : ISLAM AL SAPAA</p>
        <p className="text-[10px] font-bold neon-text-magenta tracking-widest uppercase mt-1">CONTENT DEVELOPED BY : KIH</p>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="px-4 pb-24 space-y-6 animate-in fade-in duration-300">
      {renderHeader()}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black neon-text-cyan uppercase tracking-widest">Users</h2>
        <button onClick={() => { setEditingEntity(null); setFormData({ role: 'user' }); setShowUserModal(true); }} className="w-12 h-12 rounded-xl bg-neon-cyan/20 flex items-center justify-center text-neon-cyan hover:bg-neon-cyan/30 transition-colors">
          <Plus className="w-6 h-6" />
        </button>
      </div>
      <div className="space-y-4">
        {users.map((u: any) => (
          <div key={u.id} className="glass-morphism neon-border-cyan p-5 rounded-2xl flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold">
                {u.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-lg">{u.username}</p>
                <p className="text-xs text-neon-magenta uppercase tracking-widest">{u.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setEditingEntity(u); setFormData(u); setShowUserModal(true); }} className="p-2 bg-white/10 rounded-lg hover:text-neon-cyan transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <button onClick={() => deleteUser(u.id)} className="p-2 bg-white/10 rounded-lg hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMe = () => (
    <div className="px-4 pb-24 space-y-6 animate-in fade-in duration-300">
      <div className="glass-morphism neon-border-cyan p-8 rounded-3xl flex flex-col items-center justify-center mt-8">
        <div className="w-32 h-32 rounded-full border-4 border-neon-cyan flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,242,255,0.3)]">
          <User className="w-16 h-16 text-neon-cyan" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">{user?.username}</h2>
        <p className="text-sm font-bold neon-text-magenta tracking-widest uppercase">{user?.role}</p>
      </div>

      <div className="glass-morphism neon-border-cyan p-6 rounded-3xl mt-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-neon-cyan" />
          <h3 className="text-2xl font-bold text-white">Settings</h3>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">UPDATE PROFILE</p>
            <input 
              type="text" 
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-neon-cyan transition-colors text-lg"
            />
          </div>

          <button className="w-full bg-neon-cyan text-black font-black py-4 rounded-xl text-lg tracking-widest uppercase shadow-[0_0_15px_rgba(0,242,255,0.4)] hover:bg-white transition-colors">
            SAVE CHANGES
          </button>

          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl py-4 px-5">
            <span className="text-lg font-bold text-white">Language</span>
            <button 
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
              className="text-neon-cyan font-bold tracking-widest uppercase"
            >
              {i18n.language === 'en' ? 'ENGLISH' : 'العربية'}
            </button>
          </div>

          <button 
            onClick={logout}
            className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl py-4 px-5 hover:bg-red-500/10 hover:border-red-500/30 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-red-400 group-hover:text-red-500 transition-colors">logout</span>
              <div className="flex flex-col ml-2">
                <span className="text-[10px] font-bold neon-text-cyan tracking-widest uppercase">DESIGN BY : ISLAM AL SAPAA</span>
                <span className="text-[8px] font-bold neon-text-magenta tracking-widest uppercase">CONTENT DEVELOPED BY : KIH</span>
              </div>
            </div>
            <LogOut className="w-6 h-6 text-red-400 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHome();
      case 'search': return renderSearch();
      case 'sections': return renderSections();
      case 'favorites': return renderFavorites();
      case 'files': return renderFiles();
      case 'users': return renderUsers();
      case 'me': return renderMe();
      default: return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white relative">
      {/* Main Content Area */}
      <div className="h-screen overflow-y-auto pb-20">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0b0914]/90 backdrop-blur-xl border-t border-white/10 pb-safe z-50 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between sm:justify-around px-2 py-3 min-w-max gap-4 mx-auto max-w-md">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all ${isActive ? 'text-neon-cyan' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]' : ''}`} />
                <span className="text-[10px] font-bold tracking-wider uppercase">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-morphism neon-border-cyan p-6 rounded-3xl w-full max-w-md">
            <h3 className="text-2xl font-black neon-text-cyan mb-6">{editingEntity ? 'Edit Section' : 'New Section'}</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Section Name" 
                value={formData.name || ''}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-neon-cyan outline-none"
              />
              <input 
                type="text" 
                placeholder="Emoji (e.g. 📄)" 
                value={formData.emoji || ''}
                onChange={e => setFormData({...formData, emoji: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-neon-cyan outline-none"
              />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowSectionModal(false)} className="flex-1 py-3 rounded-xl border border-white/20 text-white font-bold">Cancel</button>
                <button 
                  onClick={() => {
                    if (editingEntity) updateSection(editingEntity.id, formData);
                    else addSection(formData);
                    setShowSectionModal(false);
                  }} 
                  className="flex-1 py-3 rounded-xl bg-neon-cyan text-black font-black"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showItemModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-morphism neon-border-cyan p-6 rounded-3xl w-full max-w-md">
            <h3 className="text-2xl font-black neon-text-cyan mb-6">{editingEntity ? 'Edit Record' : 'New Record'}</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Title" 
                value={formData.title || ''}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-neon-cyan outline-none"
              />
              <textarea 
                placeholder="Description" 
                value={formData.description || ''}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-neon-cyan outline-none min-h-[100px]"
              />
              <div className="relative">
                <input 
                  type="file" 
                  id="item-attachment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({...formData, attachment_url: reader.result as string});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  accept="image/*,.pdf,.doc,.docx"
                />
                <label 
                  htmlFor="item-attachment"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Paperclip className="w-5 h-5" />
                  {formData.attachment_url ? 'Attachment Added' : 'Add Attachment'}
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowItemModal(false)} className="flex-1 py-3 rounded-xl border border-white/20 text-white font-bold">Cancel</button>
                <button 
                  onClick={() => {
                    if (editingEntity) updateItem(editingEntity.id, formData);
                    else addItem(formData);
                    setShowItemModal(false);
                  }} 
                  className="flex-1 py-3 rounded-xl bg-neon-cyan text-black font-black"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-morphism neon-border-cyan p-6 rounded-3xl w-full max-w-md">
            <h3 className="text-2xl font-black neon-text-cyan mb-6">{editingEntity ? 'Edit User' : 'New User'}</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Username" 
                value={formData.username || ''}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-neon-cyan outline-none"
              />
              {!editingEntity && (
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={formData.password || ''}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-neon-cyan outline-none"
                />
              )}
              <select 
                value={formData.role || 'user'}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-neon-cyan outline-none"
              >
                <option value="user" className="bg-dark-bg">User</option>
                <option value="admin" className="bg-dark-bg">Admin</option>
              </select>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowUserModal(false)} className="flex-1 py-3 rounded-xl border border-white/20 text-white font-bold">Cancel</button>
                <button 
                  onClick={() => {
                    if (editingEntity) updateUser(editingEntity.id, formData);
                    else addUser(formData);
                    setShowUserModal(false);
                  }} 
                  className="flex-1 py-3 rounded-xl bg-neon-cyan text-black font-black"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
