export default async function handler(req, res) {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Missing symbol parameter' });
  }

  try {
    // Stooq historical data endpoint (Daily)
    const url = `https://stooq.com/q/d/l/?s=${symbol}&i=d&e=csv`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Upstream error: ${response.status}`);
    }
    
    const csv = await response.text();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
}