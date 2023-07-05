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
exports.setupSqliteServer = void 0;
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const get_port_1 = __importDefault(require("get-port"));
const crypto_1 = __importDefault(require("crypto"));
const electron_1 = require("electron");
const electron_log_1 = __importDefault(require("electron-log"));
const Sentry = __importStar(require("./sentry"));
const mainIpc = __importStar(require("./mainIpc"));
let authToken;
let serverProcess;
let serverProcessPort;
async function setupSqliteServer() {
    if (serverProcess) {
        electron_log_1.default.error(`Tried to start SqliteServer but Sqlite child process is already running`);
        return;
    }
    authToken = crypto_1.default.randomBytes(20).toString("hex");
    serverProcessPort = await (0, get_port_1.default)({ host: "127.0.0.1" });
    serverProcess = getSqliteServer();
    mainIpc.handleRequestFromRenderer.addListener("notion:get-sqlite-meta", _event => {
        if (!serverProcessPort) {
            throw new Error("Port not yet assigned, should not be possible.");
        }
        return { value: { serverProcessPort, authToken } };
    });
    electron_1.app.on("before-quit", () => {
        electron_log_1.default.info("Killing sqlite child process");
        serverProcess === null || serverProcess === void 0 ? void 0 : serverProcess.kill("SIGTERM");
    });
    electron_log_1.default.info(`Sqlite child process running on ${serverProcessPort}`);
}
exports.setupSqliteServer = setupSqliteServer;
function getSqliteServer() {
    var _a, _b;
    if (!serverProcessPort) {
        throw new Error("No process port assigned.");
    }
    const log = electron_log_1.default.scope("Sqlite Server");
    const userDataPath = electron_1.app.getPath("userData");
    const executorPath = path_1.default.join(__dirname, "sqlite", "SqliteServer.js");
    serverProcess = (0, child_process_1.fork)(executorPath, [userDataPath, serverProcessPort.toString(), authToken], {
        stdio: ["pipe", "inherit", "pipe", "ipc"],
    });
    serverProcess.on("error", Sentry.capture);
    (_a = serverProcess.stderr) === null || _a === void 0 ? void 0 : _a.on("data", data => {
        Sentry.captureMessage(data.toString());
        log.info(`stderr: ${data}`);
    });
    (_b = serverProcess.stdout) === null || _b === void 0 ? void 0 : _b.on("data", data => {
        Sentry.captureMessage(data.toString());
        log.info(`stdout: ${data}`);
    });
    return serverProcess;
}
