import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Home, Layers, Paperclip, User, Search, Star, Users, Brain } from 'lucide-react';
import { BRANDING } from '../constants';
import { useStore } from '../store/useStore';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { t } = useTranslation();
  const { user } = useStore();

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Initial state
    if (!window.history.state) {
      window.history.replaceState({ tab: activeTab }, '', '');
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveTab, activeTab]);

  const handleTabChange = (tabId: string) => {
    if (tabId !== activeTab) {
      window.history.pushState({ tab: tabId }, '', '');
      setActiveTab(tabId);
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: t('home') },
    ...(user?.role === 'admin' ? [{ id: 'search', icon: Search, label: t('global_search') }] : []),
    { id: 'sections', icon: Layers, label: t('sections') },
    { id: 'favorites', icon: Star, label: t('favorites') },
    { id: 'files', icon: Paperclip, label: t('files') },
    ...(user?.role === 'admin' ? [{ id: 'users', icon: Users, label: t('users') }] : []),
    { id: 'me', icon: User, label: t('me') },
  ];

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 shadow-sm">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 p-0.5 bg-white flex items-center justify-center">
              {!imgError ? (
                <img 
                  src={BRANDING.logo_url}
                  alt="Logo" 
                  className="w-full h-full object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              ) : (
                <Brain className="w-6 h-6 text-teal-600" />
              )}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('app_name')}</h1>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === item.id ? 'text-teal-600' : 'text-slate-400'}`}
          >
            <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'fill-teal-600/10' : ''}`} />
            <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
