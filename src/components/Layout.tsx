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
    <div className="min-h-screen pb-32 relative">
      <header className="p-6 flex justify-between items-center max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-neon-cyan p-0.5 bg-dark-bg neon-glow-cyan flex items-center justify-center">
            {!imgError ? (
              <img 
                src={`${BRANDING.logo_url}?v=2`}
                alt="Logo" 
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <Brain className="w-8 h-8 text-neon-cyan" />
            )}
          </div>
          <h1 className="text-2xl font-black neon-text-cyan tracking-widest whitespace-nowrap">{t('app_name')}</h1>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        {children}
      </main>

      {/* Persistent Branding at Bottom */}
      <div className="fixed bottom-24 left-0 right-0 text-center pointer-events-none z-40">
        <p className="text-[10px] font-black neon-text-cyan tracking-[0.2em] uppercase opacity-50">
          {t('footer_team')}
        </p>
        <p className="text-[8px] font-bold text-neon-magenta tracking-[0.1em] uppercase opacity-50">
          {t('branding_content')}
        </p>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            <item.icon className="w-5 h-5 nav-icon" />
            <span className="text-[10px] font-bold tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
