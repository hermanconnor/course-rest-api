import pino from 'pino';
import { env } from '@/config/env';

const pinoLogger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug', // Log 'debug' in dev, 'info' in prod
  transport: {
    target: 'pino-pretty', // For human-readable output in development
    options: {
      colorize: true,
    },
  },
  // Customize properties for structured logging
  base: {
    pid: process.pid,
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

export default pinoLogger;
