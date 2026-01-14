
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Trash2, ArrowRightLeft } from 'lucide-react';
import { useUserStore } from '../lib/store';
import { getStock, getLogoUrl, syncStocksWithConfig } from '../lib/stockData';
import toast from 'react-hot-toast';

export default function StockEdit() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { stockPriceConfigs, setStockPriceConfig, currency } = useUserStore();
  
  const stock = getStock(symbol || '');
  const existingConfig = stockPriceConfigs[symbol || ''];

  const [price, setPrice] = useState(existingConfig?.price?.toString() || stock?.regularMarketPrice?.toString() || '0');
  const [min, setMin] = useState(existingConfig?.min?.toString() || (parseFloat(price) * 0.8).toFixed(2));
  const [max, setMax] = useState(existingConfig?.max?.toString() || (parseFloat(price) * 1.2).toFixed(2));

  const handleBack = () => {
    navigate(-1);
  };

  const handleSave = () => {
    const p = parseFloat(price);
    const mn = parseFloat(min);
    const mx = parseFloat(max);

    if (isNaN(p) || isNaN(mn) || isNaN(mx)) {
      toast.error('Please enter valid numeric values');
      return;
    }

    if (mn > mx) {
      toast.error('Min price cannot be greater than Max price');
      return;
    }

    setStockPriceConfig(symbol!, {
      symbol: symbol!,
      price: p,
      min: mn,
      max: mx
    });

    syncStocksWithConfig();
    toast.success(`${symbol} simulation updated`);
    navigate(-1);
  };

  if (!stock) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <h1 className="text-white text-xl font-bold">Stock not found</h1>
        <button onClick={handleBack} className="mt-4 text-neutral-400">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center">
      <div className="w-full max-w-2xl px-6 py-8">
        <div className="flex items-center justify-between mb-12">
           <button 
             onClick={handleBack}
             className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-neutral-800 transition-colors"
           >
             <ChevronLeft className="text-white" size={24} />
           </button>
           <h1 className="text-white text-xl font-bold">Configure {symbol}</h1>
           <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 space-y-8">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-16 h-16 rounded-2xl bg-white p-3">
               <img src={getLogoUrl(stock.symbol)} alt={stock.symbol} className="w-full h-full object-contain" />
             </div>
             <div>
               <h2 className="text-white text-2xl font-bold">{stock.symbol}</h2>
               <p className="text-neutral-500 font-medium">{stock.shortName}</p>
             </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Current Override Price</label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-lg">{currency}</span>
                 <input 
                   type="number"
                   step="0.01"
                   value={price}
                   onChange={(e) => setPrice(e.target.value)}
                   className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-10 pr-4 py-4 text-white text-2xl font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                 />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Simulation Min</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">{currency}</span>
                    <input 
                      type="number"
                      step="0.01"
                      value={min}
                      onChange={(e) => setMin(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-10 pr-4 py-4 text-white font-bold focus:outline-none focus:border-red-500/50 transition-colors"
                    />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Simulation Max</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">{currency}</span>
                    <input 
                      type="number"
                      step="0.01"
                      value={max}
                      onChange={(e) => setMax(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-10 pr-4 py-4 text-white font-bold focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button 
               onClick={handleSave}
               className="flex-1 bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors active:scale-95"
             >
               <Save size={20} />
               Save Settings
             </button>
          </div>

          <div className="bg-neutral-800/30 rounded-2xl p-4 flex gap-4 items-start">
             <div className="mt-1">
                <ArrowRightLeft className="text-neutral-500" size={16} />
             </div>
             <p className="text-neutral-500 text-sm leading-relaxed">
               Setting a custom range will force the stock price to stay between the minimum and maximum values during the real-time simulation.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
