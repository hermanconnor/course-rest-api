import { Hono } from 'hono';
import { logger } from 'hono/logger';

const app = new Hono();

app.use('*', logger());

// ADD ROUTES
app.get('/', (c) => {
  return c.text('Service is up and running!');
});

export default app;
