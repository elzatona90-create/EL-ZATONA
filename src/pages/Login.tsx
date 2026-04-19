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
      {/* Dynamic Glass Neon Border */}
      <div className="app-neon-border"></div>

      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-neon-blue/20 blur-[130px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-neon-pink/20 blur-[130px] rounded-full"></div>

      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 glass-morphism px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-all"
        >
          <Globe className="w-4 h-4 text-neon-blue" />
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
          <div className="w-28 h-28 rounded-[28px] overflow-hidden border-4 border-neon-pink neon-glow-pink p-1 bg-gradient-to-br from-neon-pink to-neon-blue font-black">
            <div className="w-full h-full rounded-[24px] overflow-hidden bg-dark-bg flex items-center justify-center">
              {!imgError ? (
                <img 
                  src={BRANDING.logo_url} 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <Brain className="w-16 h-16 text-neon-blue" />
              )}
            </div>
          </div>
        </div>

        {/* App Name Section */}
        <div className="text-center mb-12 w-full">
          <div className="inline-block glass-morphism px-8 py-3 rounded-full border border-neon-blue mb-6 shadow-[0_0_30px_rgba(0,102,255,0.4)]">
            <h1 className="text-3xl md:text-4xl font-black neon-text-blue tracking-widest whitespace-nowrap">
              {t('app_name')}
            </h1>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold neon-text-blue tracking-widest uppercase">
              {t('branding_design')}
            </p>
            <p className="text-sm font-bold neon-text-pink tracking-widest uppercase">
              {t('branding_content')}
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full glass-morphism p-8 rounded-[40px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative overflow-hidden group">
          {/* Internal Glows for the box */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-neon-blue/30 blur-[60px] rounded-full group-hover:bg-neon-blue/40 transition-all duration-700"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-neon-pink/30 blur-[60px] rounded-full group-hover:bg-neon-pink/40 transition-all duration-700"></div>

          <form onSubmit={handleLogin} className="relative z-10 space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-neon-blue tracking-[0.3em] uppercase ml-4">Identification</p>
              <div className="relative">
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/10 border-2 border-white/10 rounded-[24px] px-6 py-4 focus:outline-none focus:border-neon-blue transition-all text-lg placeholder:text-gray-400 backdrop-blur-md"
                  placeholder={t('username')}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-neon-pink tracking-[0.3em] uppercase ml-4">Security</p>
              <div className="relative">
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border-2 border-white/10 rounded-[24px] px-6 py-4 focus:outline-none focus:border-neon-pink transition-all text-lg placeholder:text-gray-400 backdrop-blur-md"
                  placeholder={t('password')}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-400 text-sm text-center font-bold tracking-tight"
              >
                {error}
              </motion.p>
            )}

            <button 
              type="submit"
              className="w-full relative group/btn h-16 rounded-[24px] overflow-hidden transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(0,102,255,0.3)] hover:shadow-[0_0_35px_rgba(0,102,255,0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue via-blue-500 to-neon-pink animate-pulse opacity-90 group-hover/btn:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex items-center justify-center gap-3 text-white font-black text-xl tracking-[0.2em] transition-transform group-hover/btn:scale-105">
                <LogIn className="w-6 h-6" />
                {t('login')}
              </div>
            </button>
          </form>
        </div>

        {/* Footer Section */}
        <div className="mt-16 text-center space-y-2">
          <div className="w-full h-[1px] bg-white/10 mb-8"></div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">
            {t('footer_authorized')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
