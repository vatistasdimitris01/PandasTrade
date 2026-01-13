export default async function handler(req, res) {
  // Vercel extracts the dynamic path segment [symbol] into req.query
  const { symbol } = req.query;
  const interval = req.query.interval || 'd'; // d=daily, w=weekly, m=monthly
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  if (!symbol) {
    return res.status(400).json({ error: 'Missing symbol parameter' });
  }

  try {
    // Ensure symbol has .US if it looks like a US ticker (letters only, no dots)
    // Stooq requires .US for US stocks to distinguish from other markets
    const stooqSymbol = (symbol.match(/^[A-Z]+$/) && !symbol.includes('.')) 
      ? `${symbol}.US` 
      : symbol;

    // Stooq Historical Data CSV Endpoint
    // s = symbol
    // i = interval (d, w, m, q, y)
    // e = extension (csv)
    const url = `https://stooq.com/q/d/l/?s=${stooqSymbol}&i=${interval}&e=csv`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Upstream Stooq error: ${response.status}`);
    }
    
    let csv = await response.text();

    // Optional: Apply row limit if requested to save bandwidth
    if (limit && limit > 0) {
      const lines = csv.split('\n');
      // Header + limit rows
      // Filter empty lines to be safe
      const nonEmptyLines = lines.filter(l => l.trim().length > 0);
      if (nonEmptyLines.length > limit + 1) {
        csv = nonEmptyLines.slice(0, limit + 1).join('\n');
      }
    }
    
    // Set headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/csv');
    // Cache for 1 hour (3600s) as historical data doesn't change instantly
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    
    res.status(200).send(csv);

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch historical data', details: error.message });
  }
}