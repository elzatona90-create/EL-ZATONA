import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';
import { Lock, User as UserIcon, Globe, LogIn, Brain } from 'lucide-react';

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { db, auth } from '../firebase';
import { BRANDING } from '../constants';

export default function Login() {
  const { t, i18n } = useTranslation();
  const { setUser, users } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      
      // Check if user exists in our Firestore users collection or if it's the default admin
      if (googleUser.email === 'elzatona90@gmail.com') {
        setUser({ 
          id: googleUser.uid,
          username: 'admin', 
          role: 'admin', 
          displayName: googleUser.displayName || 'System Admin',
          email: googleUser.email
        });
      } else {
        // Find existing user by email
        const existingUser = users.find(u => u.email === googleUser.email);
        if (existingUser) {
          setUser({ ...existingUser, id: googleUser.uid });
        } else {
          // New user from Google
          setUser({
            id: googleUser.uid,
            username: googleUser.email?.split('@')[0] || 'user',
            role: 'user',
            displayName: googleUser.displayName || 'Anonymous',
            email: googleUser.email
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(t('google_login_failed') || 'Google Login Failed');
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 relative overflow-hidden">
      {/* Background patterns could go here if needed */}
      
      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
        >
          <Globe className="w-4 h-4 text-teal-600" />
          <span>{i18n.language === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md flex flex-col items-center relative z-10"
      >
        {/* Logo Section */}
        <div className="mb-12">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border border-slate-200 p-1 bg-white shadow-xl">
            <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center">
              {!imgError ? (
                <img 
                  src={BRANDING.logo_url} 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              ) : (
                <Brain className="w-12 h-12 text-teal-600" />
              )}
            </div>
          </div>
        </div>

        {/* App Name Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">
            {t('app_name')}
          </h1>
          <div className="flex flex-col gap-1 items-center">
            <p className="text-[10px] font-black text-teal-600 tracking-[0.2em] uppercase">
              {t('branding_design')}
            </p>
            <p className="text-[10px] font-black text-pink-600 tracking-[0.2em] uppercase">
              {t('branding_content')}
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full bg-white border border-slate-200 p-8 rounded-[32px] shadow-2xl space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('username')}</label>
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-teal-600 transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('password')}</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-teal-600 transition-all"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center font-bold">{error}</p>
            )}

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-lg flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-[0.98] transition-all uppercase tracking-widest"
            >
              <LogIn className="w-6 h-6" />
              {t('login')}
            </button>
          </form>
        </div>

        {/* Footer Section */}
        <div className="mt-12 text-center space-y-1 opacity-50">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em]">
            {t('footer_authorized')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
