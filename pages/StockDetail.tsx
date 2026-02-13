import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, TrendingUp, TrendingDown, ArrowUpRight, Star } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useUserStore } from '../lib/store';
import { getStock, getChartData, subscribeToPriceChanges, getLogoUrl, syncStocksWithConfig } from '../lib/stockData';
import TradeModal from '../components/TradeModal';

const TIME_RANGES = ['1D', '1W', '1M', '3M', 'YTD', '1Y', 'ALL'];

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { currency, holdings, watchlist, toggleWatchlist } = useUserStore();
  const [range, setRange] = useState('1D');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    syncStocksWithConfig();
    const unsubscribe = subscribeToPriceChanges(() => {
      setTick(t => t + 1);
    });
    return () => unsubscribe();
  }, []);

  const stock = getStock(symbol || '');
  const holding = holdings.find(h => h.symbol === symbol);
  const isWatched = watchlist.includes(symbol || '');

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handlePriceDoubleClick = () => {
    if (stock) navigate(`/stock/${stock.symbol}/edit`);
  };

  if (!stock) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-black">
        <h2 className="text-white text-2xl font-bold mb-2">Stock Not Found</h2>
        <button onClick={handleBack} className="text-neutral-400 md:hover:text-white">Go Back</button>
      </div>
    );
  }

  const chartData = useMemo(() => getChartData(stock.symbol, range), [stock.symbol, range, stock.regularMarketPrice]);
  const isPositive = stock.regularMarketChange >= 0;
  const chartColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <div className="min-h-screen bg-black flex flex-col relative max-w-7xl mx-auto pb-32 md:pb-12">
      <div className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-30">
        <button 
          onClick={handleBack} 
          className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center md:hover:bg-neutral-800 transition-colors active:scale-90 transform duration-150"
        >
          <ChevronLeft className="text-white" size={24} />
        </button>
        <div className="flex flex-col items-center md:hidden">
          <span className="text-white font-bold text-lg">{stock.symbol}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => symbol && toggleWatchlist(symbol)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              isWatched ? 'bg-yellow-500/10 text-yellow-500' : 'bg-neutral-900 text-neutral-400'
            } md:hover:bg-neutral-800`}
          >
            <Star size={20} fill={isWatched ? 'currentColor' : 'none'} />
          </button>
          <button className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center md:hover:bg-neutral-800 transition-colors active:scale-90 transform duration-150">
            <Share2 className="text-neutral-400" size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 lg:grid lg:grid-cols-3 lg:gap-12 lg:pb-12">
        <div className="lg:col-span-2 flex flex-col">
           <div className="hidden md:flex items-center gap-6 mb-8 mt-8">
              <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center overflow-hidden p-3 shadow-lg">
                 <img src={getLogoUrl(stock.symbol)} alt={stock.symbol} className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-white tracking-tight">{stock.symbol}</h1>
                <p className="text-neutral-400 text-xl font-medium">{stock.shortName}</p>
              </div>
           </div>

           <div className="text-center mb-8 md:hidden mt-4">
            <div className="w-16 h-16 rounded-2xl bg-white mx-auto mb-4 flex items-center justify-center p-2">
              <img src={getLogoUrl(stock.symbol)} alt={stock.symbol} className="w-full h-full object-contain" />
            </div>
            <p className="text-neutral-400 text-sm font-medium mb-1">{stock.shortName}</p>
            <h1 
              className="text-white text-5xl font-bold mb-3 tracking-tight select-none md:hover:text-emerald-400 transition-colors"
              onDoubleClick={handlePriceDoubleClick}
            >
              {stock.regularMarketPrice.toFixed(2)}{currency}
            </h1>
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              {isPositive ? <TrendingUp size={16} className="text-emerald-500 mr-2" /> : <TrendingDown size={16} className="text-red-500 mr-2" />}
              <span className={`text-base font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{stock.regularMarketChange.toFixed(2)} ({stock.regularMarketChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="h-64 md:h-[400px] lg:h-[500px] w-full mb-8 relative group bg-neutral-900/20 rounded-3xl overflow-hidden border border-neutral-800/50">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none z-10" />
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ stroke: '#525252', strokeWidth: 1, strokeDasharray: '4 4' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value: number) => [value.toFixed(2), 'Price']}
                />
                <Area 
                  type="monotone" 
                  dataKey="close" 
                  stroke={chartColor} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  isAnimationActive={true}
                />
                <YAxis domain={['auto', 'auto']} hide />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mb-8 overflow-x-auto no-scrollbar">
            <div className="flex justify-between bg-neutral-900 rounded-xl p-1 lg:max-w-md lg:mx-auto min-w-max md:min-w-0">
              {TIME_RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    range === r 
                      ? 'bg-neutral-800 text-white shadow-sm' 
                      : 'text-neutral-500 md:hover:text-neutral-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 lg:sticky lg:top-24 h-fit space-y-6">
           
           <div className="hidden md:block bg-neutral-900 rounded-3xl p-8 border border-neutral-800">
              <span className="text-neutral-400 text-sm">Current Price</span>
              <h2 
                className="text-6xl font-bold text-white mb-4 mt-2 tracking-tight select-none md:hover:text-emerald-400 transition-colors cursor-help"
                onDoubleClick={handlePriceDoubleClick}
              >
                {stock.regularMarketPrice.toFixed(2)}{currency}
              </h2>
              <div className={`flex items-center ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp size={28} className="mr-3" /> : <TrendingDown size={28} className="mr-3" />}
                <span className="text-2xl font-bold">
                   {isPositive ? '+' : ''}{stock.regularMarketChange.toFixed(2)} ({stock.regularMarketChangePercent.toFixed(2)}%)
                </span>
              </div>
           </div>

           {holding && (
             <div className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
               <h3 className="text-white font-bold mb-6 flex items-center gap-2 relative z-10 text-sm uppercase tracking-widest opacity-60">
                 Your Position
               </h3>
               <div className="flex justify-between mb-4 pb-4 border-b border-neutral-800 relative z-10">
                  <div>
                     <p className="text-neutral-500 text-xs mb-1 uppercase tracking-wider">Shares</p>
                     <p className="text-white font-bold text-xl">{holding.shares}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-neutral-500 text-xs mb-1 uppercase tracking-wider">Avg Cost</p>
                     <p className="text-white font-bold text-xl">{holding.avgCost.toFixed(2)}{currency}</p>
                  </div>
               </div>
               <div className="flex justify-between items-end relative z-10">
                  <div>
                    <p className="text-neutral-500 text-xs mb-1 uppercase tracking-wider">Market Value</p>
                    <p className="text-white font-bold text-xl">{(holding.shares * stock.regularMarketPrice).toFixed(2)}{currency}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-neutral-500 text-xs mb-1 uppercase tracking-wider">Total Return</p>
                    <p className={`font-bold text-xl ${
                      (stock.regularMarketPrice - holding.avgCost) >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {((stock.regularMarketPrice - holding.avgCost) * holding.shares).toFixed(2)}{currency}
                    </p>
                  </div>
               </div>
             </div>
           )}

           <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800/50">
              <p className="text-neutral-500 text-xs mb-1 uppercase tracking-wider">Open</p>
              <p className="text-white font-bold text-lg">{stock.regularMarketOpen.toFixed(2)}</p>
            </div>
            <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800/50">
              <p className="text-neutral-500 text-xs mb-1 uppercase tracking-wider">High</p>
              <p className="text-white font-bold text-lg">{stock.regularMarketDayHigh.toFixed(2)}</p>
            </div>
            <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800/50">
              <p className="text-neutral-500 text-xs mb-1 uppercase tracking-wider">Low</p>
              <p className="text-white font-bold text-lg">{stock.regularMarketDayLow.toFixed(2)}</p>
            </div>
            <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800/50">
              <p className="text-neutral-500 text-xs mb-1 uppercase tracking-wider">Vol</p>
              <p className="text-white font-bold text-lg">{(stock.regularMarketVolume / 1000000).toFixed(1)}M</p>
            </div>
           </div>

           <button
             onClick={() => setIsTradeModalOpen(true)}
             className="hidden md:flex w-full bg-white text-black font-bold text-lg py-4 rounded-2xl md:hover:bg-neutral-200 transition-colors shadow-xl active:scale-[0.98] transform items-center justify-center gap-2"
           >
             <span>Trade {stock.symbol}</span>
             <ArrowUpRight size={20} />
           </button>
        </div>
      </div>

      <div className="fixed bottom-24 left-6 right-6 md:hidden z-20">
        <button
          onClick={() => setIsTradeModalOpen(true)}
          className="w-full bg-white text-black font-bold text-lg py-4 rounded-2xl active:scale-[0.98] transform shadow-2xl shadow-emerald-500/20"
        >
          Trade
        </button>
      </div>

      <TradeModal 
        isOpen={isTradeModalOpen} 
        onClose={() => setIsTradeModalOpen(false)}
        symbol={stock.symbol}
        currentPrice={stock.regularMarketPrice}
      />
    </div>
  );
}
