
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
  Zap
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
  
  // Get top movers for the ticker
  const topMovers = useMemo(() => {
    return [...allStocks].sort((a, b) => Math.abs(b.regularMarketChangePercent) - Math.abs(a.regularMarketChangePercent)).slice(0, 5);
  }, [allStocks]);

  const handlePriceDoubleClick = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    navigate(`/stock/${symbol}/edit`);
  };

  return (
    <div className="pb-32 md:pb-20 max-w-7xl mx-auto min-h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-xl z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-neutral-800 p-0.5">
            <img src={avatar} className="w-full h-full rounded-full object-cover" alt="Profile" />
          </div>
          <div>
            <p className="text-neutral-500 text-[10px] uppercase font-black tracking-widest leading-none mb-1">Portfolio</p>
            <h1 className="text-white text-lg font-bold leading-none">{name}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/search')} className="p-2 bg-neutral-900 rounded-full text-neutral-400 active:scale-90 transition-all">
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 space-y-8">
        {/* Main Portfolio Card */}
        <section className="relative">
          <div className="bg-gradient-to-br from-neutral-900 to-black rounded-[2.5rem] p-8 border border-neutral-800 shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-emerald-500/20 transition-all duration-700" />
            
            <div className="relative z-10">
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-2">Total Balance</p>
              <h2 className="text-white text-5xl font-black tracking-tighter mb-6">
                {currency}{totalAccountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${isPortfolioPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {isPortfolioPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span className="text-sm font-black">
                    {isPortfolioPositive ? '+' : ''}{dailyChangeValue.toFixed(2)}{currency} ({dailyChangePercent.toFixed(2)}%)
                  </span>
                </div>
                <div className="h-12 w-32 opacity-50">
                   <MiniChart data={getChartData('AAPL')} isPositive={isPortfolioPositive} width={128} height={48} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Row */}
        <section className="grid grid-cols-4 gap-4">
          {[
            { icon: <QrCode size={20} />, label: 'Scan', color: 'bg-blue-500/10 text-blue-500' },
            { icon: <ArrowUpRight size={20} />, label: 'Send', color: 'bg-emerald-500/10 text-emerald-500' },
            { icon: <ArrowDownLeft size={20} />, label: 'Receive', color: 'bg-purple-500/10 text-purple-500' },
            { icon: <CreditCard size={20} />, label: 'Cards', color: 'bg-orange-500/10 text-orange-500' },
          ].map((action, i) => (
            <button key={i} className="flex flex-col items-center gap-2 group active:scale-90 transition-all">
              <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center border border-white/5 shadow-lg group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">{action.label}</span>
            </button>
          ))}
        </section>

        {/* Top Movers Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-yellow-500" />
              Market Movers
            </h3>
            <button onClick={() => navigate('/search')} className="text-neutral-500 text-[10px] font-bold uppercase hover:text-white transition-colors">See All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {topMovers.map((stock) => (
              <div 
                key={stock.symbol}
                onClick={() => navigate(`/stock/${stock.symbol}`)}
                className="min-w-[140px] bg-neutral-900/50 rounded-3xl p-4 border border-neutral-800/50 active:scale-95 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-full bg-white p-1.5 overflow-hidden">
                    <img src={getLogoUrl(stock.symbol)} alt={stock.symbol} className="w-full h-full object-contain" />
                  </div>
                  <span className={`text-[10px] font-black ${stock.regularMarketChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {stock.regularMarketChange >= 0 ? '+' : ''}{stock.regularMarketChangePercent.toFixed(1)}%
                  </span>
                </div>
                <p className="text-white font-bold text-sm leading-none mb-1">{stock.symbol}</p>
                <p className="text-neutral-500 text-[10px] font-medium truncate">{stock.regularMarketPrice.toFixed(2)}{currency}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Holdings Section */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-white text-sm font-black uppercase tracking-widest">Active Assets</h3>
            <span className="text-neutral-500 text-[10px] font-black uppercase">{holdings.length} Positions</span>
          </div>

          {holdingStocks.length > 0 ? (
            <div className="space-y-3">
              {holdingStocks.map((stock) => {
                const holding = holdings.find(h => h.symbol === stock.symbol);
                const isPositive = stock.regularMarketChange >= 0;
                const totalValue = (holding?.shares || 0) * stock.regularMarketPrice;

                return (
                  <div 
                    key={stock.symbol}
                    onClick={() => navigate(`/stock/${stock.symbol}`)}
                    className="bg-neutral-900/40 md:hover:bg-neutral-800/60 transition-all rounded-[1.5rem] p-4 cursor-pointer border border-neutral-800/30 flex items-center gap-4 active:scale-[0.98] group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center p-2.5 shadow-xl">
                       <img src={getLogoUrl(stock.symbol)} alt={stock.symbol} className="w-full h-full object-contain" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-base leading-none mb-1">{stock.symbol}</h4>
                      <p className="text-neutral-500 text-xs font-medium">{holding?.shares} Shares</p>
                    </div>

                    <div className="text-right">
                       <p className="text-white font-bold text-base leading-none mb-1" onDoubleClick={(e) => handlePriceDoubleClick(e, stock.symbol)}>
                         {currency}{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </p>
                       <p className={`text-[10px] font-black tracking-wider uppercase ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                         {isPositive ? '+' : ''}{stock.regularMarketChangePercent.toFixed(2)}%
                       </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-neutral-900/20 rounded-3xl py-12 px-6 text-center border border-dashed border-neutral-800">
              <p className="text-neutral-500 text-sm font-medium mb-4 italic">No positions currently active in your portfolio.</p>
              <button onClick={() => navigate('/search')} className="bg-emerald-500 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Explore Assets</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
