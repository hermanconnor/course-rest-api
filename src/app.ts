import { Hono } from 'hono';
import { logger } from 'hono/logger';
import userRoutes from '@/routes/users';

const app = new Hono();

app.use('*', logger());

// ADD ROUTES
app.get('/', (c) => {
  return c.text('Service is up and running!');
});

app.route('/api', userRoutes);

export default app;
