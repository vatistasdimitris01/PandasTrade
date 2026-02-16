
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Search, Settings, Star } from 'lucide-react';
import { useUserStore } from '../lib/store';

// Custom Candlestick Logo Component
const TradingLogo = ({ size = 20 }: { size?: number }) => (
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
        className={`group flex items-center md:justify-center lg:justify-start gap-3 px-4 py-3 transition-all duration-300 active:scale-95 ${
          isActive
            ? 'text-white bg-white/5'
            : 'text-neutral-500 md:hover:text-white md:hover:bg-white/5'
        }`}
      >
        <div className={`transition-transform duration-300 ${isActive ? 'scale-110 text-emerald-400' : 'md:group-hover:scale-110'}`}>
          {icon}
        </div>
        <span className={`font-bold text-xs tracking-wide hidden lg:block ${isActive ? 'text-white' : ''}`}>{label}</span>
      </Link>
    );
  };

  const MobileDockItem = ({ to, icon }: { to: string; icon: React.ReactNode }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex flex-col items-center justify-center flex-1 py-3 transition-all duration-300 active:scale-75 ${
          isActive 
            ? 'text-white' 
            : 'text-neutral-600'
        }`}
      >
        <div className={isActive ? 'scale-110' : ''}>{icon}</div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex font-sans selection:bg-neutral-800 selection:text-white">
      
      {/* Background Glows for Subtle Depth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/5 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar - Desktop Pinned to Edge */}
      <aside className="hidden md:flex flex-col md:w-20 lg:w-64 fixed left-0 top-0 bottom-0 bg-neutral-950/80 backdrop-blur-xl border-r border-white/5 z-50 transition-all duration-500 overflow-hidden">
        <div className="px-4 lg:px-6 pt-10 pb-10 flex justify-center lg:justify-start">
           <div className="flex items-center gap-3">
             <div className="flex items-center justify-center flex-shrink-0">
               <TradingLogo size={24} />
             </div>
             <h1 className="font-black text-lg tracking-tighter text-white hidden lg:block">
              Pandas<span className="text-emerald-500">Trade</span>
            </h1>
           </div>
        </div>
        
        <nav className="flex-1">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavItem to="/search" icon={<Search size={20} />} label="Market" />
          <NavItem to="/watchlist" icon={<Star size={20} />} label="Watchlist" />
          <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
        </nav>

        {/* Desktop Profile Card (Bottom Pinned) */}
        <div className="mt-auto border-t border-white/5 p-4">
           <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="w-10 h-10 rounded-xl overflow-hidden grayscale hover:grayscale-0 transition-all cursor-pointer">
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              </div>
              <div className="hidden lg:block min-w-0">
                <p className="text-[10px] font-black text-white truncate uppercase tracking-widest leading-none">{name}</p>
                <p className="text-emerald-500 text-[10px] font-bold mt-1 uppercase tracking-tighter">Pro Status</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Mobile Dock - Bottom Pinned Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-neutral-950/80 backdrop-blur-xl border-t border-white/5 z-[100] flex items-center justify-around px-2 pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.5)]">
        <MobileDockItem to="/" icon={<LayoutDashboard size={20} />} />
        <MobileDockItem to="/search" icon={<Search size={20} />} />
        <MobileDockItem to="/watchlist" icon={<Star size={20} />} />
        <MobileDockItem to="/settings" icon={<Settings size={20} />} />
      </div>

      <main className="flex-1 w-full min-h-screen bg-transparent md:ml-20 lg:ml-64 relative z-10 pt-safe transition-all duration-500">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
