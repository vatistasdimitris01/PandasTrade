import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, TrendingUp, TrendingDown, ChevronLeft } from 'lucide-react';
import { useUserStore } from '../lib/store';
import { getStocks, subscribeToPriceChanges, getLogoUrl, getChartData } from '../lib/stockData';
import MiniChart from '../components/MiniChart';

export default function Watchlist() {
  const navigate = useNavigate();
  const { watchlist, currency } = useUserStore();
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToPriceChanges(() => {
      setTick(t => t + 1);
    });
    return () => unsubscribe();
  }, []);

  const watchedStocks = getStocks(watchlist);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col pb-24 md:pb-0">
      <div className="px-6 pt-8 pb-6 sticky top-0 bg-black/80 backdrop-blur-md z-30 flex items-center gap-4">
        <button 
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center md:hidden active:scale-90"
        >
          <ChevronLeft className="text-white" size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Star className="text-yellow-500" size={24} fill="currentColor" />
          Watchlist
        </h1>
      </div>

      <div className="flex-1 px-6 space-y-4">
        {watchedStocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            {watchedStocks.map((stock) => {
              const isPositive = stock.regularMarketChange >= 0;

              return (
                <div 
                  key={stock.symbol}
                  onClick={() => navigate(`/stock/${stock.symbol}`)}
                  className="bg-neutral-900 md:hover:bg-neutral-800 transition-all duration-200 rounded-2xl p-5 cursor-pointer border border-neutral-800/50 md:hover:border-neutral-700 active:scale-[0.98] group flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 p-2">
                    <img 
                      src={getLogoUrl(stock.symbol)} 
                      alt={stock.symbol}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-base leading-none mb-1 md:group-hover:text-neutral-300 transition-colors">
                      {stock.symbol}
                    </h4>
                    <p className="text-neutral-500 text-xs truncate">{stock.shortName}</p>
                  </div>

                  <div className="h-10 w-20 flex-shrink-0 hidden sm:block">
                     <MiniChart 
                        data={getChartData(stock.symbol)} 
                        isPositive={isPositive} 
                        width={80} 
                        height={40}
                      />
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-base leading-none mb-1 group-hover:text-emerald-400 transition-colors">
                      {stock.regularMarketPrice.toFixed(2)}{currency}
                    </p>
                    <p className={`text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}{stock.regularMarketChangePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
              <Star className="text-neutral-700" size={32} />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Empty Watchlist</h2>
            <p className="text-neutral-500 max-w-xs mb-8">
              Keep track of stocks you're interested in by tapping the star icon.
            </p>
            <button 
              onClick={() => navigate('/search')}
              className="bg-white text-black font-bold px-8 py-3 rounded-xl active:scale-95 transition-transform"
            >
              Explore Markets
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
