import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { advanceApplication, createApplication, listApplicationsByUser, rejectApplication, saveApplication } from '../db/h2Client.js';
import { requireAuth } from './auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const offers = JSON.parse(
  readFileSync(join(__dirname, '../data/offers.json'), 'utf-8')
);

const router = Router();

function enrichApplication(application) {
  const offer = offers.find(item => item.id === application.offerId);
  return {
    ...application,
    offer: offer || null,
  };
}

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const applications = await listApplicationsByUser(req.user.id);
    res.json(applications.map(enrichApplication).filter(application => application.offer));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const offerId = req.body?.offerId;
    if (!offerId) {
      return res.status(400).json({ error: 'offerId es obligatorio' });
    }

    const offer = offers.find(item => item.id === offerId);
    if (!offer) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }

    const application = await createApplication({ userId: req.user.id, offerId });
    res.status(201).json(enrichApplication(application));
  } catch (err) {
    next(err);
  }
});

router.post('/saved', async (req, res, next) => {
  try {
    const offerId = req.body?.offerId;
    if (!offerId) {
      return res.status(400).json({ error: 'offerId es obligatorio' });
    }

    const offer = offers.find(item => item.id === offerId);
    if (!offer) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }

    const application = await saveApplication({ userId: req.user.id, offerId });
    res.status(201).json(enrichApplication(application));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/advance', async (req, res, next) => {
  try {
    const application = await advanceApplication({
      userId: req.user.id,
      applicationId: req.params.id,
    });

    if (!application) {
      return res.status(404).json({ error: 'Candidatura no encontrada' });
    }

    res.json(enrichApplication(application));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/reject', async (req, res, next) => {
  try {
    const application = await rejectApplication({
      userId: req.user.id,
      applicationId: req.params.id,
    });

    if (!application) {
      return res.status(404).json({ error: 'Candidatura no encontrada' });
    }

    res.json(enrichApplication(application));
  } catch (err) {
    next(err);
  }
});

export default router;
