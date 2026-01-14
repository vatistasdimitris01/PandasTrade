
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, DollarSign, RefreshCw, Layers, Camera, Check } from 'lucide-react';
import { useUserStore } from '../lib/store';
import toast from 'react-hot-toast';

export default function Settings() {
  const navigate = useNavigate();
  const { name, setName, avatar, setAvatar, currency, setCurrency, resetAccount, balance, setBalance, holdings, updateHoldingShares } = useUserStore();
  const [localName, setLocalName] = useState(name);
  const [localAvatar, setLocalAvatar] = useState(avatar);
  const [localBalance, setLocalBalance] = useState(balance.toString());
  const balanceInputRef = useRef<HTMLInputElement>(null);

  // Synchronize local state with store when component mounts or store changes
  // But only if input is not focused to prevent overwriting user input while typing
  useEffect(() => {
    if (document.activeElement !== balanceInputRef.current) {
      setLocalBalance(balance.toString());
    }
  }, [balance]);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleSave = () => {
    setName(localName);
    setAvatar(localAvatar);
    const numBalance = parseFloat(localBalance);
    if (!isNaN(numBalance)) {
      setBalance(numBalance);
    }
    toast.success('Settings updated');
  };

  const handleReset = () => {
    if (confirm('This will permanently delete your portfolio history. Continue?')) {
      resetAccount();
      setLocalBalance("160");
      toast.success('Account reset successfully');
      navigate('/');
    }
  };

  // Fix: Made children optional to resolve "Property 'children' is missing in type '{ label: string; }'" TS error
  const InputGroup = ({ label, children }: { label: string, children?: React.ReactNode }) => (
    <div className="space-y-2">
      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="px-6 pt-8 pb-8 lg:pt-16 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-xl z-20 border-b border-neutral-900/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-neutral-800 transition-colors md:hidden active:scale-90 transform duration-150"
            >
              <ChevronLeft className="text-white" size={24} />
            </button>
            <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
          </div>
          <button 
            onClick={handleSave}
            className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/10 active:scale-95"
          >
            <Check size={16} />
            <span className="hidden sm:inline">Save Changes</span>
            <span className="sm:hidden">Save</span>
          </button>
        </div>

        <div className="px-6 py-8 space-y-12">
          
          <section>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
                 <User size={16} className="text-neutral-400" />
              </div>
              Public Profile
            </h2>
            
            <div className="bg-neutral-900/30 border border-neutral-800 rounded-3xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0 relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-800 ring-4 ring-neutral-900">
                    <img src={localAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white" />
                  </div>
                </div>
                
                <div className="flex-1 w-full space-y-6">
                  <InputGroup label="Display Name">
                    <input 
                      type="text" 
                      value={localName}
                      onChange={(e) => setLocalName(e.target.value)}
                      className="w-full bg-neutral-900 border-none rounded-xl px-4 py-3.5 text-white placeholder-neutral-600 focus:ring-2 focus:ring-neutral-700 transition-all text-sm font-medium"
                      placeholder="Enter your name"
                    />
                  </InputGroup>
                  <InputGroup label="Avatar Image URL">
                     <input 
                      type="text" 
                      value={localAvatar}
                      onChange={(e) => setLocalAvatar(e.target.value)}
                      className="w-full bg-neutral-900 border-none rounded-xl px-4 py-3.5 text-white placeholder-neutral-600 focus:ring-2 focus:ring-neutral-700 transition-all text-sm font-medium"
                      placeholder="https://..."
                    />
                  </InputGroup>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
                 <DollarSign size={16} className="text-neutral-400" />
              </div>
              Account & Preferences
            </h2>
            
            <div className="bg-neutral-900/30 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-8">
              <InputGroup label="Preferred Currency">
                  <div className="flex flex-wrap gap-3">
                    {['$', '€', '£', '¥', '₹'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setCurrency(c)}
                        className={`w-12 h-12 rounded-xl text-lg font-bold transition-all duration-200 border-2 ${
                          currency === c 
                            ? 'bg-white text-black border-white scale-110 shadow-lg shadow-white/10' 
                            : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
              </InputGroup>

              <div className="h-px bg-neutral-800/50" />
              
              <InputGroup label="Manual Balance Override">
                 <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-lg pointer-events-none">{currency}</span>
                    <input 
                      ref={balanceInputRef}
                      type="number" 
                      value={localBalance}
                      onChange={(e) => setLocalBalance(e.target.value)}
                      className="w-full bg-neutral-900 border-none rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-neutral-600 focus:ring-2 focus:ring-neutral-700 transition-all text-lg font-bold font-mono"
                      inputMode="decimal"
                    />
                 </div>
                 <p className="text-xs text-neutral-500 mt-2 ml-1">
                   Manually adjusting your balance for simulation purposes.
                 </p>
              </InputGroup>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
                 <Layers size={16} className="text-neutral-400" />
              </div>
              Portfolio Allocations
            </h2>
            
             <div className="bg-neutral-900/30 border border-neutral-800 rounded-3xl overflow-hidden">
                {holdings.length > 0 ? (
                  <div className="divide-y divide-neutral-800/50">
                    {holdings.map((h, index) => (
                      <div key={h.symbol} className="flex items-center justify-between p-4 md:px-8 hover:bg-neutral-900/50 transition-colors">
                         <div className="flex items-center gap-4">
                            <span className="text-neutral-500 font-mono text-sm w-6">{(index + 1).toString().padStart(2, '0')}</span>
                            <div>
                              <p className="font-bold text-white">{h.symbol}</p>
                              <p className="text-xs text-neutral-500">Avg: {h.avgCost.toFixed(2)}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                           <input 
                              type="number"
                              value={h.shares}
                              onChange={(e) => updateHoldingShares(h.symbol, parseFloat(e.target.value))}
                              className="w-24 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-right text-white font-mono focus:outline-none focus:border-white/20 transition-colors"
                            />
                            <span className="text-sm text-neutral-500 w-12">shares</span>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-neutral-500">
                    No active positions found.
                  </div>
                )}
             </div>
          </section>

          <section className="pt-8">
            <div className="border border-red-500/20 bg-red-500/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h3 className="text-red-500 font-bold text-lg mb-1 flex items-center gap-2">
                  <RefreshCw size={18} />
                  Reset Account
                </h3>
                <p className="text-neutral-400 text-sm max-w-md">
                  This action cannot be undone. It will clear all your holdings and reset your balance to default.
                </p>
              </div>
              <button 
                onClick={handleReset}
                className="whitespace-nowrap px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-bold text-sm transition-all border border-red-500/20"
              >
                Reset Everything
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
