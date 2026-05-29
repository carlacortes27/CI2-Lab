import { Router } from 'express';
import { requireAuth } from './auth.js';
import { getUserNotifications, readAllNotifications, readNotification } from '../services/notificationService.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 25);
    const notifications = await getUserNotifications(req.user.id, Math.max(limit, 100));
    const unreadCount = notifications.filter(notification => !notification.isRead).length;
    res.json({ notifications: notifications.slice(0, limit), unreadCount });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/read', async (req, res, next) => {
  try {
    const notification = await readNotification({
      userId: req.user.id,
      notificationId: req.params.id,
    });
    if (!notification) {
      return res.status(404).json({ error: 'NotificaciÃ³n no encontrada' });
    }
    res.json(notification);
  } catch (err) {
    next(err);
  }
});

router.post('/read-all', async (req, res, next) => {
  try {
    await readAllNotifications(req.user.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
