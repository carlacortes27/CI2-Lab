import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const offers = JSON.parse(
  readFileSync(join(__dirname, '../data/offers.json'), 'utf-8')
);

const router = Router();

// GET /api/offers — devuelve todas las ofertas, con filtrado opcional
router.get('/', (req, res) => {
  const { degree, sector, location, modality, type, skill, language } = req.query;
  let result = offers;

  if (degree) {
    result = result.filter(o =>
      o.targetDegrees.some(d => d.toLowerCase() === degree.toLowerCase())
    );
  }
  if (sector) {
    result = result.filter(o => o.sector.toLowerCase() === sector.toLowerCase());
  }
  if (location) {
    result = result.filter(o => o.location.toLowerCase() === location.toLowerCase());
  }
  if (modality) {
    result = result.filter(o => o.modality.toLowerCase() === modality.toLowerCase());
  }
  if (type) {
    result = result.filter(o => o.type.toLowerCase() === type.toLowerCase());
  }
  if (skill) {
    result = result.filter(o =>
      o.requirements.hardSkills.some(s => s.toLowerCase() === skill.toLowerCase())
    );
  }
  if (language) {
    result = result.filter(o =>
      o.requirements.languages.some(l => l.name.toLowerCase() === language.toLowerCase())
    );
  }

  res.json(result);
});

// GET /api/offers/:id — devuelve una oferta por ID o 404
router.get('/:id', (req, res, next) => {
  const offer = offers.find(o => o.id === req.params.id);
  if (!offer) {
    const err = new Error('Oferta no encontrada');
    err.status = 404;
    return next(err);
  }
  res.json(offer);
});

export default router;
