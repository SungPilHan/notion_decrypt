"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverLogger = exports.ServerLogger = void 0;
const os_1 = __importDefault(require("os"));
const electron_1 = require("electron");
const electron_log_1 = __importDefault(require("electron-log"));
const config_1 = __importDefault(require("../config"));
const logglyHelpers_1 = require("../shared/logglyHelpers");
const lodash_1 = __importDefault(require("lodash"));
const PromiseUtils_1 = require("../shared/PromiseUtils");
function getOS() {
    const platform = os_1.default.platform();
    switch (platform) {
        case "darwin":
            return "mac";
        case "win32":
            return "windows";
        default:
            return "unknown";
    }
}
const MAX_LOG_QUEUE_LENGTH = 50;
class ServerLogger {
    constructor(args) {
        this.args = args;
        this.extraLoggingContext = {};
        this.queue = [];
        this.flushing = false;
        this.rateLimitedLog = lodash_1.default.throttle(this.log.bind(this), 500);
        this.flush = async () => {
            if (!this.flushing && this.queue.length > 0) {
                this.flushing = true;
                const logMessages = this.queue.splice(0, Math.max(this.queue.length, MAX_LOG_QUEUE_LENGTH));
                const body = logMessages
                    .map(logMessage => {
                    return JSON.stringify(logMessage);
                })
                    .join("\n");
                try {
                    const splunkResponse = await (0, PromiseUtils_1.raceWithTimeout)(10000, [
                        fetch(`https://${this.splunkConfig.host}:${this.splunkConfig.port}/${this.splunkConfig.path}`, {
                            method: "post",
                            headers: { Authorization: `Splunk ${this.splunkConfig.token}` },
                            body: body,
                        }),
                    ]);
                    if (!splunkResponse.timeout) {
                        const { result } = splunkResponse;
                        if (result.status !== 200) {
                            this.args.logger.log({
                                level: "warning",
                                from: "serverLogger.ts",
                                type: "unreachableSplunk",
                                error: {
                                    message: "Could not reach Splunk!",
                                    miscErrorString: (0, logglyHelpers_1.safelyConvertAnyToString)({
                                        status: result.status,
                                        statusText: result.statusText,
                                        responseText: await result.text(),
                                    }),
                                },
                            });
                        }
                    }
                    this.flushing = false;
                }
                catch (error) {
                    this.flushing = false;
                    this.queue.splice(0, 0, ...logMessages);
                    setTimeout(this.flush, 1000 * 60);
                }
            }
        };
        const { env, splunkConfig } = args;
        this.env = env;
        this.loggingContext = {
            os: args.os,
            platform: ServerLogger.PLATFORM,
        };
        this.splunkConfig = splunkConfig;
    }
    async log(logMessage) {
        const processedLogMessage = this.appendAdditionalFields(this.prepareMessage(logMessage));
        this.args.logger.log(processedLogMessage);
        if (this.args.env !== "local") {
            this.queue.push(processedLogMessage);
            await this.flush();
        }
    }
    prepareMessage(logMessage) {
        const { data } = logMessage, rest = __rest(logMessage, ["data"]);
        return Object.assign({ environment: this.env, data: data ? (0, logglyHelpers_1.stringifyMiscData)(data) : undefined }, rest);
    }
    appendAdditionalFields(logMessage) {
        return Object.assign(Object.assign(Object.assign({}, this.loggingContext), this.extraLoggingContext), logMessage);
    }
}
exports.ServerLogger = ServerLogger;
ServerLogger.PLATFORM = "electron";
exports.serverLogger = new ServerLogger({
    os: getOS(),
    env: config_1.default.env,
    logger: {
        log(logMessage) {
            electron_log_1.default.log(logMessage);
        },
        error(logMessage) {
            electron_log_1.default.error(logMessage);
        },
    },
    splunkConfig: config_1.default.splunkConfig,
});
const cpus = os_1.default.cpus();
const desktopCPU = cpus && cpus[0] && cpus[0].model;
const desktopRAM = `${Math.round(os_1.default.totalmem() / 1024 / 1024 / 1024)}G`;
exports.serverLogger.extraLoggingContext.desktopVersion = electron_1.app.getVersion();
exports.serverLogger.extraLoggingContext.desktopCPU = desktopCPU;
exports.serverLogger.extraLoggingContext.desktopRAM = desktopRAM;
