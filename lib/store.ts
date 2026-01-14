
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Holding {
  symbol: string;
  shares: number;
  avgCost: number;
}

export interface StockPriceConfig {
  symbol: string;
  price: number;
  min: number;
  max: number;
}

interface UserState {
  name: string;
  avatar: string;
  balance: number;
  currency: string;
  holdings: Holding[];
  stockPriceConfigs: Record<string, StockPriceConfig>;
  setName: (name: string) => void;
  setAvatar: (avatar: string) => void;
  setBalance: (balance: number) => void;
  setCurrency: (currency: string) => void;
  buyStock: (symbol: string, shares: number, price: number) => boolean;
  sellStock: (symbol: string, shares: number, price: number) => boolean;
  updateHoldingShares: (symbol: string, shares: number) => void;
  resetAccount: () => void;
  setStockPriceConfig: (symbol: string, config: StockPriceConfig) => void;
}

// Fixed missing export by completing the useUserStore implementation
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      name: 'Panda Trader',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
      balance: 10000,
      currency: '$',
      holdings: [],
      stockPriceConfigs: {},
      setName: (name) => set({ name }),
      setAvatar: (avatar) => set({ avatar }),
      setBalance: (balance) => set({ balance }),
      setCurrency: (currency) => set({ currency }),
      buyStock: (symbol, shares, price) => {
        const { balance, holdings } = get();
        const cost = shares * price;
        if (balance < cost) return false;

        const existingHolding = holdings.find((h) => h.symbol === symbol);
        let newHoldings;
        if (existingHolding) {
          const totalShares = existingHolding.shares + shares;
          const currentTotalCost = existingHolding.avgCost * existingHolding.shares;
          const newTotalCost = currentTotalCost + cost;
          newHoldings = holdings.map((h) =>
            h.symbol === symbol
              ? { ...h, shares: totalShares, avgCost: newTotalCost / totalShares }
              : h
          );
        } else {
          newHoldings = [...holdings, { symbol, shares, avgCost: price }];
        }

        set({ balance: balance - cost, holdings: newHoldings });
        return true;
      },
      sellStock: (symbol, shares, price) => {
        const { balance, holdings } = get();
        const existingHolding = holdings.find((h) => h.symbol === symbol);
        if (!existingHolding || existingHolding.shares < shares) return false;

        const proceeds = shares * price;
        const newHoldings = holdings
          .map((h) =>
            h.symbol === symbol ? { ...h, shares: h.shares - shares } : h
          )
          .filter((h) => h.shares > 0);

        set({ balance: balance + proceeds, holdings: newHoldings });
        return true;
      },
      updateHoldingShares: (symbol, shares) => {
        const { holdings } = get();
        if (shares <= 0) {
          set({ holdings: holdings.filter((h) => h.symbol !== symbol) });
        } else {
          set({
            holdings: holdings.map((h) =>
              h.symbol === symbol ? { ...h, shares } : h
            ),
          });
        }
      },
      resetAccount: () =>
        set({
          balance: 10000,
          holdings: [],
          stockPriceConfigs: {},
        }),
      setStockPriceConfig: (symbol, config) =>
        set((state) => ({
          stockPriceConfigs: {
            ...state.stockPriceConfigs,
            [symbol]: config,
          },
        })),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
