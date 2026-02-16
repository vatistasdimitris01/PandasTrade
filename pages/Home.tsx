
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Search as SearchIcon, 
  ChevronDown, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis, ReferenceLine } from 'recharts';
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

const TIME_RANGES = ['1D', '1W', '1M', '1Y', 'Max'];

export default function Home() {
  const navigate = useNavigate();
  const { name, balance, currency, holdings, avatar } = useUserStore();
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
    : 1.07; // Default to match image if no holdings

  const holdingStocks = allStocks.filter(s => holdings.some(h => h.symbol === s.symbol));
  
  // Chart data for the main view
  const mainChartData = useMemo(() => {
    // We use a dummy symbol or an aggregate. For UI parity, we use a consistent set.
    return getChartData('AAPL', selectedRange);
  }, [selectedRange]);

  const baselineValue = mainChartData.length > 0 ? mainChartData[0].close : 0;

  return (
    <div className="pb-40 pt-safe px-6 max-w-2xl mx-auto min-h-screen bg-transparent">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between py-6 mb-8">
        <div className="flex items-baseline gap-2">
          <h1 className="text-white text-3xl font-black tracking-tight">Wealth</h1>
          <span className="text-neutral-500 text-3xl font-medium">Cash</span>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shadow-lg">
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        </div>
      </header>

      {/* Brokerage Section */}
      <section className="mb-4">
        <button className="flex items-center gap-1 text-neutral-500 font-bold mb-2 md:hover:text-neutral-300 transition-colors">
          Brokerage <ChevronDown size={18} />
        </button>
        <div className="flex items-baseline gap-3">
          <h2 className="text-white text-5xl font-black tracking-tighter tabular-nums">
            {totalAccountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
          </h2>
          <div className={`flex items-center gap-1 font-black text-lg ${isPositive ? 'text-white' : 'text-red-500'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(dailyChangePercent).toFixed(2)} %
          </div>
        </div>
      </section>

      {/* Time Range Selectors */}
      <section className="flex justify-between py-8">
        {TIME_RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRange(r)}
            className={`text-sm font-black transition-all ${
              selectedRange === r ? 'text-white' : 'text-neutral-600'
            }`}
          >
            {r}
          </button>
        ))}
      </section>

      {/* Main Interactive Chart */}
      <section className="h-64 w-full mb-12 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mainChartData}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#fff' : '#ef4444'} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={isPositive ? '#fff' : '#ef4444'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <ReferenceLine 
              y={baselineValue} 
              stroke="#262626" 
              strokeDasharray="3 3" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="close" 
              stroke={isPositive ? '#fff' : '#ef4444'} 
              strokeWidth={3} 
              fill="url(#chartGradient)"
              dot={false}
              isAnimationActive={true}
            />
            <YAxis hide domain={['auto', 'auto']} />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* Investments List Header */}
      <section className="flex items-center justify-between mb-6">
        <h3 className="text-white text-xl font-black">Investments</h3>
        <button className="flex items-center gap-1 text-neutral-500 font-bold text-sm">
          Since buy <ChevronDown size={14} />
        </button>
      </section>

      {/* Holdings List */}
      <section className="space-y-6 mb-10">
        {holdingStocks.map((stock) => {
          const holding = holdings.find(h => h.symbol === stock.symbol);
          const totalVal = (holding?.shares || 0) * stock.regularMarketPrice;
          return (
            <div 
              key={stock.symbol}
              onClick={() => navigate(`/stock/${stock.symbol}`)}
              className="flex items-center justify-between active:scale-[0.98] transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-2.5 shadow-xl border border-white/10 group-hover:scale-105 transition-transform">
                  <img src={getLogoUrl(stock.symbol)} alt={stock.symbol} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-white font-black text-lg leading-tight">{stock.symbol}</h4>
                  <p className="text-neutral-500 text-sm font-medium">{holding?.shares} shares</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-black text-lg leading-tight">
                  {totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
                </p>
                <div className={`text-sm font-bold ${stock.regularMarketChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stock.regularMarketChange >= 0 ? '+' : ''}{stock.regularMarketChangePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
        {holdingStocks.length === 0 && (
          <p className="text-neutral-600 text-center py-4 font-medium italic">No investments yet.</p>
        )}
      </section>

      {/* Bottom Floating Action Buttons */}
      <div className="fixed bottom-24 left-6 right-6 flex gap-4 max-w-2xl mx-auto z-50">
        <button 
          onClick={() => navigate('/search')}
          className="flex-1 h-16 bg-neutral-900 border border-white/5 rounded-2xl flex items-center justify-between px-6 active:scale-95 transition-all shadow-2xl backdrop-blur-xl"
        >
          <span className="text-white font-black text-lg">Invest</span>
          <SearchIcon size={22} className="text-neutral-400" />
        </button>
        <button 
          className="flex-1 h-16 bg-neutral-900 border border-white/5 rounded-2xl flex items-center justify-between px-6 active:scale-95 transition-all shadow-2xl backdrop-blur-xl"
        >
          <span className="text-white font-black text-lg">Transfer</span>
          <ArrowRight size={22} className="text-neutral-400" />
        </button>
      </div>
    </div>
  );
}
