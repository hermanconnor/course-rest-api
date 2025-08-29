import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { ZodError } from 'zod';
import { env } from '@/config/env';
import AppError from '@/utils/AppError';
import pinoLogger from '@/utils/logger';

export const errorHandler = (err: Error, c: Context) => {
  // Log the full error internally for all environments.
  // In production, this log should be captured by a logging service (e.g., Sentry, Datadog)
  // for secure, internal monitoring.
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

  // Default error response for unexpected errors
  let statusCode = 500;
  let message = 'An unexpected server error occurred.';
  let errors = null;
  let stack = undefined;
  const isProduction = env.NODE_ENV === 'production';

  // Handle specific error types
  if (err instanceof ZodError) {
    statusCode = 400; // Bad Request
    message = 'Validation failed.';
    errors = err.flatten().fieldErrors;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Add more specific error handlers here (e.g., Drizzle, custom errors)

  // Conditionally add the stack trace for development environments only
  if (!isProduction) {
    stack = err.stack;
    if (!errors) {
      // In development, also show the error message for generic errors
      // if no specific validation errors are present.
      message = err.message;
    }
  }

  interface ResponseBody {
    success: boolean;
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors?: any;
    stack?: string;
  }

  // Build the final response object
  const responseBody: ResponseBody = {
    success: false,
    message: message,
  };

  if (errors) {
    responseBody.errors = errors;
  }

  if (stack) {
    responseBody.stack = stack;
  }

  // Return a consistent JSON response
  return c.json(responseBody, statusCode as ContentfulStatusCode);
};
