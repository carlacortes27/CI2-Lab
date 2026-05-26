import express from 'express';
import cors from 'cors';
import offersRouter from './routes/offers.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = 3001;

// Middleware base
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Rutas
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/offers', offersRouter);

// WS3 registrará su router aquí: app.use('/api/pdf', pdfRouter)
// WS5 registrará su router aquí para la generación de PDF

// Manejador de errores centralizado (debe ir al final)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor cvComillas en http://localhost:${PORT}`);
});
