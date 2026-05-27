import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const events = JSON.parse(
  readFileSync(join(__dirname, '../data/events.json'), 'utf-8')
);

const router = Router();

// GET /api/events - devuelve todos los eventos, ordenados por fecha.
router.get('/', (req, res) => {
  const result = [...events].sort((a, b) => {
    const dateA = `${a.date}T${a.startTime || '00:00'}`;
    const dateB = `${b.date}T${b.startTime || '00:00'}`;
    return new Date(dateA) - new Date(dateB);
  });

  res.json(result);
});

// GET /api/events/:id - devuelve un evento por ID o 404.
router.get('/:id', (req, res, next) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) {
    const err = new Error('Evento no encontrado');
    err.status = 404;
    return next(err);
  }
  res.json(event);
});

export default router;
