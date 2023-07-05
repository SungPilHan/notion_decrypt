"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupLogging = void 0;
const electron_log_1 = __importDefault(require("electron-log"));
const electron_1 = require("electron");
const mainIpc = __importStar(require("./mainIpc"));
const Sentry = __importStar(require("./sentry"));
const logglyHelpers = __importStar(require("../shared/logglyHelpers"));
const serverLogger_1 = require("../helpers/serverLogger");
const config_1 = __importDefault(require("../config"));
function setupLogging() {
    setupServerLogging();
    setupLocalLogging();
}
exports.setupLogging = setupLogging;
function setupLocalLogging() {
    electron_log_1.default.transports.file.level = "info";
    electron_log_1.default.transports.file.fileName = "log.log";
    electron_log_1.default.transports.file.maxSize = 10 * 1024 * 1024;
    electron_1.app.on("render-process-gone", (_event, webContents, details) => {
        try {
            electron_log_1.default.error("renderer-process-gone", {
                url: webContents === null || webContents === void 0 ? void 0 : webContents.getURL(),
                details,
            });
        }
        catch (error) {
            electron_log_1.default.error("renderer-process-gone", { url: "[unavailable]", details });
        }
    });
    electron_1.app.on("child-process-gone", (_event, details) => {
        electron_log_1.default.error("child-process-gone", details);
    });
    electron_1.app.on("web-contents-created", (_event, webContents) => {
        const scope = `${webContents.getType()}-${webContents.id}`;
        const webContentsLog = electron_log_1.default.scope(scope);
        webContents.on("did-start-loading", () => webContentsLog.info("did-start-loading"));
        webContents.on("did-stop-loading", () => webContentsLog.info("did-stop-loading"));
        webContents.on("dom-ready", () => webContentsLog.info("dom-ready"));
        webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
            webContentsLog.error("did-fail-load", {
                errorCode,
                errorDescription,
                validatedURL,
            });
        });
        webContents.on("did-fail-provisional-load", (_event, errorCode, errorDescription, validatedURL) => {
            webContentsLog.error("did-fail-provisional-load", {
                errorCode,
                errorDescription,
                validatedURL,
            });
        });
        webContents.on("unresponsive", () => webContentsLog.error("unresponsive"));
        webContents.on("responsive", () => webContentsLog.info("responsive"));
        webContents.on("destroyed", () => webContentsLog.info("destroyed"));
        webContents.on("console-message", (_event, level, message, line, sourceId) => {
            if (level > 1) {
                webContentsLog.info(`console-message: ${message}`, { line, sourceId });
            }
        });
    });
    electron_1.app.on("before-quit", () => electron_log_1.default.info("Quitting..."));
    if (config_1.default.env !== "production") {
        electron_1.app.on("browser-window-blur", () => {
            if (!electron_1.BrowserWindow.getFocusedWindow()) {
                electron_log_1.default.info("App blurred");
            }
        });
        electron_1.app.on("browser-window-focus", () => {
            electron_log_1.default.info("App focused");
        });
    }
}
function setupServerLogging() {
    Sentry.initialize(electron_1.app);
    process.on("uncaughtException", error => {
        if (error.message.startsWith("net::ERR")) {
            void serverLogger_1.serverLogger.log({
                level: "info",
                from: "main",
                type: "networkError",
                error: logglyHelpers.convertErrorToLog(error),
            });
        }
        else {
            Sentry.capture(error);
            void serverLogger_1.serverLogger.log({
                level: "error",
                from: "main",
                type: "uncaughtException",
                error: logglyHelpers.convertErrorToLog(error),
            });
        }
    });
    process.on("unhandledRejection", reason => {
        if (reason &&
            reason instanceof Error &&
            reason.message.startsWith("net::ERR")) {
            void serverLogger_1.serverLogger.log({
                level: "info",
                from: "main",
                type: "networkError",
                error: logglyHelpers.convertErrorToLog(reason),
            });
        }
        else {
            Sentry.capture(reason);
            void serverLogger_1.serverLogger.log({
                level: "error",
                from: "main",
                type: "unhandledRejection",
                error: logglyHelpers.convertErrorToLog(reason),
            });
        }
    });
    mainIpc.handleEventFromRenderer.addListener("notion:set-logger-data", (event, data) => {
        serverLogger_1.serverLogger.extraLoggingContext.clientEnvironmentData = data;
    });
    mainIpc.handleEventFromRenderer.addListener("notion:log-error", (event, message) => {
        void serverLogger_1.serverLogger.log(message);
    });
}
