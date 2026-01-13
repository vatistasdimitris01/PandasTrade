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

// Initial Metadata for the dashboard. 
// Prices are initialized to 0. They will ONLY be populated by real API calls.
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

// In-memory store
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

// --- LOGO LOGIC ---
const LOGO_DEV_PUBLIC_KEY = 'pk_ZctYVy-KQ7ic8GhFSprmsw';
export const getLogoUrl = (symbol: string) => {
  return `https://img.logo.dev/ticker/${symbol}?token=${LOGO_DEV_PUBLIC_KEY}`;
};

// --- REAL API FETCHING ONLY ---

// Fetch Quote (Snapshot) 
// Strategy: Yahoo Finance JSON -> Fallback to Stooq CSV
export const fetchQuotes = async (symbols: string[] = []): Promise<void> => {
  if (symbols.length === 0) {
    symbols = currentStocks.map(s => s.symbol);
  }

  const symbolStr = symbols.join(',');

  // Attempt 1: Yahoo Finance
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolStr}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    const results = data.quoteResponse?.result;

    if (results && results.length > 0) {
      updateStocksFromYahoo(results);
      notifyListeners();
      return; // Success, exit
    }
  } catch (error) {
    console.warn("Yahoo Quote API failed/blocked. Trying Stooq...", error);
  }

  // Attempt 2: Stooq CSV (No CORS usually, real data)
  try {
    // Stooq often works better with explicit .US for US stocks
    const stooqSymbols = symbols.map(s => {
        // Simple check if it likely needs .US (heuristic)
        return (s.match(/^[A-Z]+$/)) ? `${s}.US` : s;
    }).join(',');

    // f=sd2t2ohlcv : Symbol, Date, Time, Open, High, Low, Close, Volume
    const url = `https://stooq.com/q/l/?s=${stooqSymbols}&f=sd2t2ohlcv&e=csv`;
    const response = await fetch(url);
    const csvText = await response.text();
    
    // Parse CSV
    const parsed = Papa.parse(csvText, {
      header: false, // Stooq quote CSV usually has no header or unpredictable one
      skipEmptyLines: true,
      dynamicTyping: true
    });

    if (parsed.data && parsed.data.length > 0) {
       updateStocksFromStooq(parsed.data);
       notifyListeners();
    }
  } catch (error) {
    console.error("All quote APIs failed. Showing stale or empty data.", error);
    // DO NOT SIMULATE DATA.
  }
};

function updateStocksFromYahoo(results: any[]) {
    results.forEach((apiStock: any) => {
        const index = currentStocks.findIndex(s => s.symbol === apiStock.symbol);
        
        const newStockData: StockData = {
          symbol: apiStock.symbol,
          shortName: apiStock.shortName || apiStock.longName || apiStock.symbol,
          domain: getDomainFromSymbol(apiStock.symbol),
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
    // Stooq Row Format (approx based on f=sd2t2ohlcv):
    // [Symbol, Date, Time, Open, High, Low, Close, Volume]
    
    rows.forEach((row: any) => {
        if (!Array.isArray(row) || row.length < 7) return;

        let symbol = row[0] as string;
        // Clean symbol (remove .US if present for matching)
        const rawSymbol = symbol ? symbol.replace('.US', '') : '';
        if (!rawSymbol) return;
        
        const price = typeof row[6] === 'number' ? row[6] : 0;
        const open = typeof row[3] === 'number' ? row[3] : 0;
        const high = typeof row[4] === 'number' ? row[4] : 0;
        const low = typeof row[5] === 'number' ? row[5] : 0;
        const volume = typeof row[7] === 'number' ? row[7] : 0;

        // Calculate change (Stooq snapshot doesn't always provide change, we calculate from Open)
        const change = price - open;
        const changePercent = open !== 0 ? (change / open) * 100 : 0;

        const index = currentStocks.findIndex(s => s.symbol === rawSymbol || s.symbol === symbol);

        const newStockData: StockData = {
            symbol: rawSymbol,
            shortName: index > -1 ? currentStocks[index].shortName : rawSymbol, // Keep existing name or fallback
            domain: index > -1 ? currentStocks[index].domain : 'google.com',
            regularMarketPrice: price,
            regularMarketChange: change,
            