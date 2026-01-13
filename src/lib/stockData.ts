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

// --- REAL DATA FETCHING ---

export const fetchQuotes = async (symbols: string[] = []): Promise<void> => {
  if (symbols.length === 0) {
    symbols = currentStocks.map(s => s.symbol);
  }

  // 1. Try Yahoo Finance (JSON)
  try {
    const symbolStr = symbols.join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolStr}`;
    
    // Note: This relies on the browser/network allowing the request.
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const results = data.quoteResponse?.result;
      if (results && results.length > 0) {
        updateStocksFromYahoo(results);
        notifyListeners();
        return; // Success, stop here.
      }
    }
  } catch (error) {
    // Silent fail for Yahoo, try fallback
  }

  // 2. Fallback to Stooq (CSV)
  // Stooq is often more permissible with CORS for CSV data.
  try {
    const stooqSymbols = symbols.map(s => s.toUpperCase().endsWith('.US') ? s : `${s}.US`).join(',');
    // f=sd2t2ohlcv : Symbol, Date, Time, Open, High, Low, Close, Volume
    const url = `https://stooq.com/q/l/?s=${stooqSymbols}&f=sd2t2ohlcv&e=csv`;
    
    const response = await fetch(url);
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
    console.error("All data sources failed. Displaying 0 values.", error);
  }
};

function updateStocksFromYahoo(results: any[]) {
  results.forEach((apiStock: any) => {
    const index = currentStocks.findIndex(s => s.symbol === apiStock.symbol);
    const domain = getDomainFromSymbol(apiStock.symbol);
    
    const newStockData: StockData = {
      symbol: apiStock.symbol,
      shortName: apiStock.shortName || apiStock.longName || apiStock.symbol,
      domain: domain,
      regularMarketPrice: apiStock.regularMarketPrice || 0,
      regularMarketChange: apiStock.regularMarketChange || 0,
      regularMarketChangePercent: apiStock.regularMarketChangePercent || 0,
      regularMarketOpen: apiStock.regularMarketOpen || 0,
      regularMarketDayHigh: apiStock.regularMarketDayHigh || 0,
      regularMarketDayLow: apiStock.regularMarketDayLow || 0,
      regularMarketVolume: apiStock.regularMarketVolume || 0,
    };

    if (index > -1) {
      currentStocks[index] = newStockData;
    } else {
      currentStocks.push(newStockData);
    }
  });
}

function updateStocksFromStooq(rows: any[]) {
  // Stooq CSV row: [Symbol, Date, Time, Open, High, Low, Close, Volume]
  rows.forEach((row: any) => {
    if (!Array.isArray(row) || row.length < 7) return;

    // Clean symbol (remove .US)
    const rawSymbol = (row[0] as string || '').replace('.US', '');
    if (!rawSymbol) return;

    const close = typeof row[6] === 'number' ? row[6] : 0;
    const open = typeof row[3] === 'number' ? row[3] : 0;
    const high = typeof row[4] === 'number' ? row[4] : 0;
    const low = typeof row[5] === 'number' ? row[5] : 0;
    const volume = typeof row[7] === 'number' ? row[7] : 0;

    // Calculate change manually if needed (Stooq snapshot is basic)
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

// Chart Data - Real Data Only
export const fetchStockChart = async (symbol: string, rangeLabel: string): Promise<ChartDataPoint[]> => {
  // Try Stooq Historical CSV
  try {
    const stooqSymbol = symbol.toUpperCase().endsWith('.US') ? symbol : `${symbol}.US`;
    const url = `https://stooq.com/q/d/l/?s=${stooqSymbol}&i=d&e=csv`;
    
    const response = await fetch(url);
    const csvText = await response.text();
    
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });

    const rows = parsed.data as any[];

    // Filter and Map
    let data: ChartDataPoint[] = rows
      .filter((row: any) => row.Date && typeof row.Close === 'number')
      .map((row: any) => ({
        date: row.Date, // YYYY-MM-DD
        close: row.Close
      }))
      .reverse(); // Stooq gives Newest first, we need Oldest first for chart

    // Basic range slicing (approximate days)
    let daysToTake = 30;
    switch (rangeLabel) {
      case '1D': daysToTake = 5; break; // Stooq is daily, so 1D isn't really possible, showing 5 days context
      case '1W': daysToTake = 7; break;
      case '1M': daysToTake = 30; break;
      case '3M': daysToTake = 90; break;
      case 'YTD': daysToTake = 180; break;
      case '1Y': daysToTake = 365; break;
      case 'ALL': daysToTake = 9999; break;
    }
    
    return data.slice(-daysToTake);

  } catch (error) {
    console.error("Failed to fetch real chart data.", error);
    return []; // Return empty, NO FAKE DATA
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