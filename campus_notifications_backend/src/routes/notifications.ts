import { Router, Request, Response } from 'express';
import { fetchNotifications } from '../notificationService';

const router = Router();

/**
 * GET /api/v1/notifications
 * Returns all notifications. Optionally filter by ?type=Placement|Event|Result
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const all = await fetchNotifications();

    const { type } = req.query;
    const data = type
      ? all.filter((n) => n.Type.toLowerCase() === String(type).toLowerCase())
      : all;

    res.json({ notifications: data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notifications', detail: err.message });
  }
});

/**
 * GET /api/v1/notifications/:id
 * Returns a single notification by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const all = await fetchNotifications();
    const found = all.find((n) => n.ID === req.params.id);
    if (!found) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.json({ notification: found });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notification', detail: err.message });
  }
});

export default router;
