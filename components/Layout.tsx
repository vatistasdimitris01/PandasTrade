
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
        className={`group flex items-center md:justify-center lg:justify-start gap-3 px-3 py-2.5 mx-2 lg:mx-3 rounded-xl transition-all duration-300 active:scale-95 ${
          isActive
            ? 'bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/10'
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
        className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 active:scale-75 ${
          isActive 
            ? 'bg-white/10 text-emerald-400 shadow-xl border border-white/20 ring-1 ring-white/5' 
            : 'text-neutral-500'
        }`}
      >
        <div className={isActive ? 'scale-110' : ''}>{icon}</div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex font-sans selection:bg-neutral-800 selection:text-white">
      
      {/* Background Glows for Glass Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar - Desktop Floating Glass (Mini Style) */}
      <aside className="hidden md:flex flex-col md:w-20 lg:w-60 fixed left-5 top-5 bottom-5 bg-neutral-950/20 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] z-50 transition-all duration-500 overflow-hidden">
        <div className="px-0 lg:px-6 pt-8 pb-8 flex justify-center lg:justify-start">
           <div className="flex items-center gap-3">
             <div className="flex items-center justify-center flex-shrink-0 bg-white/5 rounded-xl p-2 border border-white/10">
               <TradingLogo size={20} />
             </div>
             <h1 className="font-black text-lg tracking-tighter text-white hidden lg:block">
              Pandas<span className="text-emerald-500">Trade</span>
            </h1>
           </div>
        </div>
        
        <nav className="flex-1 space-y-1.5">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavItem to="/search" icon={<Search size={20} />} label="Market" />
          <NavItem to="/watchlist" icon={<Star size={20} />} label="Watchlist" />
          <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
        </nav>

        {/* Desktop Profile Card */}
        <div className="p-3 mb-3">
           <div className="bg-white/5 rounded-2xl p-2.5 lg:p-3 border border-white/5 backdrop-blur-md group cursor-pointer active:scale-95 transition-all">
             <div className="flex items-center gap-2.5 justify-center lg:justify-start">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 ring-1 ring-black group-hover:ring-emerald-500/30 transition-all">
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 hidden lg:block">
                  <p className="text-[10px] font-black text-white truncate uppercase tracking-widest leading-none">{name}</p>
                  <p className="text-[9px] text-emerald-500 font-bold truncate uppercase tracking-tighter mt-1">Pro</p>
                </div>
             </div>
             <div className="mt-3 space-y-0.5 hidden lg:block">
                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Balance</p>
                <p className="text-base font-black text-white tracking-tighter">
                  {currency}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
             </div>
           </div>
        </div>
      </aside>

      {/* Mobile Dock - Compact Floating Glass Pill */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm h-14 bg-neutral-950/20 backdrop-blur-3xl border border-white/10 z-[100] flex items-center justify-around px-2 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        <MobileDockItem to="/" icon={<LayoutDashboard size={18} />} />
        <MobileDockItem to="/search" icon={<Search size={18} />} />
        <MobileDockItem to="/watchlist" icon={<Star size={18} />} />
        <MobileDockItem to="/settings" icon={<Settings size={18} />} />
      </div>

      <main className="flex-1 w-full min-h-screen bg-transparent md:ml-24 lg:ml-64 relative z-10 pt-safe transition-all duration-500">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
