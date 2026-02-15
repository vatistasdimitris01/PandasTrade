
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StockDetail from './pages/StockDetail';
import StockEdit from './pages/StockEdit';
import Search from './pages/Search';
import Settings from './pages/Settings';
import Watchlist from './pages/Watchlist';
import Layout from './components/Layout';
import LockScreen from './components/LockScreen';
import { Toaster } from 'react-hot-toast';
import { useUserStore } from './lib/store';

function AppContent() {
  const { isSecurityEnabled, setLocked } = useUserStore();

  useEffect(() => {
    // If security is enabled, lock on every cold start
    if (isSecurityEnabled) {
      setLocked(true);
    }
  }, []);

  return (
    <>
      <LockScreen />
      <Layout>
        <div className="w-full min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stock/:symbol" element={<StockDetail />} />
            <Route path="/stock/:symbol/edit" element={<StockEdit />} />
            <Route path="/search" element={<Search />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
        <Toaster 
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#262626',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </Layout>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
