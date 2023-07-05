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
exports.getAuxiliaryInfo = exports.showLogsInShell = void 0;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs = __importStar(require("fs-extra"));
const electron_log_1 = __importDefault(require("electron-log"));
const electron_1 = require("electron");
const notion_intl_1 = require("notion-intl");
const fflate_1 = require("fflate");
const zip_1 = __importDefault(require("../helpers/zip"));
const appController = __importStar(require("./AppController"));
const troubleshootingMessages = (0, notion_intl_1.defineMessages)({
    logsInShellFailedTitle: {
        id: "desktopTroubleshooting.showLogs.error.title",
        defaultMessage: "Showing the logs failed",
        description: "When the `Show logs in Finder/Explorer` fails, we show an error dialog. This message labels the title of that box.",
    },
    logsInShellFailedMessageMac: {
        id: "desktopTroubleshooting.showLogs.error.message.mac",
        defaultMessage: "Notion encountered an error while trying to show the logs in Finder:",
        description: "When the `Show logs in Finder` fails, we show an error dialog. This message labels the message of that box. The message will be followed by the actual error.",
    },
    logsInShellFailedMessageWindows: {
        id: "desktopTroubleshooting.showLogs.error.message.windows",
        defaultMessage: "Notion encountered an error while trying to show the logs in Explorer:",
        description: "When the `Show logs in Explorer` fails, we show an error dialog. This message labels the message of that box. The message will be followed by the actual error.",
    },
});
async function showLogsInShell() {
    try {
        const zipContent = await packageLogs();
        const logFileName = `${electron_1.app.getName()}-logs-${new Date()
            .toISOString()
            .replace(/:/g, "-")}.zip`;
        const logFilePath = path_1.default.join(electron_1.app.getPath("downloads"), logFileName);
        await fs.writeFile(logFilePath, zipContent);
        electron_1.shell.showItemInFolder(logFilePath);
    }
    catch (error) {
        electron_log_1.default.error(`showLogsInShell() failed: ${error}`);
        const intl = appController.appController.intl;
        const message = process.platform === "win32"
            ? intl.formatMessage(troubleshootingMessages.logsInShellFailedMessageWindows)
            : intl.formatMessage(troubleshootingMessages.logsInShellFailedMessageMac);
        await electron_1.dialog.showMessageBox({
            title: intl.formatMessage(troubleshootingMessages.logsInShellFailedTitle),
            type: "error",
            message: `${message}\n\n${error}`,
        });
    }
}
exports.showLogsInShell = showLogsInShell;
async function packageLogs() {
    const logPath = path_1.default.dirname(electron_log_1.default.transports.file.getFile().path);
    const files = await fs.readdir(logPath);
    const logs = {};
    for (const file of files) {
        const filePath = path_1.default.join(logPath, file);
        logs[file] = (0, fflate_1.strToU8)(await fs.readFile(filePath, "utf8"));
    }
    const auxiliary = await getAuxiliaryInfo();
    const zipContent = await (0, zip_1.default)(Object.assign(Object.assign({}, logs), auxiliary));
    return zipContent;
}
async function getAuxiliaryInfo() {
    const appInfo = JSON.stringify(electron_1.app.getAppMetrics(), undefined, 2);
    const gpuInfo = JSON.stringify(await electron_1.app.getGPUInfo("complete"), undefined, 2);
    const env = JSON.stringify(getEnvironmentInfo(), undefined, 2);
    const files = {};
    files["app-info.json"] = (0, fflate_1.strToU8)(appInfo);
    files["gpu-info.json"] = (0, fflate_1.strToU8)(gpuInfo);
    files["environment.json"] = (0, fflate_1.strToU8)(env);
    return files;
}
exports.getAuxiliaryInfo = getAuxiliaryInfo;
function getEnvironmentInfo() {
    return {
        platform: os_1.default.platform(),
        arch: os_1.default.arch(),
        release: os_1.default.release(),
        appVersion: electron_1.app.getVersion(),
        versions: process.versions,
    };
}
