import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Base de datos simple en memoria para likes por IP
const likesDB = {};

// Función para obtener precio de la API de Yahoo Finance
async function getStockPrice(symbol) {
  const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`);
  const data = await response.json();

  // Ajusta esto según la API real
  if (!data[symbol.toLowerCase()]) throw new Error('Stock not found');

  return data[symbol.toLowerCase()].usd;
}

// Middleware para registrar IP
function getIP(req) {
  return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

router.get('/', async (req, res) => {
  try {
    const { stock, like } = req.query;

    if (!stock) return res.status(400).json({ error: 'Stock symbol required' });

    const symbols = Array.isArray(stock) ? stock : [stock];

    const results = await Promise.all(
      symbols.map(async (s) => {
        const price = await getStockPrice(s);
        const ip = getIP(req);
        const key = s.toUpperCase();

        // Inicializa likes
        if (!likesDB[key]) likesDB[key] = new Set();

        // Agregar like si viene true
        if (like === 'true') likesDB[key].add(ip);

        return {
          stockData: {
            stock: key,
            price,
            likes: likesDB[key].size,
          },
        };
      })
    );

    // Si son 2 stocks, calcular rel_likes
    if (results.length === 2) {
      const rel1 = results[0].stockData.likes - results[1].stockData.likes;
      const rel2 = -rel1;
      results[0].stockData.rel_likes = rel1;
      results[1].stockData.rel_likes = rel2;

      // Remove likes property, FCC expects only rel_likes
      delete results[0].stockData.likes;
      delete results[1].stockData.likes;
    }

    res.json(results.length === 1 ? results[0] : results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Stock not found' });
  }
});

export default router;
