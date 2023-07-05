"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../helpers/setEnvironment");
const electron_1 = require("electron");
const electron_log_1 = __importDefault(require("electron-log"));
require("./crashReporter");
require("./security");
const autoUpdater_1 = require("./autoUpdater");
const systemMenu_1 = require("./systemMenu");
const schemeHandler_1 = require("./schemeHandler");
const config_1 = __importDefault(require("../config"));
const serverLogger_1 = require("../helpers/serverLogger");
const assetCache_1 = require("./assetCache");
const logglyHelpers_1 = require("../shared/logglyHelpers");
const WebUpdater_1 = require("./WebUpdater");
const AppController_1 = require("./AppController");
const windowListeners_1 = require("./windowListeners");
const logging_1 = require("./logging");
const sqliteServer_1 = require("./sqliteServer");
const normalizeProtocolUrl_1 = require("../helpers/normalizeProtocolUrl");
electron_1.dialog.showErrorBox = function (title, content) { };
let normalizedProtocolUrl;
let webUpdater;
function handleActivate() {
    var _a;
    const allWindows = electron_1.BrowserWindow.getAllWindows();
    const { isLocalhost, env } = config_1.default;
    const isLocal = env === "local" || isLocalhost;
    if (allWindows.length === 1) {
        const win = allWindows[0];
        if (normalizedProtocolUrl) {
            (_a = AppController_1.appController
                .getWindowControllerForWebContents(win.webContents)) === null || _a === void 0 ? void 0 : _a.loadUrlInActiveTab(normalizedProtocolUrl);
        }
        win.focus();
    }
    else {
        const win = AppController_1.appController.createWindow(normalizedProtocolUrl);
        if (isLocal) {
            win.minimize();
        }
        else {
            win.focus();
        }
    }
}
function handleProtocol() {
    if (process.platform === "darwin") {
        electron_1.app.on("open-url", (event, url) => {
            event.preventDefault();
            normalizedProtocolUrl = (0, normalizeProtocolUrl_1.normalizeProtocolUrl)(url);
            if (electron_1.app.isReady()) {
                AppController_1.appController.handleProtocolUrl(normalizedProtocolUrl);
            }
        });
    }
    else if (process.platform === "win32") {
        if (electron_1.app.requestSingleInstanceLock()) {
            electron_1.app.on("second-instance", (_event, argv) => {
                AppController_1.appController.handleProtocolUrl((0, normalizeProtocolUrl_1.findProtocolUrl)(argv));
            });
        }
        else {
            electron_1.app.quit();
        }
        normalizedProtocolUrl = (0, normalizeProtocolUrl_1.findProtocolUrl)(process.argv);
    }
}
function setupWebUpdater() {
    webUpdater = new WebUpdater_1.WebUpdater(electron_1.app, assetCache_1.assetCache);
    if (!config_1.default.isLocalhost || config_1.default.offline) {
        const pollInterval = config_1.default.env === "production" ? 10 * 60 * 1000 : 60 * 1000;
        setInterval(async () => {
            try {
                await assetCache_1.assetCache.checkForUpdates();
            }
            catch (error) {
                const sanitizedError = (0, logglyHelpers_1.convertErrorToLog)(error);
                void serverLogger_1.serverLogger.log({
                    level: "error",
                    from: "AssetCache",
                    type: "topLevelAssetPollingError",
                    error: sanitizedError,
                });
            }
        }, pollInterval);
    }
}
async function onReady() {
    electron_log_1.default.info(`App starting with version ${electron_1.app.getVersion()}`, {
        system: `${process.platform} ${process.arch}`,
        electron: process.versions.electron,
    });
    (0, logging_1.setupLogging)();
    (0, autoUpdater_1.initializeAutoUpdater)();
    (0, systemMenu_1.setupSystemMenu)();
    await assetCache_1.assetCache.initialize();
    await (0, sqliteServer_1.setupSqliteServer)();
    (0, windowListeners_1.setupWindowListeners)();
    (0, schemeHandler_1.registerUrlSchemeProxy)();
    handleActivate();
    await (0, schemeHandler_1.wipeTransientCsrfCookie)();
}
async function beforeReady() {
    electron_1.app.setAsDefaultProtocolClient(config_1.default.protocol);
    handleProtocol();
    electron_1.Menu.setApplicationMenu(null);
    electron_1.app.setAppUserModelId(config_1.default.desktopAppId);
    setupWebUpdater();
    await electron_1.app.whenReady();
    void onReady();
}
void beforeReady();
