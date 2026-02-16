
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  ArrowRight,
  ChevronDown,
  Star
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
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

const TIME_RANGES = ['1D', '1W', '1M', '1Y', 'ALL'];

export default function Home() {
  const navigate = useNavigate();
  const { balance, currency, holdings, avatar } = useUserStore();
  const [selectedRange, setSelectedRange] = useState('1D');
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
  const isPositive = dailyChangeValue >= 0;
  const dailyChangePercent = portfolioValue > 0 
    ? (dailyChangeValue / (portfolioValue - dailyChangeValue)) * 100 
    : 1.07;

  const holdingStocks = allStocks.filter(s => holdings.some(h => h.symbol === s.symbol));
  const mainChartData = useMemo(() => getChartData('AAPL', selectedRange), [selectedRange]);

  return (
    <div className="pb-44 pt-safe px-8 max-w-xl mx-auto min-h-screen bg-black">
      {/* Ultra-Minimal Header with contextual nav */}
      <header className="flex items-center justify-between pt-12 mb-12">
        <h1 className="text-white text-2xl font-black tracking-tight">Wealth</h1>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/watchlist')}
            className="text-neutral-600 hover:text-white transition-colors active:scale-90"
          >
            <Star size={20} />
          </button>
          <div 
            onClick={() => navigate('/settings')}
            className="w-8 h-8 rounded-full overflow-hidden grayscale hover:grayscale-0 transition-all cursor-pointer border border-white/10 active:scale-90"
          >
            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Hero Balance */}
      <section className="mb-10">
        <div className="flex flex-col">
          <h2 className="text-white text-6xl font-black tracking-tighter mb-2 tabular-nums">
            {totalAccountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="text-neutral-600 ml-1">{currency}</span>
          </h2>
          <div className={`text-lg font-bold tracking-tight ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(dailyChangePercent).toFixed(2)}%
          </div>
        </div>
      </section>

      {/* Minimal Time Ranges */}
      <section className="flex justify-between py-6 border-b border-white/5">
        {TIME_RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRange(r)}
            className={`text-[10px] font-black tracking-widest transition-all px-2 py-1 rounded-md ${
              selectedRange === r ? 'text-white' : 'text-neutral-700'
            }`}
          >
            {r}
          </button>
        ))}
      </section>

      {/* Integrated Chart */}
      <section className="h-56 w-full my-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mainChartData}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.15}/>
                <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="close" 
              stroke={isPositive ? '#10b981' : '#ef4444'} 
              strokeWidth={2} 
              fill="url(#chartGradient)"
              dot={false}
              isAnimationActive={true}
            />
            <YAxis hide domain={['auto', 'auto']} />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* Asset List */}
      <section className="space-y-8">
        <div className="flex items-center justify-between opacity-40">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Investments</h3>
           <ChevronDown size={14} />
        </div>
        
        {holdingStocks.map((stock) => {
          const holding = holdings.find(h => h.symbol === stock.symbol);
          const totalVal = (holding?.shares || 0) * stock.regularMarketPrice;
          const isStkPos = stock.regularMarketChange >= 0;
          
          return (
            <div 
              key={stock.symbol}
              onClick={() => navigate(`/stock/${stock.symbol}`)}
              className="flex items-center justify-between group cursor-pointer py-1"
            >
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                  <img src={getLogoUrl(stock.symbol)} alt={stock.symbol} className="w-full h-full object-contain grayscale" />
                </div>
                <div>
                  <h4 className="text-white font-black text-lg leading-none mb-1">{stock.symbol}</h4>
                  <p className="text-neutral-600 text-[10px] font-bold uppercase tracking-widest">{holding?.shares} units</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-black text-lg leading-none mb-1 tabular-nums">
                  {totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className={`text-[10px] font-black tracking-widest ${isStkPos ? 'text-emerald-500' : 'text-red-500'}`}>
                  {isStkPos ? '+' : ''}{stock.regularMarketChangePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
        
        {holdingStocks.length === 0 && (
          <p className="text-neutral-800 text-center py-10 font-black uppercase text-[10px] tracking-widest">No Active Positions</p>
        )}
      </section>

      {/* Simplified Bottom Dock */}
      <div className="fixed bottom-10 left-8 right-8 flex gap-3 max-w-xl mx-auto z-50">
        <button 
          onClick={() => navigate('/search')}
          className="flex-1 h-14 bg-white text-black rounded-2xl flex items-center justify-between px-6 active:scale-95 transition-all shadow-xl"
        >
          <span className="font-black text-xs uppercase tracking-widest">Invest</span>
          <SearchIcon size={16} />
        </button>
        <button 
          className="w-14 h-14 bg-neutral-900 border border-white/5 rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-xl"
        >
          <ArrowRight size={18} className="text-white" />
        </button>
      </div>
    </div>
  );
}
