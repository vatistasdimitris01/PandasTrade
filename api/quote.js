export default async function handler(req, res) {
  const { symbols } = req.query;
  
  if (!symbols) {
    return res.status(400).json({ error: 'Missing symbols parameter' });
  }

  try {
    // Stooq endpoint
    // f=sd2t2ohlcv: Symbol, Date, Time, Open, High, Low, Close, Volume
    const url = `https://stooq.com/q/l/?s=${symbols}&f=sd2t2ohlcv&e=csv`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Upstream error: ${response.status}`);
    }
    
    const csv = await response.text();
    
    // Allow CORS for flexibility, though mainly used by same-origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
}