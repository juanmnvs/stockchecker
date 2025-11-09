'use strict';
import fetch from 'node-fetch';

const stockDataStore = {}; // Almacena likes por stock
const ipStore = {}; // Almacena qué IP ha dado like a qué stock

export default function(app) {
  app.route('/api/stock-prices')
    .get(async (req, res) => {
      try {
        let { stock, like } = req.query;
        const ip = req.ip;

        // Normalizar stock a array para manejar 1 o 2 stocks
        let stocks = Array.isArray(stock) ? stock : [stock];

        let results = await Promise.all(stocks.map(async s => {
          s = s.toUpperCase();

          // Inicializar estructura si no existe
          if (!stockDataStore[s]) stockDataStore[s] = { likes: 0 };

          // Contar like si se solicita y no se ha contado desde esta IP
          if (like === 'true') {
            if (!ipStore[ip]) ipStore[ip] = new Set();
            if (!ipStore[ip].has(s)) {
              stockDataStore[s].likes++;
              ipStore[ip].add(s);
            }
          }

          // Obtener precio real de la acción
          const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${s}/quote`);
          const data = await response.json();

          return {
            stock: s,
            price: Number(data.latestPrice),
            likes: stockDataStore[s].likes
          };
        }));

        // Si hay 2 stocks, calcular rel_likes
        if (results.length === 2) {
          const rel1 = results[0].likes - results[1].likes;
          const rel2 = results[1].likes - results[0].likes;
          results[0].rel_likes = rel1;
          results[1].rel_likes = rel2;
          delete results[0].likes;
          delete results[1].likes;
        }

        res.json({ stockData: results.length === 1 ? results[0] : results });
      } catch (err) {
        res.status(500).json({ error: 'Error fetching stock data' });
      }
    });
}
