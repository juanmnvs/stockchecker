import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import stockRoutes from './routes/api.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Helmet con CSP para FCC Test 2
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  })
);

// Routes
app.use('/api/stock-prices', stockRoutes);

// Endpoint raíz
app.get('/', (req, res) => {
  res.send('Stock Price Checker API');
});

// Start server
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log('Listening on port ' + port));
}

export default app; // Necesario para tests FCC
