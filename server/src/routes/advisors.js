import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadAdvisors() {
  return JSON.parse(readFileSync(join(__dirname, '../data/advisors.json'), 'utf-8'));
}

// Almacenamiento en memoria; arranca con los datos sintéticos
let appointments = JSON.parse(
  readFileSync(join(__dirname, '../data/appointments.json'), 'utf-8')
);

const router = Router();

// GET /api/advisors
router.get('/advisors', (_req, res) => {
  res.json(loadAdvisors());
});

// GET /api/advisors/:id
router.get('/advisors/:id', (req, res, next) => {
  const advisor = loadAdvisors().find(a => a.id === req.params.id);
  if (!advisor) {
    const err = new Error('Orientador no encontrado');
    err.status = 404;
    return next(err);
  }
  res.json(advisor);
});

// GET /api/appointments
router.get('/appointments', (_req, res) => {
  res.json(appointments);
});

// POST /api/appointments
router.post('/appointments', (req, res, next) => {
  const { advisorId, date, time, reason, modality, comments, meetingLink } = req.body;
  if (!advisorId || !date || !time || !reason || !modality) {
    const err = new Error('Faltan campos obligatorios');
    err.status = 400;
    return next(err);
  }
  const advisor = loadAdvisors().find(a => a.id === advisorId);
  if (!advisor) {
    const err = new Error('Orientador no encontrado');
    err.status = 400;
    return next(err);
  }
  const newAppointment = {
    id: `apt_${Date.now()}`,
    userId: 'mock_user',
    advisorId,
    advisorName: advisor.name,
    advisorRole: advisor.role,
    date,
    time,
    reason,
    modality,
    meetingLink: modality === 'Online' ? (meetingLink || `https://meet.comillas.edu/ope/${Date.now()}`) : null,
    status: 'Confirmada',
    notes: comments || '',
  };
  appointments = [newAppointment, ...appointments];
  res.status(201).json(newAppointment);
});

export default router;
