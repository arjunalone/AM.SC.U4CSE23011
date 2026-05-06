import { Router, Request, Response } from 'express';
import { fetchNotifications } from '../notificationService';

const router = Router();

/**
 * GET /api/v1/sse/notifications
 * Server-Sent Events stream — pushes new notifications to the client in real-time.
 * Polls the evaluation API every 15 seconds and sends any new entries.
 */
router.get('/', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Keep track of IDs already sent so we only push new ones
  const sentIds = new Set<string>();

  const sendLatest = async () => {
    try {
      const all = await fetchNotifications();
      for (const n of all) {
        if (!sentIds.has(n.ID)) {
          sentIds.add(n.ID);
          res.write(`data: ${JSON.stringify(n)}\n\n`);
        }
      }
    } catch {
      res.write(`data: ${JSON.stringify({ error: 'fetch failed' })}\n\n`);
    }
  };

  // Send immediately on connect, then every 15 seconds
  await sendLatest();
  const interval = setInterval(sendLatest, 15000);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

export default router;
