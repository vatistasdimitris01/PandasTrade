import Papa from 'papaparse';

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

// Initial Metadata. Prices initialized to 0. 
// They will ONLY be populated by real API calls.
const INITIAL_STOCKS: StockData[] = [
  { symbol: 'AAPL', shortName: 'Apple Inc.', domain: 'apple.com', regularMarketPrice: 0, regularMarketChange: 0, regularMarketChangePercent: 0, regularMarketOpen: 0, regularMarketDayHigh: 0, regularMarketDayLow: 0, regularMarketVolume: 0 },
  { symbol: 'TSLA', shortName: 'Tesla, Inc.', domain: 'tesla.com', regularMarketPrice: 0, regularMarketChange: 0, regularMarketChangePercent: 0, regularMarketOpen: 0, regularMarketDayHigh: 0, regularMarketDayLow: 0, regularMarketVolume: 0 },
  { symbol: 'NVDA', shortName: 'NVIDIA Corp', domain: 'nvidia.com', regularMarketPrice: 0, regularMarketChange: 0, regularMarketChangePercent: 0, regularMarketOpen: 0, regularMarketDayHigh: 0, regularMarketDayLow: 0, regularMarketVolume: 0 },
  { symbol: 'MSFT', shortName: 'Microsoft', domain: 'microsoft.com', regularMarketPrice: 0, regularMarketChange: 0, regularMarketChangePercent: 0, regularMarketOpen: 0, regularMarketDayHigh: 0, regularMarketDayLow: 0, regularMarketVolume: 0 },
  { symbol: 'AMZN', shortName: 'Amazon', domain: 'amazon.com', regularMarketPrice: 0, regularMarketChange: 0, regularMarketChangePercent: 0, regularMarketOpen: 0, regularMarketDayHigh: 0, regularMarketDayLow: 0, regularMarketVolume: 0 },
  { symbol: 'GOOGL', shortName: 'Alphabet', domain: 'google.com', regularMarketPrice: 0, regularMarketChange: 0, regularMarketChangePercent: 0, regularMarketOpen: 0, regularMarketDayHigh: 0, regularMarketDayLow: 0, regularMarketVolume: 0 },
  { symbol: 'META', shortName: 'Meta Platforms', domain: 'meta.com', regularMarketPrice: 0, regularMarketChange: 0, regularMarketChangePercent: 0, regularMarketOpen: 0, regularMarketDayHigh: 0, regularMarketDayLow: 0, regularMarketVolume: 0 },
  { symbol: 'NFLX', shortName: 'Netflix', domain: 'netflix.com', regularMarketPrice: 0, regularMarketChange: 0, regularMarketChangePercent: 0, regularMarketOpen: 0, regularMarketDayHigh: 0, regularMarketDayLow: 0, regularMarketVolume: 0 },
  { symbol: 'AMD', shortName: 'AMD', domain: 'amd.com', regularMarketPrice: 0, regularMarketChange: 0, regularMarketChangePercent: 0, regularMarketOpen: 0, regularMarketDayHigh: 0, regularMarketDayLow: 0, regularMarketVolume: 0 },
  { symbol: 'DIS', shortName: 'Disney', domain: 'disney.com', regularMarketPrice: 0, regularMarketChange: 0, regularMarketChangePercent: 0, regularMarketOpen: 0, regularMarketDayHigh: 0, regularMarketDayLow: 0, regularMarketVolume: 0 },
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

// --- REAL DATA FETCHING VIA PROXY ---

export const fetchQuotes = async (symbols: string[] = []): Promise<void> => {
  if (symbols.length === 0) {
    symbols = currentStocks.map(s => s.symbol);
  }

  // Ensure .US suffix for Stooq US stocks if missing
  const stooqSymbols = symbols.map(s => {
    // Simple heuristic: if it's all letters and no dot, assume US.
    return (s.match(/^[A-Z]+$/) && !s.includes('.')) ? `${s}.US` : s;
  }).join(',');

  try {
    // Call internal API proxy to bypass CORS
    const response = await fetch(`/api/quote?symbols=${stooqSymbols}`);
    
    if (!response.ok) {
      // If running locally without 'vercel dev', this might 404
      throw new Error(`Proxy error: ${response.status}`);
    }
    
    const csvText = await response.text();
    
    const parsed = Papa.parse(csvText, {
      header: false,
      skipEmptyLines: true,
      dynamicTyping: true
    });

    if (parsed.data && parsed.data.length > 0) {
      updateStocksFromStooq(parsed.data);
      notifyListeners();
    }
  } catch (error) {
    console.error("Failed to fetch quotes via proxy.", error);
  }
};

function updateStocksFromStooq(rows: any[]) {
  // Stooq CSV row: [Symbol, Date, Time, Open, High, Low, Close, Volume]
  rows.forEach((row: any) => {
    if (!Array.isArray(row) || row.length < 7) return;

    // Clean symbol (remove .US) for internal matching
    const rawSymbol = (row[0] as string || '').replace('.US', '');
    if (!rawSymbol) return;

    // Parse values, defaulting to 0 if missing
    const close = typeof row[6] === 'number' ? row[6] : 0;
    const open = typeof row[3] === 'number' ? row[3] : 0;
    const high = typeof row[4] === 'number' ? row[4] : 0;
    const low = typeof row[5] === 'number' ? row[5] : 0;
    const volume = typeof row[7] === 'number' ? row[7] : 0;

    // Calculate change manually (Close - Open) as Stooq snapshot doesn't send "Change"
    const change = close - open;
    const changePercent = open !== 0 ? (change / open) * 100 : 0;

    const index = currentStocks.findIndex(s => s.symbol === rawSymbol);
    const domain = getDomainFromSymbol(rawSymbol);

    const newStockData: StockData = {
      symbol: rawSymbol,
      shortName: index > -1 ? currentStocks[index].shortName : rawSymbol,
      domain: domain,
      regularMarketPrice: close,
      regularMarketChange: change,
      regularMarketChangePercent: changePercent,
      regularMarketOpen: open,
      regularMarketDayHigh: high,
      regularMarketDayLow: low,
      regularMarketVolume: volume,
    };

    if (index > -1) {
      currentStocks[index] = newStockData;
    } else {
      currentStocks.push(newStockData);
    }
  });
}

// Chart Data - Real Data Only via Proxy
export const fetchStockChart = async (symbol: string, rangeLabel: string): Promise<ChartDataPoint[]> => {
  try {
    const stooqSymbol = symbol.toUpperCase().endsWith('.US') ? symbol : `${symbol}.US`;
    
    // Call internal API proxy
    const response = await fetch(`/api/chart?symbol=${stooqSymbol}`);
    
    if (!response.ok) {
       throw new Error(`Proxy error: ${response.status}`);
    }

    const csvText = await response.text();
    
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });

    const rows = parsed.data as any[];

    // Map to simple data points
    let data: ChartDataPoint[] = rows
      .filter((row: any) => row.Date && typeof row.Close === 'number')
      .map((row: any) => ({
        date: row.Date, // YYYY-MM-DD
        close: row.Close
      }))
      .reverse(); // Stooq gives newest first, we want oldest first for chart

    // Basic range slicing
    let daysToTake = 30;
    switch (rangeLabel) {
      case '1D': daysToTake = 5; break; // Stooq is daily only
      case '1W': daysToTake = 7; break;
      case '1M': daysToTake = 30; break;
      case '3M': daysToTake = 90; break;
      case 'YTD': daysToTake = 180; break;
      case '1Y': daysToTake = 365; break;
      case 'ALL': daysToTake = 9999; break;
      default: daysToTake = 30;
    }
    
    return data.slice(-daysToTake);

  } catch (error) {
    console.error("Failed to fetch real chart data via proxy.", error);
    return [];
  }
};

function getDomainFromSymbol(symbol: string): string {
  const stock = INITIAL_STOCKS.find(s => s.symbol === symbol);
  return stock ? stock.domain : 'google.com';
}

export const getStocks = (symbols?: string[]) => {
  if (!symbols) return currentStocks;
  return currentStocks.filter(s => symbols.includes(s.symbol));
};

export const getStock = (symbol: string) => {
  return currentStocks.find(s => s.symbol === symbol);
};

export const getAllStocks = () => currentStocks;