import log4js from 'log4js';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logConfig: log4js.Configuration = {
  appenders: {
    console: { 
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%[%d{yyyy-MM-dd hh:mm:ss.SSS} [%p] %c - %m%n%]',
      },
    },
    file: {
      type: 'file',
      filename: path.join(logsDir, 'app.log'),
      maxLogSize: 10485760, // 10MB
      backups: 3,
      compress: true,
    },
    errorFile: {
      type: 'file',
      filename: path.join(logsDir, 'error.log'),
      maxLogSize: 10485760,
      backups: 3,
      compress: true,
    },
    errors: {
      type: 'logLevelFilter',
      level: 'error',
      appender: 'errorFile',
    },
  },
  categories: {
    default: {
      appenders: ['console', 'file', 'errors'],
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  },
};

// Configure log4js
log4js.configure(logConfig);

// Create and export the logger instance
const logger = log4js.getLogger();

// Handle uncaught exceptions
if (process.env.NODE_ENV !== 'test') {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

export { logger };
