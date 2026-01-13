import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Download, AlertCircle, Loader2 } from 'lucide-react';

interface HistoricalDataRow {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
}

interface Props {
  symbol: string;
}

export default function HistoricalDataTable({ symbol }: Props) {
  const [data, setData] = useState<HistoricalDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interval, setInterval] = useState<'d' | 'w' | 'm'>('d');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch from our new internal API
        const response = await fetch(`/api/stooq/${symbol}?interval=${interval}`);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const csvText = await response.text();

        // Parse CSV
        const result = Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        });

        if (result.errors.length > 0 && (!result.data || result.data.length === 0)) {
           throw new Error("Failed to parse CSV data");
        }

        // Validate and cast data
        const rows = (result.data as any[]).map(row => ({
          Date: row.Date,
          Open: row.Open || 0,
          High: row.High || 0,
          Low: row.Low || 0,
          Close: row.Close || 0,
          Volume: row.Volume || 0,
        }));

        setData(rows);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol, interval]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
        <Loader2 className="animate-spin mb-2" size={24} />
        <p>Loading historical data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-500 bg-red-500/5 rounded-2xl border border-red-500/20">
        <AlertCircle className="mb-2" size={24} />
        <p>Unable to load data for {symbol}</p>
        <p className="text-xs opacity-70 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
          {(['d', 'w', 'm'] as const).map((int) => (
            <button
              key={int}
              onClick={() => setInterval(int)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                interval === int 
                  ? 'bg-neutral-800 text-white shadow-sm' 
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {int === 'd' ? 'Daily' : int === 'w' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
        <div className="text-xs text-neutral-500 hidden sm:block">
           Source: Stooq.com
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/30">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-neutral-400 uppercase bg-neutral-900 border-b border-neutral-800">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium text-right">Open</th>
              <th className="px-6 py-4 font-medium text-right">High</th>
              <th className="px-6 py-4 font-medium text-right">Low</th>
              <th className="px-6 py-4 font-medium text-right">Close</th>
              <th className="px-6 py-4 font-medium text-right">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {data.length > 0 ? (
              data.map((row, idx) => (
                <tr key={idx} className="hover:bg-neutral-800/50 transition-colors group">
                  <td className="px-6 py-3 font-medium text-white whitespace-nowrap">{row.Date}</td>
                  <td className="px-6 py-3 text-right text-neutral-300">{row.Open?.toFixed(2)}</td>
                  <td className="px-6 py-3 text-right text-neutral-300">{row.High?.toFixed(2)}</td>
                  <td className="px-6 py-3 text-right text-neutral-300">{row.Low?.toFixed(2)}</td>
                  <td className="px-6 py-3 text-right font-bold text-white">{row.Close?.toFixed(2)}</td>
                  <td className="px-6 py-3 text-right text-neutral-400 font-mono">
                    {row.Volume ? (row.Volume / 1000000).toFixed(2) + 'M' : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}