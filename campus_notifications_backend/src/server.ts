import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import notificationsRouter from './routes/notifications';
import sseRouter from './routes/sse';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'campus-notifications-backend' });
});

// REST API routes
app.use('/api/v1/notifications', notificationsRouter);

// SSE route for real-time push
app.use('/api/v1/sse/notifications', sseRouter);

app.listen(PORT, () => {
  console.log(`Campus Notifications Backend running on http://localhost:${PORT}`);
  console.log('Routes:');
  console.log('  GET /health');
  console.log('  GET /api/v1/notifications         - All notifications');
  console.log('  GET /api/v1/notifications?type=Placement|Event|Result');
  console.log('  GET /api/v1/notifications/:id     - Single notification');
  console.log('  GET /api/v1/sse/notifications     - Real-time SSE stream');
});

export default app;
