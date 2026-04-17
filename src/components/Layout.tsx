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
  selectedSubState?: string | null;
  setSelectedSubState?: (state: string | null) => void;
}

export default function Layout({ 
  children, 
  activeTab, 
  setActiveTab,
  selectedSubState = null,
  setSelectedSubState
}: LayoutProps) {
  const { t } = useTranslation();
  const { user } = useStore();

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Initial state setup
    if (!window.history.state) {
      window.history.replaceState({ tab: activeTab, sub: selectedSubState }, '', '');
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        if (event.state.tab && event.state.tab !== activeTab) {
          setActiveTab(event.state.tab);
        }
        if (setSelectedSubState) {
          setSelectedSubState(event.state.sub || null);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveTab, activeTab, selectedSubState, setSelectedSubState]);

  const handleTabChange = (tabId: string) => {
    if (tabId !== activeTab) {
      // Clear sub-state when switching main tabs
      window.history.pushState({ tab: tabId, sub: null }, '', '');
      setActiveTab(tabId);
      if (setSelectedSubState) setSelectedSubState(null);
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
    <div className="min-h-screen pb-32 relative overflow-x-hidden">
      {/* Dynamic Glass Neon Border */}
      <div className="app-neon-border"></div>
      
      {/* Subtle Animated Background Shine */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-blue rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-pink rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <header className="p-6 flex justify-between items-center max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-transparent p-[2px] bg-gradient-to-br from-neon-blue to-neon-pink neon-glow-blue flex items-center justify-center relative">
            <div className="absolute inset-0 bg-dark-bg rounded-[10px] -z-10"></div>
            {!imgError ? (
              <img 
                src={BRANDING.logo_url} 
                alt="Logo" 
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <Brain className="w-8 h-8 text-neon-blue" />
            )}
          </div>
          <h1 className="text-2xl font-black neon-text-blue tracking-widest whitespace-nowrap">{t('app_name')}</h1>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        {children}
      </main>

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
