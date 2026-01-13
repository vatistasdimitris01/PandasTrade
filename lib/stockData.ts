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

// Fallback data in case API fails (CORS issues are common with Yahoo API in browser)
const FALLBACK_STOCKS: StockData[] = [
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

// In-memory store
let currentStocks = [...FALLBACK_STOCKS];
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

// --- LOGO LOGIC ---
const LOGO_DEV_PUBLIC_KEY = 'pk_ZctYVy-KQ7ic8GhFSprmsw';
export const getLogoUrl = (symbol: string) => {
  return `https://img.logo.dev/ticker/${symbol}?token=${LOGO_DEV_PUBLIC_KEY}`;
};

// --- REAL API FETCHING ---

// Fetch Quote (Snapshot)
export const fetchQuotes = async (symbols: string[] = []): Promise<void> => {
  if (symbols.length === 0) {
    symbols = currentStocks.map(s => s.symbol);
  }

  const symbolStr = symbols.join(',');
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolStr}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    const results = data.quoteResponse?.result;

    if (results && results.length > 0) {
      // Update in-memory stocks with real data
      results.forEach((apiStock: any) => {
        const index = currentStocks.findIndex(s => s.symbol === apiStock.symbol);
        
        const newStockData: StockData = {
          symbol: apiStock.symbol,
          shortName: apiStock.shortName || apiStock.longName || apiStock.symbol,
          domain: getDomainFromSymbol(apiStock.symbol),
          regularMarketPrice: apiStock.regularMarketPrice,
          regularMarketChange: apiStock.regularMarketChange,
          regularMarketChangePercent: apiStock.regularMarketChangePercent,
          regularMarketOpen: apiStock.regularMarketOpen,
          regularMarketDayHigh: apiStock.regularMarketDayHigh,
          regularMarketDayLow: apiStock.regularMarketDayLow,
          regularMarketVolume: apiStock.regularMarketVolume,
        };

        if (index > -1) {
          currentStocks[index] = newStockData;
        } else {
          currentStocks.push(newStockData);
        }
      });
      notifyListeners();
    }
  } catch (error) {
    console.warn("Failed to fetch real quotes (likely CORS). Using fallback/simulated data.", error);
    simulatePriceChange(); // Fallback to simulation
  }
};

// Fetch Historical Chart
export const fetchStockChart = async (symbol: string, rangeLabel: string): Promise<ChartDataPoint[]> => {
  // Map app labels to Yahoo API params
  let range = '1d';
  let interval = '5m';

  switch (rangeLabel) {
    case '1D': range = '1d'; interval = '5m'; break;
    case '1W': range = '5d'; interval = '15m'; break;
    case '1M': range = '1mo'; interval = '1d'; break;
    case '3M': range = '3mo'; interval = '1d'; break;
    case 'YTD': range = 'ytd'; interval = '1d'; break;
    case '1Y': range = '1y'; interval = '1wk'; break;
    case 'ALL': range = 'max'; interval = '1mo'; break;
    default: range = '1d'; interval = '5m'; break;
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Chart fetch failed');
    
    const json = await response.json();
    const result = json.chart?.result?.[0];

    if (!result) return generateFallbackChart(symbol, rangeLabel);

    const timestamps = result.timestamp;
    const quotes = result.indicators?.quote?.[0];

    if (!timestamps || !quotes || !quotes.close) return generateFallbackChart(symbol, rangeLabel);

    const data: ChartDataPoint[] = [];
    
    timestamps.forEach((ts: number, i: number) => {
      if (quotes.close[i] !== null && quotes.close[i] !== undefined) {
        data.push({
          date: new Date(ts * 1000).toLocaleString(), // Yahoo uses seconds
          close: quotes.close[i]
        });
      }
    });

    return data;

  } catch (error) {
    console.warn(`Failed to fetch chart for ${symbol}. Using fallback.`, error);
    return generateFallbackChart(symbol, rangeLabel);
  }
};

// Helper for fallback domains
function getDomainFromSymbol(symbol: string): string {
  const fallback = FALLBACK_STOCKS.find(s => s.symbol === symbol);
  return fallback ? fallback.domain : 'google.com';
}

// Fallback Simulation (Original Logic kept for reliability)
export const simulatePriceChange = () => {
  currentStocks = currentStocks.map(stock => {
    const volatility = stock.regularMarketPrice * 0.002; 
    const change = (Math.random() - 0.5) * volatility;
    const newPrice = Math.max(0.01, stock.regularMarketPrice + change);
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

// Fallback Chart Generator
const generateFallbackChart = (symbol: string, range: string): ChartDataPoint[] => {
  const stock = getStock(symbol) || FALLBACK_STOCKS[0];
  const points = range === '1D' ? 40 : 100;
  const data: ChartDataPoint[] = [];
  let price = stock.regularMarketPrice;

  for (let i = 0; i < points; i++) {
    data.unshift({
      date: i.toString(),
      close: price
    });
    price = price - (Math.random() - 0.5) * (price * 0.02);
  }
  return data;
};