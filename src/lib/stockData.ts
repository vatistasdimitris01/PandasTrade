export interface StockData {
  symbol: string;
  shortName: string;
  domain: string;
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

// Realistic initial data so the app looks good immediately
const INITIAL_STOCKS: StockData[] = [
  { symbol: 'AAPL', shortName: 'Apple Inc.', domain: 'apple.com', regularMarketPrice: 175.50, regularMarketChange: 2.50, regularMarketChangePercent: 1.44, regularMarketOpen: 173.00, regularMarketDayHigh: 176.00, regularMarketDayLow: 173.00, regularMarketVolume: 52000000 },
  { symbol: 'TSLA', shortName: 'Tesla, Inc.', domain: 'tesla.com', regularMarketPrice: 210.00, regularMarketChange: -5.20, regularMarketChangePercent: -2.41, regularMarketOpen: 215.20, regularMarketDayHigh: 218.00, regularMarketDayLow: 208.00, regularMarketVolume: 34000000 },
  { symbol: 'NVDA', shortName: 'NVIDIA Corp', domain: 'nvidia.com', regularMarketPrice: 460.10, regularMarketChange: 12.30, regularMarketChangePercent: 2.75, regularMarketOpen: 447.80, regularMarketDayHigh: 465.00, regularMarketDayLow: 445.00, regularMarketVolume: 42000000 },
  { symbol: 'MSFT', shortName: 'Microsoft', domain: 'microsoft.com', regularMarketPrice: 330.00, regularMarketChange: 1.50, regularMarketChangePercent: 0.45, regularMarketOpen: 328.50, regularMarketDayHigh: 332.00, regularMarketDayLow: 327.00, regularMarketVolume: 21000000 },
  { symbol: 'AMZN', shortName: 'Amazon', domain: 'amazon.com', regularMarketPrice: 135.00, regularMarketChange: -0.80, regularMarketChangePercent: -0.59, regularMarketOpen: 135.80, regularMarketDayHigh: 137.00, regularMarketDayLow: 134.00, regularMarketVolume: 38000000 },
  { symbol: 'GOOGL', shortName: 'Alphabet', domain: 'google.com', regularMarketPrice: 138.00, regularMarketChange: 0.50, regularMarketChangePercent: 0.36, regularMarketOpen: 137.50, regularMarketDayHigh: 139.00, regularMarketDayLow: 137.00, regularMarketVolume: 19000000 },
  { symbol: 'META', shortName: 'Meta Platforms', domain: 'meta.com', regularMarketPrice: 305.00, regularMarketChange: 4.20, regularMarketChangePercent: 1.40, regularMarketOpen: 300.80, regularMarketDayHigh: 308.00, regularMarketDayLow: 300.00, regularMarketVolume: 15000000 },
  { symbol: 'NFLX', shortName: 'Netflix', domain: 'netflix.com', regularMarketPrice: 440.00, regularMarketChange: -2.00, regularMarketChangePercent: -0.45, regularMarketOpen: 442.00, regularMarketDayHigh: 445.00, regularMarketDayLow: 438.00, regularMarketVolume: 5000000 },
  { symbol: 'AMD', shortName: 'AMD', domain: 'amd.com', regularMarketPrice: 105.00, regularMarketChange: 1.10, regularMarketChangePercent: 1.06, regularMarketOpen: 103.90, regularMarketDayHigh: 106.00, regularMarketDayLow: 103.00, regularMarketVolume: 45000000 },
  { symbol: 'DIS', shortName: 'Disney', domain: 'disney.com', regularMarketPrice: 85.00, regularMarketChange: -0.50, regularMarketChangePercent: -0.58, regularMarketOpen: 85.50, regularMarketDayHigh: 86.00, regularMarketDayLow: 84.50, regularMarketVolume: 12000000 },
];

let currentStocks = [...INITIAL_STOCKS];
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

const LOGO_DEV_PUBLIC_KEY = 'pk_ZctYVy-KQ7ic8GhFSprmsw';
export const getLogoUrl = (symbol: string) => {
  return `https://img.logo.dev/ticker/${symbol}?token=${LOGO_DEV_PUBLIC_KEY}`;
};

// --- SIMULATION LOGIC ---

export const simulatePriceChange = () => {
  currentStocks = currentStocks.map(stock => {
    // Random walk
    const volatility = 0.0015; // 0.15% max move per tick
    const changePercent = (Math.random() - 0.5) * 2 * volatility;
    const changeAmount = stock.regularMarketPrice * changePercent;
    
    let newPrice = stock.regularMarketPrice + changeAmount;
    
    // Ensure price doesn't go below 0.01
    if (newPrice < 0.01) newPrice = 0.01;

    // Update daily stats
    const newHigh = Math.max(stock.regularMarketDayHigh, newPrice);
    const newLow = Math.min(stock.regularMarketDayLow, newPrice);
    
    // Recalculate change from Open
    const dailyChange = newPrice - stock.regularMarketOpen;
    const dailyChangePercent = (dailyChange / stock.regularMarketOpen) * 100;
    
    // Simulate volume ticking up
    const volumeTick = Math.floor(Math.random() * 5000);

    return {
      ...stock,
      regularMarketPrice: newPrice,
      regularMarketDayHigh: newHigh,
      regularMarketDayLow: newLow,
      regularMarketChange: dailyChange,
      regularMarketChangePercent: dailyChangePercent,
      regularMarketVolume: stock.regularMarketVolume + volumeTick
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

// --- CHART GENERATION ---
// Generates a consistent-looking chart history that ends at the current price
export const getChartData = (symbol: string, rangeLabel: string = '1D'): ChartDataPoint[] => {
  const stock = getStock(symbol);
  if (!stock) return [];

  let points = 50;
  let intervalMinutes = 30;
  
  switch (rangeLabel) {
    case '1D': points = 40; intervalMinutes = 10; break;
    case '1W': points = 60; intervalMinutes = 60; break;
    case '1M': points = 30; intervalMinutes = 24 * 60; break;
    case '3M': points = 90; intervalMinutes = 24 * 60; break;
    case 'YTD': points = 100; intervalMinutes = 24 * 60 * 2; break;
    case '1Y': points = 100; intervalMinutes = 24 * 60 * 3; break;
    case 'ALL': points = 100; intervalMinutes = 24 * 60 * 10; break;
  }

  const data: ChartDataPoint[] = [];
  let currentPrice = stock.regularMarketPrice;
  const now = new Date();

  // Walk backwards from current price
  for (let i = 0; i < points; i++) {
    data.unshift({
      date: new Date(now.getTime() - i * intervalMinutes * 60 * 1000).toISOString(),
      close: currentPrice
    });
    
    // Reverse random walk to generate history
    const volatility = 0.01; // 1% volatility for history generation
    const change = 1 + (Math.random() - 0.5) * volatility;
    currentPrice = currentPrice / change; 
  }

  return data;
};