import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StockDetail from './pages/StockDetail';
import Search from './pages/Search';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  return (
    <Layout>
      <div className="w-full min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stock/:symbol" element={<StockDetail />} />
          <Route path="/search" element={<Search />} />
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
          },
        }}
      />
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}