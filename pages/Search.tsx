import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search as SearchIcon, TrendingUp, Sparkles } from 'lucide-react';
import { getAllStocks, getLogoUrl, StockData } from '../lib/stockData';
import { useUserStore } from '../lib/store';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { currency } = useUserStore();
  const stocks = getAllStocks();

  // Filter stocks based on search query
  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
    stock.shortName.toLowerCase().includes(query.toLowerCase())
  );

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const popularStocks = stocks.slice(0, 5);
  const suggestedStocks = stocks.slice(5, 10);

  // Fix: Explicitly typed StockCard as React.FC to handle 'key' prop in lists and used StockData type
  const StockCard: React.FC<{ stock: StockData, compact?: boolean }> = ({ stock, compact = false }) => (
    <div
      onClick={() => navigate(`/stock/${stock.symbol}`)}
      className={`bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex-shrink-0 cursor-pointer md:hover:bg-neutral-800 transition-colors active:scale-95 ${compact ? 'w-40' : 'w-48'}`}
    >
      <div className="w-10 h-10 rounded-full bg-white p-2 mb-3 flex items-center justify-center overflow-hidden">
        <img src={getLogoUrl(stock.symbol)} alt={stock.symbol} className="w-full h-full object-contain" />
      </div>
      <h3 className="text-white font-bold">{stock.symbol}</h3>
      <p className="text-neutral-500 text-xs truncate mb-2">{stock.shortName}</p>
      <p className="text-white font-medium text-sm">{stock.regularMarketPrice.toFixed(2)}{currency}</p>
      <p className={`text-xs ${stock.regularMarketChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
        {stock.regularMarketChangePercent.toFixed(2)}%
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col items-center pb-24">
      <div className="w-full max-w-5xl flex flex-col min-h-screen">
        <div className="px-6 pt-8 pb-4 lg:pt-12 sticky top-0 bg-black/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-4 mb-6 lg:mb-8">
            <button 
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center active:scale-90 transform duration-150"
            >
              <ChevronLeft className="text-white" size={24} />
            </button>
            <h1 className="text-white text-2xl lg:text-3xl font-bold">Market</h1>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <SearchIcon className="text-neutral-500" size={20} />
            </div>
            <input
              type="text"
              placeholder="Search symbols or names"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-2xl pl-12 pr-4 py-4 lg:py-5 focus:outline-none focus:border-white/20 transition-colors placeholder-neutral-600 font-medium text-lg"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {!query && (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} className="text-emerald-500" />
                  <h2 className="text-white font-bold text-lg">Popular Now</h2>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">
                  {popularStocks.map(stock => (
                    <StockCard key={stock.symbol} stock={stock} />
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={18} className="text-yellow-500" />
                  <h2 className="text-white font-bold text-lg">Recommended</h2>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">
                  {suggestedStocks.map(stock => (
                    <StockCard key={stock.symbol} stock={stock} />
                  ))}
                </div>
              </div>
            </>
          )}

          {query && (
            <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 pb-12">
              {filteredStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => navigate(`/stock/${stock.symbol}`)}
                  className="flex items-center justify-between p-4 bg-neutral-900/50 md:hover:bg-neutral-800 rounded-2xl cursor-pointer transition-colors border border-transparent md:hover:border-neutral-700 active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0 p-2">
                         <img 
                           src={getLogoUrl(stock.symbol)} 
                           alt={stock.symbol}
                           className="w-full h-full object-contain"
                         />
                     </div>
                     <div>
                        <h3 className="text-white font-bold text-lg md:group-hover:text-neutral-300 transition-colors">{stock.symbol}</h3>
                        <p className="text-neutral-500 text-sm">{stock.shortName}</p>
                     </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">{stock.regularMarketPrice.toFixed(2)}{currency}</p>
                    <p className={`text-xs font-bold ${stock.regularMarketChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {stock.regularMarketChange >= 0 ? '+' : ''}{stock.regularMarketChangePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
              
              {filteredStocks.length === 0 && (
                 <div className="text-center py-12 lg:col-span-2">
                   <p className="text-neutral-600">No stocks found for "{query}"</p>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
