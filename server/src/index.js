import express from 'express';
import cors from 'cors';
import offersRouter from './routes/offers.js';
import eventsRouter from './routes/events.js';
import cvRouter from './routes/cv.js';
import { errorHandler } from './middleware/errorHandler.js';

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
app.use('/api/events', eventsRouter);
app.use('/api/cv', cvRouter);

// WS3 registrará su router aquí: app.use('/api/pdf', pdfRouter)
// WS5 registrará su router aquí para la generación de PDF

// Manejador de errores centralizado (debe ir al final)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor cvComillas en http://localhost:${PORT}`);
});
