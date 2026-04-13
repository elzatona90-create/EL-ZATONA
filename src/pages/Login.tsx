import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';
import { Lock, User as UserIcon, Globe, LogIn, Brain } from 'lucide-react';

import { BRANDING } from '../constants';

export default function Login() {
  const { t, i18n } = useTranslation();
  const { setUser, users } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'admin' && password === 'admin') {
      setUser({ username: 'admin', role: 'admin', displayName: 'System Admin' });
      return;
    }

    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setUser(foundUser);
    } else {
      setError('Invalid credentials');
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-cyan/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-magenta/10 blur-[120px] rounded-full"></div>

      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 glass-morphism px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-all"
        >
          <Globe className="w-4 h-4 text-neon-cyan" />
          <span>{i18n.language === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex flex-col items-center relative z-10"
      >
        {/* Logo Section */}
        <div className="mb-12 relative">
          <div className="w-40 h-40 rounded-[40px] overflow-hidden border-4 border-neon-magenta neon-glow-magenta p-1 bg-gradient-to-br from-neon-magenta to-neon-cyan">
            <div className="w-full h-full rounded-[36px] overflow-hidden bg-dark-bg flex items-center justify-center">
              {!imgError ? (
                <img 
                  src={BRANDING.logo_url} 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              ) : (
                <Brain className="w-24 h-24 text-neon-cyan" />
              )}
            </div>
          </div>
        </div>

        {/* App Name Section */}
        <div className="text-center mb-12 w-full">
          <div className="inline-block glass-morphism px-6 py-2 rounded-full border border-neon-cyan mb-6 neon-glow-cyan shadow-[0_0_30px_rgba(0,168,255,0.6)]">
            <h1 className="text-xl md:text-2xl font-black neon-text-cyan tracking-widest whitespace-nowrap">
              {t('app_name')}
            </h1>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold neon-text-cyan tracking-widest uppercase">
              {t('branding_design')}
            </p>
            <p className="text-sm font-bold neon-text-magenta tracking-widest uppercase">
              {t('branding_content')}
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div className="relative group">
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 rounded-[24px] px-6 py-5 focus:outline-none focus:border-neon-cyan transition-all text-lg placeholder:text-gray-600"
              placeholder={t('username')}
              required
            />
          </div>

          <div className="relative group">
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 rounded-[24px] px-6 py-5 focus:outline-none focus:border-neon-cyan transition-all text-lg placeholder:text-gray-600"
              placeholder={t('password')}
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center font-medium">{error}</p>
          )}

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-neon-cyan to-neon-magenta text-white font-black py-5 rounded-[24px] text-2xl flex items-center justify-center gap-3 neon-glow-cyan hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest"
          >
            <LogIn className="w-8 h-8" />
            {t('login')}
          </button>
        </form>

        {/* Footer Section */}
        <div className="mt-16 text-center space-y-2">
          <div className="w-full h-[1px] bg-white/10 mb-8"></div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">
            {t('footer_authorized')}
          </p>
          <p className="text-sm font-black neon-text-cyan tracking-[0.2em] uppercase">
            {t('footer_team')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
