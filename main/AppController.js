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
exports.AppController_TEST_ONLY = exports.appController = void 0;
const lodash_1 = __importDefault(require("lodash"));
const electron_1 = require("electron");
const WindowController_1 = require("./WindowController");
const localeHelpers_1 = require("../shared/localeHelpers");
const config_1 = __importDefault(require("../config"));
const state_1 = require("./state");
const localizationHelper_1 = require("../helpers/localizationHelper");
const schemeHelpers_1 = require("../shared/schemeHelpers");
const browserTabs = __importStar(require("./browserTabs"));
const electron_log_1 = __importDefault(require("electron-log"));
const crypto_1 = __importDefault(require("crypto"));
class AppController {
    constructor() {
        this.windowControllers = new Array();
        this.appStateUnsubscribe = (0, state_1.subscribeToSelector)(state_1.selectAppState, (currentState, oldState) => this.handleAppStateChange(currentState, oldState));
    }
    get intl() {
        if (!electron_1.app.isReady()) {
            if (config_1.default.env === "production") {
                return (0, localizationHelper_1.createIntlShape)("en-US");
            }
            else {
                throw new Error("Cannot request intl before app is ready because locale isn't available");
            }
        }
        if (!this._intl) {
            const appLocale = electron_1.app.getLocale();
            const adjustedAppLocale = appLocale === "es-419" ? "es-LA" : appLocale;
            this._notionLocale = (0, localeHelpers_1.externalLocaleToNotionLocale)(adjustedAppLocale, config_1.default.env === "production");
            const possibleIntl = (0, localizationHelper_1.createIntlShape)(this._notionLocale);
            if (!electron_1.app.isReady()) {
                return possibleIntl;
            }
            else {
                this._intl = possibleIntl;
            }
        }
        return this._intl;
    }
    get notionLocale() {
        if (this._notionLocale) {
            return this._notionLocale;
        }
        else {
            return "en-US";
        }
    }
    createWindow(initialUrl = undefined) {
        this.trackAnalyticsEvent("electron_new_window");
        const focusedWindowController = this.getFocusedWindowController();
        const startAsFullscreen = (focusedWindowController === null || focusedWindowController === void 0 ? void 0 : focusedWindowController.isFullScreen()) || false;
        if (!initialUrl) {
            initialUrl = (0, schemeHelpers_1.getSchemeUrl)({
                httpUrl: config_1.default.domainBaseUrl,
                protocol: config_1.default.protocol,
            });
        }
        const newController = WindowController_1.WindowController.newInstanceWithUrl((0, state_1.createWindowId)(), this.intl, initialUrl, startAsFullscreen);
        this.windowControllers.push(newController);
        const newWindow = newController.browserWindow;
        newWindow.on("close", () => this.handleClose(newWindow));
        newWindow.on("focus", () => {
            this.mostRecentlyFocusedWindowController = newController;
        });
        return newWindow;
    }
    createWindowForTabController(controller) {
        const focusedWindowController = this.getFocusedWindowController();
        const startAsFullscreen = (focusedWindowController === null || focusedWindowController === void 0 ? void 0 : focusedWindowController.isFullScreen()) || false;
        const newController = WindowController_1.WindowController.newInstanceWithController((0, state_1.createWindowId)(), this.intl, controller, startAsFullscreen);
        this.windowControllers.push(newController);
        const newWindow = newController.browserWindow;
        newWindow.on("close", () => this.handleClose(newWindow));
        newWindow.on("focus", () => {
            this.mostRecentlyFocusedWindowController = newController;
        });
        return newWindow;
    }
    handleProtocolUrl(url) {
        if (!url) {
            return;
        }
        const { protocol, host, pathname, search, hash } = new URL(url);
        const params = new URLSearchParams(search);
        if (params.get("deepLinkOpenNewTab") === "true") {
            params.delete("deepLinkOpenNewTab");
            const paramsString = params.toString();
            const newSearch = paramsString ? `?${paramsString}` : "";
            const newUrl = [protocol, "//", host, pathname, newSearch, hash].join("");
            const existingTab = this.getWindowAndTabControllerWithUrl(newUrl);
            if (existingTab) {
                this.openUrlInTab(newUrl, existingTab);
            }
            else {
                this.openUrlInNewTabOrWindow(newUrl);
            }
        }
        else {
            this.navigateFocusedWindowToUrl(url);
        }
        browserTabs
            .closeLastBrowserTab({ urlContaining: pathname })
            .catch((err) => {
            electron_log_1.default.error("Error closing last browser tab", err);
        });
    }
    getFocusedWindowController() {
        var _a;
        return this.getWindowControllerForWebContents((_a = electron_1.BrowserWindow.getFocusedWindow()) === null || _a === void 0 ? void 0 : _a.webContents);
    }
    getMostRecentlyFocusedWindowController() {
        return this.mostRecentlyFocusedWindowController;
    }
    getWindowControllerForWebContents(contents) {
        if (!contents) {
            return;
        }
        const window = electron_1.BrowserWindow.fromWebContents(contents);
        if (!window) {
            return;
        }
        return this.windowControllers.find(controller => {
            return controller.browserWindow.id === window.id;
        });
    }
    getTabControllerForWebContents(contents) {
        for (const windowController of this.windowControllers) {
            const candidate = windowController.getTabControllerForWebContents(contents);
            if (candidate) {
                return candidate;
            }
        }
    }
    sendMainToAllNotionInstances(eventName, ...args) {
        this.windowControllers.forEach(controller => {
            controller.sendMainToAllNotionInstances(eventName, ...args);
        });
    }
    refreshAll(includeActiveTabInFocusedWindow) {
        const focusedWindow = electron_1.BrowserWindow.getFocusedWindow();
        if (includeActiveTabInFocusedWindow || !focusedWindow) {
            this.windowControllers.forEach(controller => controller.refresh({
                includeActiveTab: true,
            }));
            return;
        }
        this.windowControllers.forEach(controller => {
            controller.refresh({
                includeActiveTab: controller.browserWindow.id !== focusedWindow.id,
            });
        });
    }
    refreshForWindowsMenuBarSpacing() {
        if (process.platform === "darwin") {
            return;
        }
        this.windowControllers.forEach(windowController => {
            windowController.refreshForWindowsMenuBarSpacing();
        });
    }
    trackAnalyticsEvent(eventName, eventData = {}) {
        var _a, _b;
        (_b = (_a = this.mostRecentlyFocusedWindowController) === null || _a === void 0 ? void 0 : _a.getActiveTabController()) === null || _b === void 0 ? void 0 : _b.sendToNotion("notion:track", eventName, eventData);
    }
    handleAppStateChange(currentState, oldState) {
        const newPreferences = currentState.preferences || {};
        const oldPreferences = oldState.preferences || {};
        if (process.platform === "darwin") {
            const browserTabsSet = newPreferences.isClosingBrowserTabs &&
                !oldPreferences.isClosingBrowserTabs;
            if (browserTabsSet) {
                void browserTabs.closeLastBrowserTab({
                    urlContaining: "notion.so",
                    dryRun: true,
                });
            }
        }
    }
    handleClose(window) {
        this.windowControllers = this.windowControllers.filter(controller => {
            return controller.browserWindow !== window;
        });
    }
    getWindowAndTabControllerWithUrl(url) {
        const mostRecentlyFocusedWindowController = this.getMostRecentlyFocusedWindowController();
        const sortedWindowControllers = lodash_1.default.compact([
            mostRecentlyFocusedWindowController,
            ...this.windowControllers.filter(wc => wc !== mostRecentlyFocusedWindowController),
        ]);
        for (const windowController of sortedWindowControllers) {
            const tabController = windowController.getTabControllerWithUrl(url);
            if (tabController) {
                return { windowController, tabController };
            }
        }
    }
    openUrlInTab(url, { windowController, tabController, }) {
        const deduplicationID = crypto_1.default.randomUUID();
        const navigateToUrlObject = {
            url,
            deduplicationID: deduplicationID,
        };
        tabController.navigateToUrl(navigateToUrlObject);
        windowController.makeTabActive(tabController);
        if (windowController.browserWindow.isMinimized()) {
            windowController.browserWindow.restore();
        }
        windowController.browserWindow.focus();
    }
    openUrlInNewTabOrWindow(url) {
        const targetWindowController = this.getMostRecentlyFocusedWindowController() || this.windowControllers[0];
        if (targetWindowController) {
            targetWindowController.newTab({
                initialUrl: url,
                makeActiveTab: true,
                position: { type: "end" },
            });
            if (targetWindowController.browserWindow.isMinimized()) {
                targetWindowController.browserWindow.restore();
            }
            targetWindowController.browserWindow.focus();
        }
        else {
            this.createWindow(url).focus();
        }
    }
    navigateFocusedWindowToUrl(url) {
        const targetWindowController = this.getMostRecentlyFocusedWindowController() || this.windowControllers[0];
        if (!targetWindowController) {
            this.createWindow(url).focus();
            return;
        }
        this.openUrlInTab(url, {
            windowController: targetWindowController,
            tabController: targetWindowController.getActiveTabController(),
        });
    }
}
exports.appController = new AppController();
exports.AppController_TEST_ONLY = AppController;
