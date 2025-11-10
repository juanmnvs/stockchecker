'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './routes/api.js';

const app = express();

// ✅ Security setup
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"]
    }
  }
}));

app.use(cors({ origin: '*' }));
app.use('/public', express.static(process.cwd() + '/public'));

// ✅ Serve front-end
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// ✅ API routes
apiRoutes(app);

// ✅ 404 handling
app.use((req, res) => {
  res.status(404).type('text').send('Not Found');
});

// ✅ Start server only if NOT testing
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// ✅ Export app for testing
export default app;
