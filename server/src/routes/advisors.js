import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { addEvent, updateEventByAppointment } from './events.js';
import { requireAuth } from './auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONDAY_THURSDAY_SLOTS = ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const FRIDAY_SLOTS = ['11:00', '12:00', '13:00', '14:00'];

function loadAdvisors() {
  return JSON.parse(readFileSync(join(__dirname, '../data/advisors.json'), 'utf-8'));
}

function getSlotsForDate(date) {
  const day = new Date(`${date}T00:00:00`).getDay();
  if (day === 5) return FRIDAY_SLOTS;
  if (day >= 1 && day <= 4) return MONDAY_THURSDAY_SLOTS;
  return [];
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
router.get('/appointments', requireAuth, (req, res) => {
  res.json(appointments.filter(appointment => String(appointment.userId) === String(req.user.id)));
});

// POST /api/appointments
router.post('/appointments', requireAuth, (req, res, next) => {
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
  if (!getSlotsForDate(date).includes(time)) {
    const err = new Error('La franja seleccionada no esta disponible para esa fecha');
    err.status = 400;
    return next(err);
  }
  const isBooked = appointments.some(appointment =>
    appointment.advisorId === advisorId
    && appointment.date === date
    && appointment.time === time
    && appointment.status !== 'Cancelada'
  );
  if (isBooked) {
    const err = new Error('La franja seleccionada ya esta reservada');
    err.status = 409;
    return next(err);
  }

  const appointmentId = `apt_${Date.now()}`;
  const newAppointment = {
    id: appointmentId,
    userId: req.user.id,
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
  const appointmentEvent = addEvent({
    id: `evt_${appointmentId}`,
    title: `Cita de orientación: ${reason}`,
    organizer: advisor.name,
    company: 'Oficina de Prácticas y Empleo',
    date,
    startTime: time,
    endTime: null,
    location: modality === 'Presencial' ? 'Alberto Aguilera 32, Madrid' : modality,
    modality,
    description: `Cita confirmada con ${advisor.name} (${advisor.role}) para ${reason}.${comments ? ` Comentarios: ${comments}` : ''}`,
    tags: ['Orientación', reason],
    registrationStatus: 'Confirmada',
    appointmentId,
  });
  appointments = [newAppointment, ...appointments];
  res.status(201).json({ ...newAppointment, event: appointmentEvent });
});

// PATCH /api/appointments/:id/cancel
router.patch('/appointments/:id/cancel', requireAuth, (req, res, next) => {
  const appointment = appointments.find(item => item.id === req.params.id);
  if (!appointment || String(appointment.userId) !== String(req.user.id)) {
    const err = new Error('Cita no encontrada');
    err.status = 404;
    return next(err);
  }
  if (appointment.status === 'Cancelada') {
    return res.json({ ...appointment, event: updateEventByAppointment(appointment.id, { registrationStatus: 'Cancelada' }) });
  }

  appointment.status = 'Cancelada';
  const event = updateEventByAppointment(appointment.id, {
    registrationStatus: 'Cancelada',
    description: `${appointment.reason} cancelada por el usuario.`,
  });

  res.json({ ...appointment, event });
});

export default router;
