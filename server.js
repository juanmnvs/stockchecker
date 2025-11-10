import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use('/api/stock-prices', apiRoutes);

// Escuchar puerto solo si no es test
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

export default app; // Exportar para tests
