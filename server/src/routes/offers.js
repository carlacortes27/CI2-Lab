import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const offers = JSON.parse(
  readFileSync(join(__dirname, '../data/offers.json'), 'utf-8')
);

const router = Router();

function queryValues(value) {
  return (Array.isArray(value) ? value : [value])
    .filter(Boolean)
    .flatMap(item => String(item).split(','))
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);
}

function matchesAny(value, selected) {
  const values = queryValues(selected);
  if (values.length === 0) return true;
  return value ? values.includes(String(value).toLowerCase()) : false;
}

// GET /api/offers — devuelve todas las ofertas, con filtrado opcional
router.get('/', (req, res) => {
  const { degree, sector, location, modality, duration, type, skill, language } = req.query;
  let result = offers;

  if (degree) {
    const degrees = queryValues(degree);
    result = result.filter(o =>
      o.targetDegrees.some(d => degrees.includes(d.toLowerCase()))
    );
  }
  if (sector) {
    result = result.filter(o => matchesAny(o.sector, sector));
  }
  if (location) {
    result = result.filter(o => matchesAny(o.location, location));
  }
  if (modality) {
    result = result.filter(o => matchesAny(o.modality, modality));
  }
  if (duration) {
    result = result.filter(o => matchesAny(o.duration, duration));
  }
  if (type) {
    result = result.filter(o => matchesAny(o.type, type));
  }
  if (skill) {
    const skills = queryValues(skill);
    result = result.filter(o =>
      o.requirements.hardSkills.some(s => skills.includes(s.toLowerCase()))
    );
  }
  if (language) {
    const languages = queryValues(language);
    result = result.filter(o =>
      o.requirements.languages.some(l => languages.includes(l.name.toLowerCase()))
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
