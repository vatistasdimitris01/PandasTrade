import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useUserStore } from '../lib/store';
import toast from 'react-hot-toast';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  currentPrice: number;
}

const TradeModal: React.FC<TradeModalProps> = ({ isOpen, onClose, symbol, currentPrice }) => {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = useState<string>('1');
  const { balance, currency, buyStock, sellStock, holdings } = useUserStore();

  useEffect(() => {
    if (isOpen) setShares('1');
  }, [isOpen]);

  if (!isOpen) return null;

  const numShares = parseFloat(shares) || 0;
  const totalCost = numShares * currentPrice;
  const currentHolding = holdings.find(h => h.symbol === symbol);
  const ownedShares = currentHolding?.shares || 0;

  const handleTrade = () => {
    if (numShares <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (mode === 'buy') {
      if (totalCost > balance) {
        toast.error('Insufficient funds');
        return;
      }
      const success = buyStock(symbol, numShares, currentPrice);
      if (success) {
        toast.success(`Bought ${numShares} ${symbol}`);
        onClose();
      } else {
        toast.error('Transaction failed');
      }
    } else {
      if (numShares > ownedShares) {
        toast.error('Insufficient shares');
        return;
      }
      const success = sellStock(symbol, numShares, currentPrice);
      if (success) {
        toast.success(`Sold ${numShares} ${symbol}`);
        onClose();
      } else {
        toast.error('Transaction failed');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="w-full max-w-md bg-neutral-900 rounded-t-3xl sm:rounded-2xl p-6 pointer-events-auto transform transition-transform duration-300 ease-out border border-neutral-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Trade {symbol}</h2>
            <p className="text-neutral-400 text-sm">Current Price: {currentPrice.toFixed(2)}{currency}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors"
          >
            <X size={20} className="text-neutral-400" />
          </button>
        </div>

        {/* Toggle */}
        <div className="flex bg-neutral-800 p-1 rounded-xl mb-6">
          <button
            onClick={() => setMode('buy')}
            className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
              mode === 'buy' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setMode('sell')}
            className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
              mode === 'sell' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sell
          </button>
        </div>

        <div className="mb-6">
          <label className="text-neutral-400 text-xs uppercase tracking-wider mb-2 block">Shares</label>
          <div className="relative">
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-neutral-600 transition-colors"
              placeholder="0"
              min="0"
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-neutral-500">
            <span>Available: {mode === 'sell' ? ownedShares : `${balance.toFixed(2)}${currency}`}</span>
          </div>
        </div>

        <div className="bg-neutral-800/50 rounded-xl p-4 mb-6 flex justify-between items-center">
          <span className="text-neutral-400">Total Estimated Cost</span>
          <span className="text-white font-bold text-xl">{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{currency}</span>
        </div>

        <button
          onClick={handleTrade}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-transform active:scale-[0.98] ${
            mode === 'buy' 
              ? 'bg-emerald-500 hover:bg-emerald-400 text-white' 
              : 'bg-emerald-500 hover:bg-emerald-400 text-white'
          }`}
        >
          {mode === 'buy' ? 'Confirm Purchase' : 'Confirm Sale'}
        </button>
      </div>
    </div>
  );
};

export default TradeModal;