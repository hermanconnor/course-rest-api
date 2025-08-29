import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import userRoutes from '@/routes/users';
import courseRoutes from '@/routes/courses';
import { errorHandler } from './middleware/errorHandler';

const app = new Hono();

app.use('*', cors());
app.use('*', logger());

// ERROR HANDLER
app.onError(errorHandler);

// ADD ROUTES
app.get('/', (c) => {
  return c.text('Service is up and running!');
});

app.get('/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.route('/api', userRoutes);
app.route('/api', courseRoutes);

export default app;
