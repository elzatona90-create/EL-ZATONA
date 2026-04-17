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
      // If we have a user, we MUST wait for data before showing dashboard
      if (user) {
        await fetchData();
        setIsReady(true);
      } else {
        // If no user, show login immediately and fetch data in background
        setIsReady(true);
        fetchData(); 
      }
    };
    init();
  }, [fetchData, user]);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-bg">
        <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin neon-glow-blue"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
}
