import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Search, Settings, Star } from 'lucide-react';
import { useUserStore } from '../lib/store';

// Custom Candlestick Logo Component
const TradingLogo = ({ size = 24 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M7 2v3" stroke="#10b981" />
    <rect x="5" y="5" width="4" height="10" rx="1" fill="#10b981" />
    <path d="M7 15v7" stroke="#10b981" />
    <path d="M17 2v10" stroke="#ef4444" />
    <rect x="15" y="12" width="4" height="6" rx="1" fill="#ef4444" stroke="#ef4444" />
    <path d="M17 18v4" stroke="#ef4444" />
  </svg>
);

export default function Layout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const { balance, currency, name, avatar } = useUserStore();

  const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`group flex items-center md:justify-center lg:justify-start gap-3 px-4 py-3 mx-2 lg:mx-4 rounded-xl transition-all duration-200 active:scale-95 ${
          isActive
            ? 'bg-white text-black shadow-lg shadow-white/5'
            : 'text-neutral-400 md:hover:text-white md:hover:bg-neutral-900'
        }`}
      >
        <div className={`transition-transform duration-200 ${isActive ? 'scale-100' : 'md:group-hover:scale-110'}`}>
          {icon}
        </div>
        <span className="font-semibold text-sm tracking-wide hidden lg:block">{label}</span>
      </Link>
    );
  };

  const MobileDockItem = ({ to, icon }: { to: string; icon: React.ReactNode }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex flex-1 flex-col items-center justify-center py-3 transition-all active:scale-75 ${
          isActive ? 'text-white' : 'text-neutral-500'
        }`}
      >
        <div className="mb-0.5">{icon}</div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex font-sans selection:bg-neutral-800 selection:text-white pb-24 md:pb-0">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col md:w-20 lg:w-72 h-screen sticky top-0 border-r border-neutral-900/50 bg-black/50 backdrop-blur-xl z-50 transition-all duration-300">
        <div className="px-0 lg:px-8 pt-10 pb-12 flex justify-center lg:justify-start">
           <div className="flex items-center gap-2">
             <div className="flex items-center justify-center flex-shrink-0 bg-neutral-900 rounded-lg p-1.5 shadow-lg border border-neutral-800">
               <TradingLogo size={24} />
             </div>
             <h1 className="font-bold text-xl tracking-tight text-white hidden lg:block mt-0.5">
              Pandas<span className="text-neutral-600">Trade</span>
            </h1>
           </div>
        </div>
        
        <nav className="flex-1 space-y-4 lg:space-y-2">
          <NavItem to="/" icon={<LayoutDashboard size={24} className="lg:w-5 lg:h-5" />} label="Overview" />
          <NavItem to="/search" icon={<Search size={24} className="lg:w-5 lg:h-5" />} label="Market" />
          <NavItem to="/watchlist" icon={<Star size={24} className="lg:w-5 lg:h-5" />} label="Watchlist" />
          <NavItem to="/settings" icon={<Settings size={24} className="lg:w-5 lg:h-5" />} label="Settings" />
        </nav>

        <div className="p-2 lg:p-4 lg:mx-4 mb-6 flex justify-center lg:block">
           <div className="bg-transparent lg:bg-neutral-900/50 rounded-2xl p-0 lg:p-4 lg:border lg:border-neutral-800/50 lg:backdrop-blur-md md:hover:bg-neutral-900/80 transition-colors cursor-pointer group">
             <div className="flex items-center gap-3 lg:mb-4 justify-center lg:justify-start">
                <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden ring-2 ring-black group-hover:ring-white/20 transition-all">
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 hidden lg:block">
                  <p className="text-sm font-bold text-white truncate">{name}</p>
                  <p className="text-xs text-neutral-500 truncate">Pro Account</p>
                </div>
             </div>
             <div className="space-y-1 hidden lg:block">
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>Buying Power</span>
                </div>
                <div className="text-lg font-bold text-white font-mono tracking-tight">
                  {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{currency}
                </div>
             </div>
           </div>
        </div>
      </aside>

      {/* Mobile Dock - Optimized for iOS Home Indicator */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-neutral-900/50 z-50 flex items-center justify-between px-6 pb-safe">
        <MobileDockItem to="/" icon={<LayoutDashboard size={24} />} />
        <MobileDockItem to="/search" icon={<Search size={24} />} />
        <MobileDockItem to="/watchlist" icon={<Star size={24} />} />
        <MobileDockItem to="/settings" icon={<Settings size={24} />} />
      </div>

      <main className="flex-1 w-full min-h-screen bg-black overflow-x-hidden pt-safe">
        {children}
      </main>
    </div>
  );
}