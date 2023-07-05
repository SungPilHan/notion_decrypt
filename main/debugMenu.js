"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldSimulateAirplaneMode = exports.getDebugMenu = exports.shouldShowDebugMenu = void 0;
const electron_1 = require("electron");
const electron_log_1 = __importDefault(require("electron-log"));
const config_1 = __importDefault(require("../config"));
const path_1 = __importDefault(require("path"));
const AppController_1 = require("./AppController");
const state_1 = require("./state");
const fs_1 = __importDefault(require("fs"));
let simulateAirplaneMode = false;
function shouldShowDebugMenu() {
    return config_1.default.env !== "production";
}
exports.shouldShowDebugMenu = shouldShowDebugMenu;
function getDebugMenu() {
    if (!shouldShowDebugMenu()) {
        throw new Error("Dev tools are disabled, this should never be called!");
    }
    return {
        label: "Debug",
        submenu: [
            {
                label: "Dump state",
                click() {
                    const browserWindow = electron_1.BrowserWindow.getFocusedWindow();
                    if (!browserWindow) {
                        return;
                    }
                    void electron_1.dialog.showSaveDialog(browserWindow, {}).then(({ filePath }) => {
                        if (filePath) {
                            fs_1.default.writeFileSync(filePath, JSON.stringify(state_1.Store.getState(), null, 4));
                        }
                    });
                },
            },
            {
                label: "Open Log Folder",
                click() {
                    void electron_1.shell.openPath(path_1.default.dirname(electron_log_1.default.transports.file.getFile().path));
                },
            },
            {
                label: "Open Data Folder",
                click() {
                    void electron_1.shell.openPath(electron_1.app.getPath("userData"));
                },
            },
            {
                label: "Simulate Airplane Mode",
                type: "checkbox",
                click(menuItem) {
                    void setSimulateAirplaneMode(menuItem.checked);
                },
            },
            {
                type: "separator",
            },
            {
                label: "Toggle all DevTools",
                click() {
                    electron_1.webContents.getAllWebContents().forEach(wc => {
                        if (wc.isDevToolsOpened()) {
                            wc.closeDevTools();
                        }
                        else {
                            wc.openDevTools({ mode: "detach" });
                        }
                    });
                },
            },
            {
                type: "separator",
            },
            {
                label: "Open Notion Console",
                click() {
                    var _a;
                    const notionController = (_a = AppController_1.appController
                        .getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.getActiveTabController();
                    if (!notionController) {
                        return;
                    }
                    notionController.openNotionConsole();
                },
            },
            {
                label: "Open Search Console",
                click() {
                    var _a;
                    const notionController = (_a = AppController_1.appController
                        .getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.getActiveTabController();
                    if (!notionController) {
                        return;
                    }
                    notionController.openSearchConsole();
                },
            },
            {
                label: "Open Tabs Console",
                click() {
                    const windowController = AppController_1.appController.getFocusedWindowController();
                    if (!windowController) {
                        return;
                    }
                    windowController.openTabsConsole();
                },
            },
        ],
    };
}
exports.getDebugMenu = getDebugMenu;
async function setSimulateAirplaneMode(newValue) {
    if (!shouldShowDebugMenu()) {
        throw new Error("Dev tools are disabled, this should never be called!");
    }
    if (simulateAirplaneMode === newValue) {
        return;
    }
    simulateAirplaneMode = newValue;
    for (const wc of electron_1.webContents.getAllWebContents()) {
        await setOfflineMode(wc, simulateAirplaneMode);
    }
    if (simulateAirplaneMode) {
        electron_1.app.addListener("web-contents-created", enableOfflineMode);
    }
    else {
        electron_1.app.removeListener("web-contents-created", enableOfflineMode);
    }
}
function shouldSimulateAirplaneMode() {
    return simulateAirplaneMode;
}
exports.shouldSimulateAirplaneMode = shouldSimulateAirplaneMode;
function enableOfflineMode(event, webContents) {
    void setOfflineMode(webContents, true);
}
async function setOfflineMode(webContents, offline) {
    const dbg = webContents.debugger;
    if (!dbg.isAttached()) {
        dbg.attach();
    }
    await dbg.sendCommand("Network.enable");
    await dbg.sendCommand("Network.emulateNetworkConditions", {
        offline,
        latency: 0,
        downloadThroughput: -1,
        uploadThroughput: -1,
    });
}
