import axios from 'axios';
import { getBearerToken } from './authService';

const EVAL_BASE = 'http://20.207.122.201/evaluation-service';

export interface Notification {
  ID: string;
  Type: 'Placement' | 'Event' | 'Result';
  Message: string;
  Timestamp: string;
}

/**
 * Fetches all notifications from the evaluation service.
 * Uses a Bearer token — re-fetches if expired.
 */
export async function fetchNotifications(): Promise<Notification[]> {
  const token = await getBearerToken();
  const res = await axios.get(`${EVAL_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.notifications as Notification[];
}
