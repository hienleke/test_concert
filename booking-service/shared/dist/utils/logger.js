"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const log4js_1 = __importDefault(require("log4js"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Create logs directory if it doesn't exist
const logsDir = path_1.default.join(process.cwd(), 'logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
const logConfig = {
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
            filename: path_1.default.join(logsDir, 'app.log'),
            maxLogSize: 10485760, // 10MB
            backups: 3,
            compress: true,
        },
        errorFile: {
            type: 'file',
            filename: path_1.default.join(logsDir, 'error.log'),
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
log4js_1.default.configure(logConfig);
// Create and export the logger instance
const logger = log4js_1.default.getLogger();
exports.logger = logger;
// Handle uncaught exceptions
if (process.env.NODE_ENV !== 'test') {
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception:', error);
        process.exit(1);
    });
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
    });
}
//# sourceMappingURL=logger.js.map