
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  QrCode, 
  CreditCard,
  Zap,
  ChevronRight,
  Wallet,
  Activity
} from 'lucide-react';
import { useUserStore } from '../lib/store';
import { 
  getStocks, 
  simulatePriceChange, 
  subscribeToPriceChanges, 
  getLogoUrl, 
  syncStocksWithConfig, 
  fetchPricesFromAPI, 
  getChartData 
} from '../lib/stockData';
import MiniChart from '../components/MiniChart';

export default function Home() {
  const navigate = useNavigate();
  const { name, balance, currency, holdings, avatar } = useUserStore();
  const [, setTick] = useState(0);

  useEffect(() => {
    syncStocksWithConfig();
    fetchPricesFromAPI();
    
    const unsubscribe = subscribeToPriceChanges(() => {
      setTick(t => t + 1);
    });
    
    const simInterval = setInterval(() => {
      simulatePriceChange();
    }, 5000); 

    return () => {
      unsubscribe();
      clearInterval(simInterval);
    };
  }, []);

  const allStocks = getStocks();
  
  const portfolioValue = useMemo(() => holdings.reduce((total, holding) => {
    const stock = allStocks.find(s => s.symbol === holding.symbol);
    return total + (stock ? stock.regularMarketPrice * holding.shares : 0);
  }, 0), [allStocks, holdings]);

  const dailyChangeValue = useMemo(() => holdings.reduce((total, holding) => {
    const stock = allStocks.find(s => s.symbol === holding.symbol);
    return total + (stock ? stock.regularMarketChange * holding.shares : 0);
  }, 0), [allStocks, holdings]);

  const totalAccountValue = balance + portfolioValue;
  const isPortfolioPositive = dailyChangeValue >= 0;
  const dailyChangePercent = portfolioValue > 0 
    ? (dailyChangeValue / (portfolioValue - dailyChangeValue)) * 100 
    : 0;

  const holdingStocks = allStocks.filter(s => holdings.some(h => h.symbol === s.symbol));
  
  const topMovers = useMemo(() => {
    return [...allStocks].sort((a, b) => Math.abs(b.regularMarketChangePercent) - Math.abs(a.regularMarketChangePercent)).slice(0, 5);
  }, [allStocks]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="pb-32 md:pb-12 max-w-5xl mx-auto min-h-screen flex flex-col bg-transparent">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-black/40 backdrop-blur-3xl z-40">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl border border-white/10 p-0.5 bg-neutral-900 shadow-2xl">
              <img src={avatar} className="w-full h-full rounded-[14px] object-cover" alt="Profile" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-black rounded-full shadow-lg" />
          </div>
          <div>
            <p className="text-neutral-500 text-[10px] uppercase font-black tracking-widest leading-none mb-1.5">{getGreeting()}</p>
            <h1 className="text-white text-xl font-black tracking-tight leading-none">{name}</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/search')} className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white active:scale-90 transition-all">
            <Plus size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 px-6 space-y-10">
        {/* Hero Portfolio Section */}
        <section className="relative">
          <div className="bg-neutral-900/40 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-emerald-500/20" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">Net Worth</span>
                <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase">Live Updates</div>
              </div>
              
              <h2 className="text-white text-6xl font-black tracking-tighter mb-8 tabular-nums">
                <span className="text-3xl font-bold text-neutral-600 mr-1">{currency}</span>
                {totalAccountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-xl border ${isPortfolioPositive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                  {isPortfolioPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span className="text-sm font-black tracking-tight">
                    {isPortfolioPositive ? '+' : ''}{dailyChangeValue.toFixed(2)}{currency} ({dailyChangePercent.toFixed(2)}%)
                  </span>
                </div>
                
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-neutral-400">
                  <Wallet size={14} className="opacity-50" />
                  <span className="text-xs font-bold tracking-tight">
                    {currency}{balance.toLocaleString()} Cash
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Commands Bar */}
        <section>
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: <QrCode size={22} />, label: 'Scan', color: 'text-blue-400 bg-blue-500/5 border-blue-500/10' },
              { icon: <ArrowUpRight size={22} />, label: 'Trade', color: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10', action: () => navigate('/search') },
              { icon: <ArrowDownLeft size={22} />, label: 'Receive', color: 'text-purple-400 bg-purple-500/5 border-purple-500/10' },
              { icon: <CreditCard size={22} />, label: 'Assets', color: 'text-orange-400 bg-orange-500/5 border-orange-500/10' },
            ].map((action, i) => (
              <button 
                key={i} 
                onClick={action.action}
                className="flex flex-col items-center gap-3 group active:scale-95 transition-all"
              >
                <div className={`w-full aspect-square rounded-[2rem] ${action.color} flex items-center justify-center border shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                  {action.icon}
                </div>
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Dynamic Market Pulse */}
        <section>
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap size={14} className="text-yellow-400 fill-yellow-400" />
              Market Pulse
            </h3>
            <button onClick={() => navigate('/search')} className="text-emerald-500 text-[10px] font-black uppercase tracking-widest md:hover:opacity-70 transition-opacity">Full Market <ChevronRight size={10} className="inline ml-1" /></button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x">
            {topMovers.map((stock) => (
              <div 
                key={stock.symbol}
                onClick={() => navigate(`/stock/${stock.symbol}`)}
                className="min-w-[160px] bg-neutral-900/40 backdrop-blur-md rounded-[2.5rem] p-5 border border-white/5 active:scale-95 transition-all snap-start"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center p-2 shadow-inner">
                    <img src={getLogoUrl(stock.symbol)} alt={stock.symbol} className="w-full h-full object-contain" />
                  </div>
                  <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${stock.regularMarketChange >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {stock.regularMarketChange >= 0 ? '+' : ''}{stock.regularMarketChangePercent.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <p className="text-white font-black text-lg leading-none tracking-tight mb-1.5">{stock.symbol}</p>
                  <p className="text-neutral-500 text-[10px] font-bold tracking-tight">{currency}{stock.regularMarketPrice.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Portfolio Assets List */}
        <section className="pb-10">
          <div className="flex justify-between items-end mb-6 px-1">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-neutral-500" />
              <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">Active Assets</h3>
            </div>
            <span className="text-neutral-600 text-[9px] font-black uppercase tracking-[0.1em]">{holdings.length} Positions Active</span>
          </div>

          {holdingStocks.length > 0 ? (
            <div className="space-y-4">
              {holdingStocks.map((stock) => {
                const holding = holdings.find(h => h.symbol === stock.symbol);
                const isPositive = stock.regularMarketChange >= 0;
                const totalValue = (holding?.shares || 0) * stock.regularMarketPrice;

                return (
                  <div 
                    key={stock.symbol}
                    onClick={() => navigate(`/stock/${stock.symbol}`)}
                    className="bg-neutral-900/30 md:hover:bg-white/5 transition-all rounded-[2rem] p-5 cursor-pointer border border-white/5 flex items-center gap-4 active:scale-[0.98] group"
                  >
                    <div className="w-14 h-14 rounded-3xl bg-white flex items-center justify-center p-3 shadow-2xl transition-transform group-hover:scale-105">
                       <img src={getLogoUrl(stock.symbol)} alt={stock.symbol} className="w-full h-full object-contain" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-black text-lg leading-none">{stock.symbol}</h4>
                        <div className="h-1 w-1 rounded-full bg-neutral-700" />
                        <span className="text-neutral-500 text-[10px] font-black uppercase tracking-tighter">{holding?.shares} Shares</span>
                      </div>
                      <p className="text-neutral-600 text-[11px] font-bold truncate">{stock.shortName}</p>
                    </div>

                    <div className="text-right">
                       <p className="text-white font-black text-lg leading-none mb-1.5 tabular-nums">
                         {currency}{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </p>
                       <div className={`inline-flex items-center gap-1 text-[10px] font-black tracking-tighter uppercase ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                         {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                         {stock.regularMarketChangePercent.toFixed(2)}%
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-neutral-900/20 rounded-[3rem] py-16 px-6 text-center border border-dashed border-white/10">
              <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet size={32} className="text-neutral-700" />
              </div>
              <h4 className="text-white font-bold mb-2">Portfolio Empty</h4>
              <p className="text-neutral-500 text-xs font-medium mb-8 max-w-[200px] mx-auto leading-relaxed italic">Your journey to wealth starts with your first trade.</p>
              <button 
                onClick={() => navigate('/search')} 
                className="bg-emerald-500 text-white font-black text-[11px] uppercase tracking-[0.2em] px-10 py-4 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
              >
                Browse Markets
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
