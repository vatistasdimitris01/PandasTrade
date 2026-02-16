
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
        className={`group flex items-center md:justify-center lg:justify-start gap-3 px-4 py-3 mx-2 lg:mx-3 rounded-2xl transition-all duration-300 active:scale-95 ${
          isActive
            ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10'
            : 'text-neutral-500 md:hover:text-white md:hover:bg-white/5'
        }`}
      >
        <div className={`transition-transform duration-300 ${isActive ? 'scale-110 text-emerald-400' : 'md:group-hover:scale-110'}`}>
          {icon}
        </div>
        <span className={`font-bold text-sm tracking-wide hidden lg:block ${isActive ? 'text-white' : ''}`}>{label}</span>
      </Link>
    );
  };

  const MobileDockItem = ({ to, icon }: { to: string; icon: React.ReactNode }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 active:scale-75 ${
          isActive ? 'bg-white/10 text-emerald-400 shadow-lg border border-white/10' : 'text-neutral-500'
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

      {/* Sidebar - Desktop Floating Glass */}
      <aside className="hidden md:flex flex-col md:w-20 lg:w-64 fixed left-6 top-6 bottom-6 bg-neutral-900/30 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] z-50 transition-all duration-500 overflow-hidden">
        <div className="px-0 lg:px-6 pt-10 pb-10 flex justify-center lg:justify-start">
           <div className="flex items-center gap-3">
             <div className="flex items-center justify-center flex-shrink-0 bg-white/5 rounded-2xl p-2 shadow-inner border border-white/10">
               <TradingLogo size={24} />
             </div>
             <h1 className="font-black text-xl tracking-tighter text-white hidden lg:block">
              Pandas<span className="text-emerald-500">Trade</span>
            </h1>
           </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          <NavItem to="/" icon={<LayoutDashboard size={22} />} label="Overview" />
          <NavItem to="/search" icon={<Search size={22} />} label="Market" />
          <NavItem to="/watchlist" icon={<Star size={22} />} label="Watchlist" />
          <NavItem to="/settings" icon={<Settings size={22} />} label="Settings" />
        </nav>

        {/* Desktop Profile Card - Floating style */}
        <div className="p-3 lg:p-4 mb-4">
           <div className="bg-white/5 rounded-3xl p-3 lg:p-4 border border-white/5 backdrop-blur-md group cursor-pointer active:scale-95 transition-all">
             <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="w-10 h-10 rounded-2xl overflow-hidden border border-white/10 ring-2 ring-black group-hover:ring-emerald-500/30 transition-all">
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 hidden lg:block">
                  <p className="text-xs font-black text-white truncate uppercase tracking-widest">{name}</p>
                  <p className="text-[10px] text-emerald-500 font-bold truncate uppercase tracking-tighter">Pro member</p>
                </div>
             </div>
             <div className="mt-4 space-y-1 hidden lg:block">
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Balance</p>
                <p className="text-lg font-black text-white tracking-tighter">
                  {currency}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
             </div>
           </div>
        </div>
      </aside>

      {/* Mobile Dock - Floating Glass Pill */}
      <div className="md:hidden fixed bottom-8 left-6 right-6 h-20 bg-neutral-900/40 backdrop-blur-2xl border border-white/10 z-[100] flex items-center justify-around px-4 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        <MobileDockItem to="/" icon={<LayoutDashboard size={24} />} />
        <MobileDockItem to="/search" icon={<Search size={24} />} />
        <MobileDockItem to="/watchlist" icon={<Star size={24} />} />
        <MobileDockItem to="/settings" icon={<Settings size={24} />} />
      </div>

      <main className="flex-1 w-full min-h-screen bg-transparent md:ml-28 lg:ml-72 relative z-10 pt-safe transition-all duration-500">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
