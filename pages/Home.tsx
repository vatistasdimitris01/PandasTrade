import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useUserStore } from '../lib/store';
import { getStocks, simulatePriceChange, subscribeToPriceChanges, getLogoUrl, syncStocksWithConfig, fetchPricesFromAPI, getChartData } from '../lib/stockData';
import MiniChart from '../components/MiniChart';

export default function Home() {
  const navigate = useNavigate();
  const { name, balance, currency, holdings } = useUserStore();
  const [, setTick] = useState(0);

  useEffect(() => {
    syncStocksWithConfig();
    fetchPricesFromAPI(); // Initial real price fetch
    
    const unsubscribe = subscribeToPriceChanges(() => {
      setTick(t => t + 1);
    });
    
    const simInterval = setInterval(() => {
      simulatePriceChange();
    }, 5000); 

    const apiInterval = setInterval(() => {
      fetchPricesFromAPI();
    }, 60000); // Fetch real prices every 1 minute

    return () => {
      unsubscribe();
      clearInterval(simInterval);
      clearInterval(apiInterval);
    };
  }, []);

  const allStocks = getStocks();
  
  const portfolioValue = holdings.reduce((total, holding) => {
    const stock = allStocks.find(s => s.symbol === holding.symbol);
    return total + (stock ? stock.regularMarketPrice * holding.shares : 0);
  }, 0);

  const dailyChangeValue = holdings.reduce((total, holding) => {
    const stock = allStocks.find(s => s.symbol === holding.symbol);
    return total + (stock ? stock.regularMarketChange * holding.shares : 0);
  }, 0);

  const totalAccountValue = balance + portfolioValue;
  const isPortfolioPositive = dailyChangeValue >= 0;
  const dailyChangePercent = portfolioValue > 0 
    ? (dailyChangeValue / (portfolioValue - dailyChangeValue)) * 100 
    : 0;

  const holdingStocks = allStocks.filter(s => holdings.some(h => h.symbol === s.symbol));

  const handlePriceDoubleClick = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    navigate(`/stock/${symbol}/edit`);
  };

  return (
    <div className="pb-24 md:pb-20 max-w-7xl mx-auto min-h-screen flex flex-col">
      <div className="px-6 pt-8 pb-6 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur-md z-20 md:static md:bg-transparent md:pt-12 md:pb-8">
        <div>
          <p className="text-neutral-500 text-xs md:text-sm font-medium">Welcome back,</p>
          <h1 className="text-white text-xl font-bold">{name}</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center md:hidden">
           <img src={useUserStore.getState().avatar} className="w-full h-full rounded-full object-cover" alt="Profile" />
        </div>
      </div>

      <div className="flex-1 px-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-neutral-900 rounded-3xl p-6 shadow-lg border border-neutral-800 md:col-span-2 lg:col-span-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none md:group-hover:bg-white/10 transition-colors duration-500" />
            
            <p className="text-neutral-500 text-sm font-medium mb-1 relative z-10">Total Net Worth</p>
            <h2 className="text-white text-4xl font-bold tracking-tight mb-4 relative z-10">
              {totalAccountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{currency}
            </h2>
            
            <div className="flex items-center gap-2 relative z-10">
              <div className={`flex items-center px-3 py-1.5 rounded-full ${isPortfolioPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {isPortfolioPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span className="text-sm font-bold ml-1.5">
                  {isPortfolioPositive ? '+' : ''}{dailyChangeValue.toFixed(2)}{currency} ({dailyChangePercent.toFixed(2)}%)
                </span>
              </div>
              <span className="text-neutral-600 text-xs font-medium">Today's P&L</span>
            </div>
          </div>

          <div className="bg-neutral-900/50 rounded-3xl p-6 border border-neutral-800/50 flex flex-col justify-center">
            <span className="text-neutral-400 text-sm mb-2">Buying Power</span>
            <span className="text-white font-bold text-3xl">{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{currency}</span>
            <div className="mt-4 pt-4 border-t border-neutral-800 flex gap-2">
              <button 
                 onClick={() => navigate('/search')}
                 className="flex-1 bg-white text-black py-2.5 rounded-xl text-sm font-bold md:hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5 active:scale-95"
              >
                + Deposit
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-white text-lg font-bold">Your Holdings</h3>
            <span className="text-neutral-500 text-xs font-medium">{holdings.length} positions</span>
          </div>

          {holdingStocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {holdingStocks.map((stock) => {
                const holding = holdings.find(h => h.symbol === stock.symbol);
                const isPositive = stock.regularMarketChange >= 0;

                return (
                  <div 
                    key={stock.symbol}
                    onClick={() => navigate(`/stock/${stock.symbol}`)}
                    className="bg-neutral-900 md:hover:bg-neutral-800 transition-all duration-200 rounded-2xl p-5 cursor-pointer border border-neutral-800/50 md:hover:border-neutral-700 active:scale-[0.98] group"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-3 overflow-hidden flex-shrink-0 p-2">
                         <img 
                           src={getLogoUrl(stock.symbol)} 
                           alt={stock.symbol}
                           className="w-full h-full object-contain"
                         />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold text-base leading-none mb-1 md:group-hover:text-neutral-300 transition-colors">{stock.symbol}</h4>
                        <p className="text-neutral-500 text-xs truncate">{stock.shortName}</p>
                      </div>
                      <div 
                        className="text-right select-none"
                        onDoubleClick={(e) => handlePriceDoubleClick(e, stock.symbol)}
                      >
                         <p className="text-white font-bold text-base leading-none mb-1 transition-colors md:group-hover:text-emerald-400">
                           {stock.regularMarketPrice.toFixed(2)}{currency}
                         </p>
                         <p className={`text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                           {isPositive ? '+' : ''}{stock.regularMarketChangePercent.toFixed(2)}%
                         </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                       <span className="bg-neutral-800 text-neutral-400 px-2 py-1 rounded-md text-xs font-medium">
                         {holding?.shares} shares
                       </span>
                       <div className="h-8 w-24 opacity-60 md:group-hover:opacity-100 transition-opacity">
                          <MiniChart 
                            data={getChartData(stock.symbol)} 
                            isPositive={isPositive} 
                            width={96} 
                            height={32}
                          />
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-neutral-900/30 rounded-2xl p-12 text-center border border-dashed border-neutral-800">
              <p className="text-neutral-500">You don't own any stocks yet.</p>
              <button onClick={() => navigate('/search')} className="mt-4 text-emerald-500 font-bold md:hover:underline">Start Trading</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
