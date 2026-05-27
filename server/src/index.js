import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import offersRouter from './routes/offers.js';
import cvRouter from './routes/cv.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initDatabase } from './db/h2Client.js';

const app = express();
const PORT = 3001;

// Middleware base
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json({ limit: '5mb' }));

// Rutas
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/offers', offersRouter);
app.use('/api/cv', cvRouter);
app.use('/api/auth', authRouter);

// Manejador de errores centralizado (debe ir al final)
app.use(errorHandler);

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor cvComillas en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo inicializar H2:', err);
    process.exit(1);
  });
