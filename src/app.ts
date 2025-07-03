import { Hono } from 'hono';
import { logger } from 'hono/logger';
import userRoutes from '@/routes/users';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { ZodError } from 'zod';
import AppError from './utils/AppError';
import pinoLogger from './utils/logger';
import { env } from './config/env';
import { isError } from './utils/isError';

// SQLite doesn't always give separate base codes for unique/foreign key.
// It often uses the generic SQLITE_CONSTRAINT (19) and puts specifics in the message.
// Drizzle might expose more granular details, but checking the message is reliable.
const SQLITE_CONSTRAINT = 19;

const app = new Hono();

app.use('*', logger());

// ADD ROUTES
app.get('/', (c) => {
  return c.text('Service is up and running!');
});

app.route('/api', userRoutes);

// ERROR HANDLER
app.onError((err, c) => {
  pinoLogger.error(
    {
      name: err.name,
      message: err.message,
      url: c.req.url,
      method: c.req.method,
      stack: err.stack,
    },
    'Unhandled error caught by global handler',
  );

  let statusCode = 500;
  let status: 'fail' | 'error' = 'error';
  let message = 'Something went wrong!';
  let errors: { [key: string]: string[] | undefined } | undefined = undefined;

  if (err instanceof ZodError) {
    statusCode = 400;
    status = 'fail';
    message = 'Validation failed';

    errors = err.flatten().fieldErrors;

    // Include form-level errors if present
    const formErrors = err.flatten().formErrors;
    if (formErrors.length > 0) {
      errors = {
        _general: formErrors,
        ...errors,
      };
    }
  } else if (err instanceof AppError && err.isOperational) {
    statusCode = err.statusCode || 500;
    status = err.status || 'error';
    message = err.message;
  } else if (isError(err)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sqliteError = err as any;

    // SQLite constraint violations (unique, not null, foreign key)
    if (sqliteError.code === SQLITE_CONSTRAINT) {
      if (
        sqliteError.message &&
        sqliteError.message.includes('UNIQUE constraint failed')
      ) {
        statusCode = 409;
        status = 'fail';
        message = 'A resource with this unique identifier already exists.';
      } else if (
        sqliteError.message &&
        sqliteError.message.includes('FOREIGN KEY constraint failed')
      ) {
        statusCode = 400;
        status = 'fail';
        message = 'Referenced resource does not exist or cannot be deleted.';
      } else if (
        sqliteError.message &&
        sqliteError.message.includes('NOT NULL constraint failed')
      ) {
        statusCode = 400;
        status = 'fail';
        message = 'A required field cannot be null.';
      } else {
        // Generic constraint error
        statusCode = 400;
        status = 'fail';
        message = 'A database constraint was violated.';
      }
    } else {
      statusCode = 500;
      status = 'error';
      message = 'An internal server error occurred.';
    }
  } else {
    statusCode = 500;
    status = 'error';
    message = 'An unknown error occurred.';
  }

  return c.json(
    {
      status,
      message,
      ...(errors && { errors: errors }),
      ...(env.NODE_ENV === 'development' && {
        stack: err instanceof Error ? err.stack : undefined,
      }),
    },
    statusCode as ContentfulStatusCode,
  );
});

export default app;
