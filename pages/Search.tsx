import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search as SearchIcon, TrendingUp, Sparkles } from 'lucide-react';
import { getAllStocks, getLogoUrl } from '../lib/stockData';
import { useUserStore } from '../lib/store';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { currency } = useUserStore();
  const stocks = getAllStocks();

  // Robust navigation handler
  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Sort stocks for "Popular" (simulated by volume or specific subset)
  const popularStocks = stocks.slice(0, 5);
  const suggestedStocks = stocks.slice(5, 10);

  const filteredStocks = stocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(query.toLowerCase()) ||
      s.shortName.toLowerCase().includes(query.toLowerCase())
  );

  const StockCard = ({ stock, compact = false }: { stock: any, compact?: boolean }) => (
    <div
      onClick={() => navigate(`/stock/${stock.symbol}`)}
      className={`bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex-shrink-0 cursor-pointer hover:bg-neutral-800 transition-colors ${compact ? 'w-40' : 'w-48'}`}
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
    <div className="min-h-screen bg-black flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col h-screen">
        <div className="px-6 pt-8 pb-4 lg:pt-12">
          <div className="flex items-center gap-4 mb-6 lg:mb-8">
            <button 
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-neutral-800 transition-colors md:hidden active:scale-90 transform duration-150"
            >
              <ChevronLeft className="text-white" size={24} />
            </button>
            <h1 className="text-white text-xl lg:text-3xl font-bold">Market</h1>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <SearchIcon className="text-neutral-500" size={20} />
            </div>
            <input
              type="text"
              placeholder="Search stocks (e.g. AAPL, Tesla)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-2xl pl-12 pr-4 py-4 lg:py-5 focus:outline-none focus:border-white/20 transition-colors placeholder-neutral-600 font-medium text-lg"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-20">
          
          {/* Carousels (Only show if no search query) */}
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
                  <h2 className="text-white font-bold text-lg">Suggested for You</h2>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">
                  {suggestedStocks.map(stock => (
                    <StockCard key={stock.symbol} stock={stock} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Search Results */}
          {query && (
            <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
              {filteredStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => navigate(`/stock/${stock.symbol}`)}
                  className="flex items-center justify-between p-4 bg-neutral-900/50 hover:bg-neutral-800 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-neutral-700 group"
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
                        <h3 className="text-white font-bold text-lg group-hover:text-neutral-300 transition-colors">{stock.symbol}</h3>
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
                   <p className="text-neutral-600">No stocks found matching "{query}"</p>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}