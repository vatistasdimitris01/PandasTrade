import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Holding {
  symbol: string;
  shares: number;
  avgCost: number;
}

interface UserSettings {
  name: string;
  avatar: string;
  balance: number;
  currency: string;
  holdings: Holding[];
  setName: (name: string) => void;
  setAvatar: (url: string) => void;
  setBalance: (balance: number) => void;
  setCurrency: (currency: string) => void;
  setHoldings: (holdings: Holding[]) => void;
  updateHoldingShares: (symbol: string, newShares: number) => void;
  buyStock: (symbol: string, shares: number, pricePerShare: number) => boolean;
  sellStock: (symbol: string, shares: number, pricePerShare: number) => boolean;
  resetAccount: () => void;
}

export const useUserStore = create<UserSettings>()(
  persist(
    (set, get) => ({
      name: 'Dimitris',
      avatar: 'https://pbs.twimg.com/profile_images/1977295267805241344/vwSoKSwf_400x400.jpg',
      balance: 160,
      currency: '€',
      holdings: [
        { symbol: 'AAPL', shares: 2, avgCost: 175.50 },
        { symbol: 'TSLA', shares: 1, avgCost: 210.00 },
      ],
      setName: (name) => set({ name }),
      setAvatar: (avatar) => set({ avatar }),
      setBalance: (balance) => set({ balance }),
      setCurrency: (currency) => set({ currency }),
      setHoldings: (holdings) => set({ holdings }),
      
      updateHoldingShares: (symbol, newShares) => {
        const state = get();
        if (newShares <= 0) {
          set({ holdings: state.holdings.filter(h => h.symbol !== symbol) });
        } else {
          set({
            holdings: state.holdings.map(h => 
              h.symbol === symbol ? { ...h, shares: newShares } : h
            )
          });
        }
      },

      buyStock: (symbol, shares, pricePerShare) => {
        const state = get();
        const totalCost = shares * pricePerShare;

        if (totalCost > state.balance) {
          return false;
        }

        const existingHolding = state.holdings.find((h) => h.symbol === symbol);
        let newHoldings: Holding[];

        if (existingHolding) {
          const totalShares = existingHolding.shares + shares;
          // Calculate new weighted average cost
          const totalValue = (existingHolding.shares * existingHolding.avgCost) + totalCost;
          const newAvgCost = totalValue / totalShares;

          newHoldings = state.holdings.map((h) =>
            h.symbol === symbol
              ? { ...h, shares: totalShares, avgCost: newAvgCost }
              : h
          );
        } else {
          newHoldings = [
            ...state.holdings,
            { symbol, shares, avgCost: pricePerShare },
          ];
        }

        set({
          balance: state.balance - totalCost,
          holdings: newHoldings,
        });
        return true;
      },
      sellStock: (symbol, shares, pricePerShare) => {
        const state = get();
        const existingHolding = state.holdings.find((h) => h.symbol === symbol);

        if (!existingHolding || existingHolding.shares < shares) {
          return false;
        }

        const totalValue = shares * pricePerShare;
        const remainingShares = existingHolding.shares - shares;

        let newHoldings: Holding[];
        if (remainingShares === 0) {
          newHoldings = state.holdings.filter((h) => h.symbol !== symbol);
        } else {
          newHoldings = state.holdings.map((h) =>
            h.symbol === symbol ? { ...h, shares: remainingShares } : h
          );
        }

        set({
          balance: state.balance + totalValue,
          holdings: newHoldings,
        });
        return true;
      },
      resetAccount: () => set({
        name: 'Dimitris',
        avatar: 'https://pbs.twimg.com/profile_images/1977295267805241344/vwSoKSwf_400x400.jpg',
        balance: 160,
        currency: '€',
        holdings: [
          { symbol: 'AAPL', shares: 2, avgCost: 175.50 },
          { symbol: 'TSLA', shares: 1, avgCost: 210.00 },
        ]
      })
    }),
    {
      name: 'pandas-trade-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);