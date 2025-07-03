import { serve } from '@hono/node-server';
import app from './app';
import pinoLogger from '@/utils/logger';
import { env } from '@/config/env';

const server = serve(
  {
    fetch: app.fetch,
    port: env.PORT || 5000,
  },
  (info) => {
    pinoLogger.info(`Server is running on http://localhost:${info.port}`);
  },
);

// --- Graceful Shutdown Logic ---
const gracefulShutdown = async (signal: string) => {
  pinoLogger.info(
    `\nReceived signal: ${signal}. Initiating graceful shutdown...`,
  );

  server.close(async (err) => {
    if (err) {
      pinoLogger.error('Error closing HTTP server on SIGINT:', err);
      process.exit(1);
    }

    pinoLogger.info('HTTP server closed.');
    pinoLogger.info('Graceful shutdown complete. Exiting process.');
    process.exit(0);
  });

  setTimeout(() => {
    pinoLogger.error('Forcing shutdown after timeout!');
    process.exit(1);
  }, 10000).unref();
};

// --- Error Handling for Process ---
process.on('uncaughtException', (error: Error) => {
  pinoLogger.error('--- Uncaught Exception ---');
  pinoLogger.error('Error:', error.message);
  pinoLogger.error('Stack:', error.stack);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  pinoLogger.error('--- Unhandled Rejection ---');
  pinoLogger.error('Reason:', reason);
  pinoLogger.error('Promise:', promise);
  gracefulShutdown('unhandledRejection');
});

// --- Process Termination Signals ---
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));
