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
exports.recordTraceAndPackage = void 0;
const electron_1 = require("electron");
const fflate_1 = require("fflate");
const electron_log_1 = __importDefault(require("electron-log"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const appController = __importStar(require("./AppController"));
const config_1 = __importDefault(require("../config"));
const troubleshooting = __importStar(require("./troubleshooting"));
const zip_1 = __importDefault(require("../helpers/zip"));
const DEFAULT_TRACE_CATEGORIES = [
    "electron",
    "ipc",
    "input",
    "navigation",
    "loading",
    "accessibility",
    "disabled-by-default-network",
    "disabled-by-default-net",
    "networkinfo",
    "devtools.timeline",
    "disabled-by-default-devtools.timeline",
    "disabled-by-default-devtools.timeline.frame",
    "disabled-by-default-devtools.timeline.stack",
    "v8.execute",
    "blink.console",
    "blink.user_timing",
    "latencyInfo",
    "disabled-by-default-v8.cpu_profiler",
    "disabled-by-default-v8.cpu_profiler.hires",
];
const DEFAULT_TRACE_SECONDS = 30;
const DEFAULT_TRACE_OPTIONS = {
    seconds: DEFAULT_TRACE_SECONDS,
    includedCategories: DEFAULT_TRACE_CATEGORIES,
};
async function recordTraceAndPackage(window, options = DEFAULT_TRACE_OPTIONS) {
    const zipName = `${electron_1.app.getName()}-profile-${new Date()
        .toISOString()
        .replace(/:/g, "-")}.zip`;
    const zipPath = `${electron_1.app.getPath("downloads")}/${zipName}`;
    const mergedOptions = Object.assign(Object.assign({}, DEFAULT_TRACE_OPTIONS), options);
    const tracePath = await recordTrace(window, mergedOptions);
    if (!tracePath) {
        return;
    }
    const preparedTraceContent = await prepareTrace(tracePath);
    if (!preparedTraceContent) {
        return;
    }
    const auxiliary = await troubleshooting.getAuxiliaryInfo();
    const zipContent = await (0, zip_1.default)(Object.assign({ "trace.json": (0, fflate_1.strToU8)(preparedTraceContent) }, auxiliary));
    try {
        await fs_extra_1.default.writeFile(zipPath, zipContent);
        electron_1.shell.showItemInFolder(zipPath);
    }
    catch (error) {
        electron_log_1.default.error(`recordTraceAndPackage(): Failed to write zip file`, error);
    }
}
exports.recordTraceAndPackage = recordTraceAndPackage;
async function recordTrace(window, options) {
    var _a, _b;
    if (!electron_1.app.isReady()) {
        electron_log_1.default.error(`recordTrace() called before app was ready`);
        return null;
    }
    const rendererProcessIds = (_b = (_a = appController.appController
        .getWindowControllerForWebContents(window === null || window === void 0 ? void 0 : window.webContents)) === null || _a === void 0 ? void 0 : _a.getActiveTabController()) === null || _b === void 0 ? void 0 : _b.getProcessIds();
    const mainProcessId = process.pid;
    const processIds = rendererProcessIds
        ? [mainProcessId, ...rendererProcessIds]
        : undefined;
    electron_log_1.default.info(`Recording trace for pids ${(processIds === null || processIds === void 0 ? void 0 : processIds.join(", ")) || "all"} for ${options.seconds} seconds`);
    await electron_1.contentTracing.startRecording({
        recording_mode: "record-until-full",
        included_categories: options.includedCategories,
        excluded_categories: ["*"],
        included_process_ids: processIds,
    });
    showTraceProgress(window, options);
    await new Promise(resolve => setTimeout(resolve, options.seconds * 1000));
    const tracePath = await electron_1.contentTracing.stopRecording();
    electron_log_1.default.info(`Recorded trace to ${tracePath}`);
    return tracePath;
}
function showTraceProgress(window, options) {
    if (!window) {
        return;
    }
    const updateProgress = (passedSeconds = 0) => {
        if (passedSeconds >= options.seconds) {
            window.setProgressBar(-1);
        }
        else {
            const completedPercentage = passedSeconds / options.seconds;
            window.setProgressBar(completedPercentage);
        }
        if (passedSeconds < options.seconds) {
            setTimeout(() => updateProgress(passedSeconds + 1), 1000);
        }
    };
    updateProgress();
}
async function prepareTrace(tracePath) {
    try {
        const text = await fs_extra_1.default.readFile(tracePath, "utf-8");
        const fixedText = text.replaceAll(`${config_1.default.protocol}://`, "https://");
        await fs_extra_1.default.remove(tracePath);
        return fixedText;
    }
    catch (error) {
        electron_log_1.default.error(`Tried to fix up trace but failed`, error);
    }
    return null;
}
