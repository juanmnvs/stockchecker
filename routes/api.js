// routes/api.js
import fetch from 'node-fetch';

export default function (app) {
  
  // Almacenar likes por IP para cada stock
  const likesDB = {};

  app.route('/api/stock-prices')
    .get(async (req, res) => {
      try {
        let { stock, like } = req.query;

        // Manejar múltiples stocks
        const stocks = Array.isArray(stock) ? stock : [stock];

        const results = [];

        for (let s of stocks) {
          s = s.toUpperCase();

          // Inicializar objeto de likes si no existe
          if (!likesDB[s]) likesDB[s] = new Set();

          // Registrar like por IP
          if (like && req.ip && !likesDB[s].has(req.ip)) {
            likesDB[s].add(req.ip);
          }

          // Obtener precio desde API externa (ejemplo: IEX Cloud o dummy)
          const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${s}/quote`);
          const data = await response.json();

          results.push({
            stock: s,
            price: Number(data.latestPrice),
            likes: likesDB[s].size
          });
        }

        // Si son 2 stocks, calcular rel_likes
        if (results.length === 2) {
          const [first, second] = results;
          first.rel_likes = first.likes - second.likes;
          second.rel_likes = second.likes - first.likes;
          delete first.likes;
          delete second.likes;
          return res.json({ stockData: results });
        }

        res.json({ stockData: results[0] });

      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
}
