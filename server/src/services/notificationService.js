import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {
  listApplicationsByUser,
  listUsers,
  listNotificationsByUser,
  markAllNotificationsRead,
  markNotificationRead,
  upsertNotification,
} from '../db/h2Client.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');

function readData(name) {
  return JSON.parse(readFileSync(join(dataDir, name), 'utf-8'));
}

function loadOffers() {
  return readData('offers.json');
}

function loadEvents() {
  return readData('events.json');
}

function loadAppointments() {
  return readData('appointments.json');
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysUntil(dateText) {
  const target = new Date(`${dateText}T00:00:00`);
  return Math.ceil((target - startOfToday()) / (24 * 60 * 60 * 1000));
}

function hoursUntil(dateText, timeText) {
  const target = new Date(`${dateText}T${timeText || '00:00'}:00`);
  return (target - new Date()) / (60 * 60 * 1000);
}

function isSameUserAppointment(appointment, userId) {
  return !appointment.userId || appointment.userId === 'mock_user' || String(appointment.userId) === String(userId);
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function intersects(left = [], right = []) {
  const rightSet = new Set(right.map(normalize).filter(Boolean));
  return left.map(normalize).find(item => rightSet.has(item));
}

function offerCategories(offer) {
  return [
    offer?.sector,
    ...(offer?.requirements?.keywords || []),
    ...(offer?.requirements?.hardSkills || []),
  ].filter(Boolean);
}

function notificationMeta(notification) {
  const appointment = notification.entityType === 'guidance_session_online'
    ? loadAppointments().find(item => item.id === notification.entityId)
    : null;
  const styles = {
    OFFER_EXPIRING_SOON: 'warning',
    CAREER_GUIDANCE_APPOINTMENT_REMINDER: 'info',
    NEW_EVENT_RELEVANT_TO_USER: 'info',
    UPDATE_FROM_SAVED_COMPANY: 'neutral',
    APPLICATION_STATUS_CHANGE: notification.message.toLowerCase().includes('rechazada') ? 'danger' : 'success',
  };
  const autoDismissMs = {
    NEW_EVENT_RELEVANT_TO_USER: 8000,
    UPDATE_FROM_SAVED_COMPANY: 6000,
  };
  const labels = {
    OFFER_EXPIRING_SOON: 'Apply now',
    CAREER_GUIDANCE_APPOINTMENT_REMINDER: notification.entityType === 'guidance_session_online' ? 'Join session' : 'View details',
    NEW_EVENT_RELEVANT_TO_USER: 'View event',
    UPDATE_FROM_SAVED_COMPANY: 'View company',
    APPLICATION_STATUS_CHANGE: 'View application',
  };

  return {
    ...notification,
    style: styles[notification.type] || 'neutral',
    autoDismissMs: autoDismissMs[notification.type] || null,
    actionLabel: labels[notification.type] || 'View',
    actionUrl: appointment?.meetingLink || null,
  };
}

export async function syncNotificationsForUser(userId) {
  const [applications, offers, events, appointments] = [
    await listApplicationsByUser(userId),
    loadOffers(),
    loadEvents(),
    loadAppointments(),
  ];
  const offerById = new Map(offers.map(offer => [offer.id, offer]));
  const savedOrActiveApps = applications.filter(app => ['guardada', 'enviada', 'revision', 'entrevista'].includes(app.status));

  for (const application of savedOrActiveApps) {
    const offer = offerById.get(application.offerId);
    if (!offer?.deadlineAt) continue;
    const remainingDays = daysUntil(offer.deadlineAt);
    if (remainingDays < 0 || remainingDays > 3) continue;

    await upsertNotification({
      userId,
      type: 'OFFER_EXPIRING_SOON',
      entityType: 'offer',
      entityId: offer.id,
      message: `The application period for ${offer.title} at ${offer.company} closes in ${remainingDays} day${remainingDays === 1 ? '' : 's'}.`,
      sourceKey: `${userId}:offer-expiring:${offer.id}`,
    });
  }

  for (const appointment of appointments.filter(item => isSameUserAppointment(item, userId))) {
    const remainingHours = hoursUntil(appointment.date, appointment.time);
    if (remainingHours < 0 || remainingHours > 24) continue;
    const modality = normalize(appointment.modality).includes('online') ? 'online' : 'in-person';
    await upsertNotification({
      userId,
      type: 'CAREER_GUIDANCE_APPOINTMENT_REMINDER',
      entityType: modality === 'online' ? 'guidance_session_online' : 'guidance_session',
      entityId: appointment.id,
      message: `You have a session with ${appointment.advisorName} tomorrow at ${appointment.time} - ${modality}.`,
      sourceKey: `${userId}:guidance-reminder:${appointment.id}`,
    });
  }

  const savedOffers = applications
    .filter(app => app.status === 'guardada')
    .map(app => offerById.get(app.offerId))
    .filter(Boolean);
  const savedCategories = savedOffers.flatMap(offerCategories);

  for (const event of events) {
    const category = intersects(event.tags || [], savedCategories);
    if (!category) continue;
    await upsertNotification({
      userId,
      type: 'NEW_EVENT_RELEVANT_TO_USER',
      entityType: 'event',
      entityId: event.id,
      message: `New event: ${event.title} on ${event.date}. It matches your interest in ${category}.`,
      expiresAt: new Date(Date.now() + 8 * 1000).toISOString(),
      sourceKey: `${userId}:event-match:${event.id}:${category}`,
    });
  }

  const savedCompanies = [...new Set(savedOffers.map(offer => offer.company).filter(Boolean))];
  for (const company of savedCompanies) {
    const newOffers = offers.filter(offer => offer.company === company && offer.publishedAt && daysUntil(offer.publishedAt) >= -30);
    if (newOffers.length === 0) continue;
    await upsertNotification({
      userId,
      type: 'UPDATE_FROM_SAVED_COMPANY',
      entityType: 'company',
      entityId: company,
      message: `${company} has posted ${newOffers.length} new offer${newOffers.length === 1 ? '' : 's'}`,
      expiresAt: new Date(Date.now() + 6 * 1000).toISOString(),
      sourceKey: `${userId}:saved-company:${company}:${newOffers.length}`,
    });
  }
}

export async function createApplicationStatusNotification({ userId, application, offer }) {
  if (!application || !offer) return null;
  return upsertNotification({
    userId,
    type: 'APPLICATION_STATUS_CHANGE',
    entityType: 'application',
    entityId: application.id,
    message: `Your application for ${offer.title} at ${offer.company} has been updated: ${application.status}.`,
    sourceKey: `${userId}:application-status:${application.id}:${application.status}:${application.updatedAt}`,
  });
}

export async function getUserNotifications(userId, limit = 10, { sync = false } = {}) {
  if (sync) {
    await syncNotificationsForUser(userId);
  }
  const notifications = await listNotificationsByUser(userId, limit);
  return notifications.map(notificationMeta);
}

export async function readNotification({ userId, notificationId }) {
  const notification = await markNotificationRead({ userId, notificationId });
  return notification ? notificationMeta(notification) : null;
}

export async function readAllNotifications(userId) {
  return markAllNotificationsRead(userId);
}

export function startNotificationScheduler(intervalMs = 60 * 1000) {
  async function runSweep() {
    try {
      const users = await listUsers();
      await Promise.all(users.map(user => syncNotificationsForUser(user.id)));
    } catch (err) {
      console.warn('No se pudieron sincronizar las notificaciones programadas:', err.message);
    }
  }

  const timer = setInterval(runSweep, intervalMs);
  timer.unref?.();
  return timer;
}
