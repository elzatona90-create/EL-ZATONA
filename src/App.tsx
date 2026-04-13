/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from './store/useStore';
import './lib/i18n';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

export default function App() {
  const { i18n } = useTranslation();
  const { user, fetchData } = useStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await fetchData();
      setIsReady(true);
    };
    init();
  }, [fetchData]);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-bg">
        <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin neon-glow-cyan"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
}
