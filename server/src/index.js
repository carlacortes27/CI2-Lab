import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRouter from './routes/auth.js';
import offersRouter from './routes/offers.js';
import applicationsRouter from './routes/applications.js';
import eventsRouter from './routes/events.js';
import cvRouter from './routes/cv.js';
import advisorsRouter from './routes/advisors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initDatabase } from './db/postgresClient.js';

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(__dirname, '..', '..', '..', 'client', 'dist');

// Middleware base
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: '5mb' }));

// Rutas
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/offers', offersRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/cv', cvRouter);
app.use('/api/auth', authRouter);
app.use('/api', advisorsRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// WS3 registrará su router aquí: app.use('/api/pdf', pdfRouter)
// WS5 registrará su router aquí para la generación de PDF

// Manejador de errores centralizado (debe ir al final)
app.use(errorHandler);

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor cvComillas en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo inicializar la base de datos:', err);
    process.exit(1);
  });
