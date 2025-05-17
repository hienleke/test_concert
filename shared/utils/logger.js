"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const log4js_1 = __importDefault(require("log4js"));
log4js_1.default.configure({
    appenders: {
        console: { type: "console" },
        file: {
            type: "file",
            filename: "logs/app.log",
            maxLogSize: 10485760, // 10MB
            backups: 3,
        },
        errorFile: {
            type: "file",
            filename: "logs/error.log",
            maxLogSize: 10485760,
            backups: 3,
        },
        errors: {
            type: "logLevelFilter",
            level: "error",
            appender: "errorFile",
        },
    },
    categories: {
        default: {
            appenders: ["console", "file", "errors"],
            level: "info",
        },
    },
});
exports.logger = log4js_1.default.getLogger();
