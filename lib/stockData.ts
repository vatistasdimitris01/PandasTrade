import { create } from 'zustand';

export interface StockData {
  symbol: string;
  shortName: string;
  domain: string; // Used for logo fetching
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
}

export interface ChartDataPoint {
  date: string;
  close: number;
}

const BASE_STOCKS: StockData[] = [
  {
    symbol: 'AAPL',
    shortName: 'Apple Inc.',
    domain: 'apple.com',
    regularMarketPrice: 182.50,
    regularMarketChange: 2.35,
    regularMarketChangePercent: 1.30,
    regularMarketOpen: 180.00,
    regularMarketDayHigh: 183.00,
    regularMarketDayLow: 179.50,
    regularMarketVolume: 50000000,
  },
  {
    symbol: 'TSLA',
    shortName: 'Tesla, Inc.',
    domain: 'tesla.com',
    regularMarketPrice: 245.20,
    regularMarketChange: -5.40,
    regularMarketChangePercent: -2.15,
    regularMarketOpen: 250.00,
    regularMarketDayHigh: 252.00,
    regularMarketDayLow: 242.00,
    regularMarketVolume: 30000000,
  },
  {
    symbol: 'NVDA',
    shortName: 'NVIDIA Corp',
    domain: 'nvidia.com',
    regularMarketPrice: 460.15,
    regularMarketChange: 12.50,
    regularMarketChangePercent: 2.80,
    regularMarketOpen: 450.00,
    regularMarketDayHigh: 465.00,
    regularMarketDayLow: 448.00,
    regularMarketVolume: 45000000,
  },
  {
    symbol: 'MSFT',
    shortName: 'Microsoft',
    domain: 'microsoft.com',
    regularMarketPrice: 335.50,
    regularMarketChange: 1.10,
    regularMarketChangePercent: 0.33,
    regularMarketOpen: 334.00,
    regularMarketDayHigh: 338.00,
    regularMarketDayLow: 333.00,
    regularMarketVolume: 20000000,
  },
  {
    symbol: 'AMZN',
    shortName: 'Amazon',
    domain: 'amazon.com',
    regularMarketPrice: 135.20,
    regularMarketChange: -0.80,
    regularMarketChangePercent: -0.59,
    regularMarketOpen: 136.00,
    regularMarketDayHigh: 137.00,
    regularMarketDayLow: 134.50,
    regularMarketVolume: 35000000,
  },
  {
    symbol: 'GOOGL',
    shortName: 'Alphabet',
    domain: 'google.com',
    regularMarketPrice: 130.45,
    regularMarketChange: 0.95,
    regularMarketChangePercent: 0.73,
    regularMarketOpen: 129.50,
    regularMarketDayHigh: 131.00,
    regularMarketDayLow: 129.00,
    regularMarketVolume: 22000000,
  },
  {
    symbol: 'META',
    shortName: 'Meta Platforms',
    domain: 'meta.com',
    regularMarketPrice: 310.50,
    regularMarketChange: 4.20,
    regularMarketChangePercent: 1.37,
    regularMarketOpen: 306.00,
    regularMarketDayHigh: 312.00,
    regularMarketDayLow: 305.00,
    regularMarketVolume: 18000000,
  },
  {
    symbol: 'NFLX',
    shortName: 'Netflix',
    domain: 'netflix.com',
    regularMarketPrice: 445.00,
    regularMarketChange: -2.50,
    regularMarketChangePercent: -0.56,
    regularMarketOpen: 448.00,
    regularMarketDayHigh: 450.00,
    regularMarketDayLow: 440.00,
    regularMarketVolume: 5000000,
  },
  {
    symbol: 'AMD',
    shortName: 'AMD',
    domain: 'amd.com',
    regularMarketPrice: 105.25,
    regularMarketChange: 1.75,
    regularMarketChangePercent: 1.69,
    regularMarketOpen: 104.00,
    regularMarketDayHigh: 106.00,
    regularMarketDayLow: 103.50,
    regularMarketVolume: 40000000,
  },
  {
    symbol: 'DIS',
    shortName: 'Disney',
    domain: 'disney.com',
    regularMarketPrice: 85.50,
    regularMarketChange: -0.40,
    regularMarketChangePercent: -0.47,
    regularMarketOpen: 86.00,
    regularMarketDayHigh: 86.50,
    regularMarketDayLow: 85.00,
    regularMarketVolume: 12000000,
  },
];

// In-memory store for prices
let currentStocks = [...BASE_STOCKS];
const listeners: Array<() => void> = [];

export const subscribeToPriceChanges = (callback: () => void) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

const notifyListeners = () => {
  listeners.forEach(cb => cb());
};

// Simulate real-time updates every 5-10 seconds as requested
export const simulatePriceChange = () => {
  currentStocks = currentStocks.map(stock => {
    // Random volatility between -1% and +1%
    const volatility = stock.regularMarketPrice * 0.005; 
    const change = (Math.random() - 0.5) * volatility;
    
    const newPrice = Math.max(0.01, stock.regularMarketPrice + change);
    // Recalculate change based on original open
    const openPrice = stock.regularMarketOpen;
    const newChange = newPrice - openPrice;
    const changePercent = (newChange / openPrice) * 100;

    return {
      ...stock,
      regularMarketPrice: newPrice,
      regularMarketChange: newChange,
      regularMarketChangePercent: changePercent,
    };
  });
  
  notifyListeners();
};

export const getStocks = (symbols?: string[]) => {
  if (!symbols) return currentStocks;
  return currentStocks.filter(s => symbols.includes(s.symbol));
};

export const getStock = (symbol: string) => {
  return currentStocks.find(s => s.symbol === symbol);
};

export const getAllStocks = () => currentStocks;

const LOGO_DEV_PUBLIC_KEY = 'pk_ZctYVy-KQ7ic8GhFSprmsw';

// Helper to get logo URL from logo.dev
export const getLogoUrl = (symbol: string) => {
  return `https://img.logo.dev/ticker/${symbol}?token=${LOGO_DEV_PUBLIC_KEY}`;
};

export const STOCK_LOGOS: Record<string, string> = {}; 

// Mock Data Generation
export const getChartData = (symbol: string, range: string = '1D'): ChartDataPoint[] => {
  const stock = getStock(symbol);
  if (!stock) return [];

  const points = range === '1D' ? 40 : 100;
  const data: ChartDataPoint[] = [];
  let price = stock.regularMarketPrice;

  // Generate backwards
  for (let i = 0; i < points; i++) {
    data.unshift({
      date: i.toString(),
      close: price
    });
    // Random walk
    price = price - (Math.random() - 0.5) * (price * 0.02);
  }
  return data;
};