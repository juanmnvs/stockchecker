import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Simulación de "likes" por IP
const stockLikes = {};

async function getStockPrice(symbol) {
  const res = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`);
  if (!res.ok) throw new Error(`Error fetching ${symbol}`);
  const data = await res.json();
  return data.latestPrice;
}

router.get('/', async (req, res) => {
  try {
    let { stock, like } = req.query;

    if (!stock) return res.status(400).json({ error: 'No stock symbol provided' });

    // Permite recibir un solo stock o array de 2 stocks
    const stocks = Array.isArray(stock) ? stock : [stock];
    const results = [];

    for (let s of stocks) {
      const price = await getStockPrice(s.toUpperCase());

      if (!stockLikes[s]) stockLikes[s] = new Set();
      if (like === 'true' && !stockLikes[s].has(req.ip)) {
        stockLikes[s].add(req.ip);
      }

      results.push({
        stock: s.toUpperCase(),
        price,
        likes: stockLikes[s].size
      });
    }

    if (results.length === 1) {
      res.json({ stockData: results[0] });
    } else {
      // Calcular rel_likes si son 2 stocks
      const [a, b] = results;
      res.json({
        stockData: [
          { stock: a.stock, price: a.price, rel_likes: a.likes - b.likes },
          { stock: b.stock, price: b.price, rel_likes: b.likes - a.likes }
        ]
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
