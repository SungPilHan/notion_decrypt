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
exports.setupWindowListeners = void 0;
const electron_1 = require("electron");
require("./crashReporter");
require("./security");
const config_1 = __importDefault(require("../config"));
const mainIpc = __importStar(require("./mainIpc"));
const urlHelpers = __importStar(require("../shared/urlHelpers"));
const schemeHelpers_1 = require("../shared/schemeHelpers");
const AppController_1 = require("./AppController");
const createPopup_1 = require("./createPopup");
const createGoogleDrivePicker_1 = require("./createGoogleDrivePicker");
const typeUtils_1 = require("../shared/typeUtils");
const electronAppFeatures_1 = require("./electronAppFeatures");
const state_1 = require("./state");
const electron_log_1 = __importDefault(require("electron-log"));
function setupWindowListeners() {
    setupAppListeners();
    setupVisibilityAndFocusListeners();
    setupPreferencesListeners();
    setupCopyPaste();
    setupSidebarListeners();
    setupTabListeners();
    setupSearchListeners();
    setupSpellcheckListeners();
    setupHistoryListeners();
    setupChildWindowListeners();
    setupWindowFeatureListeners();
    setupBroadcastListener();
}
exports.setupWindowListeners = setupWindowListeners;
function setupAppListeners() {
    electron_1.app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            electron_1.app.quit();
        }
    });
    electron_1.app.on("activate", (_event, hasVisibleWindows) => {
        if (electron_1.app.isReady() && !hasVisibleWindows) {
            AppController_1.appController.createWindow();
        }
    });
    electron_1.app.on("browser-window-created", (_event, window) => {
        if (!window.isVisible()) {
            window.once("ready-to-show", () => window.showInactive());
        }
    });
}
function setupVisibilityAndFocusListeners() {
    electron_1.app.on("browser-window-blur", () => {
        AppController_1.appController.refreshForWindowsMenuBarSpacing();
    });
    mainIpc.handleRequestFromRenderer.addListener("notion:refresh-all", (_event, includeActiveTabInFocusedWindow) => {
        AppController_1.appController.refreshAll(includeActiveTabInFocusedWindow !== undefined
            ? includeActiveTabInFocusedWindow
            : true);
        return Promise.resolve({ value: undefined });
    });
    mainIpc.handleEventFromRenderer.addListener("notion:focus", event => {
        AppController_1.appController.refreshForWindowsMenuBarSpacing();
    });
    mainIpc.handleEventFromRenderer.addListener("notion:blur", () => {
        AppController_1.appController.refreshForWindowsMenuBarSpacing();
    });
    mainIpc.handleEventFromRenderer.addListener("notion:renderer-visibility-changed", (event, isVisible) => {
        var _a;
        (_a = AppController_1.appController
            .getWindowControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.setRendererVisibility(isVisible);
    });
    mainIpc.handleRequestFromRenderer.addListener("notion:is-active-tab", event => {
        var _a;
        return (((_a = AppController_1.appController
            .getWindowControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.isActiveTab(event.sender)) || false);
    });
    mainIpc.handleEventFromRenderer.addListener("notion:toggle-maximized", event => {
        const window = electron_1.BrowserWindow.fromWebContents(event.sender);
        if (!window) {
            return;
        }
        if (window.isMaximized()) {
            window.unmaximize();
        }
        else {
            window.maximize();
        }
    });
    mainIpc.handleRequestFromRenderer.addListener("notion:is-main-tab", event => {
        const mostRecentlyFocusedWindowController = AppController_1.appController.getMostRecentlyFocusedWindowController();
        if (mostRecentlyFocusedWindowController &&
            mostRecentlyFocusedWindowController.browserWindow.isVisible()) {
            return {
                value: mostRecentlyFocusedWindowController
                    .getActiveTabController()
                    .isManagerOf(event.sender),
            };
        }
        return { value: false };
    });
    mainIpc.handleRequestFromRenderer.addListener("notion:is-window-visible", event => {
        const window = electron_1.BrowserWindow.fromWebContents(event.sender);
        if (!window) {
            return { value: false };
        }
        return { value: window.isVisible() };
    });
    mainIpc.handleEventFromRenderer.addListener("notion:set-theme", (event, theme) => {
        state_1.Store.dispatch((0, state_1.updateTheme)(theme));
    });
    mainIpc.handleEventFromRenderer.addListener("notion:zoom", (event, scale) => {
        state_1.Store.dispatch((0, state_1.updateZoomFactor)(scale));
    });
    mainIpc.DEPRECATED_receiveSyncMainFromRenderer.addListener("notion:get-fullscreen", event => {
        const window = electron_1.BrowserWindow.fromWebContents(event.sender);
        if (!window) {
            return { value: false };
        }
        return { value: window.isFullScreen() };
    });
}
function setupSidebarListeners() {
    mainIpc.handleEventFromRenderer.addListener("notion:set-sidebar-state", (event, state) => {
    });
    mainIpc.handleEventFromRenderer.addListener("notion:toggle-sidebar-expanded", event => {
        var _a;
        (_a = AppController_1.appController
            .getWindowControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.getActiveTabController().toggleSidebarInNotion();
    });
    mainIpc.handleEventFromRenderer.addListener("notion:set-window-sidebar-state", (event, state) => {
        var _a;
        (_a = AppController_1.appController
            .getWindowControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.setWindowSidebarState(event.sender, state);
    });
}
function setupTabListeners() {
    mainIpc.handleEventFromRenderer.addListener("notion:new-tab-from-notion", (event, urlPath, makeActiveTab, position) => {
        const initialUrl = (0, schemeHelpers_1.normalizeToSchemeUrl)({
            url: urlPath,
            protocol: config_1.default.protocol,
            domainBaseUrl: config_1.default.domainBaseUrl,
        });
        const windowController = AppController_1.appController.getWindowControllerForWebContents(event.sender);
        const tabController = AppController_1.appController.getTabControllerForWebContents(event.sender);
        if (!windowController || !tabController) {
            return;
        }
        let newTabPosition = { type: "start" };
        if (position === "start") {
            newTabPosition = { type: "start" };
        }
        else if (position === "after-children") {
            newTabPosition = {
                type: "after-children",
                parentTabId: tabController.tabId,
            };
        }
        else {
            (0, typeUtils_1.unreachable)(position);
        }
        windowController.newTab({
            initialUrl,
            makeActiveTab,
            position: newTabPosition,
        });
    });
    mainIpc.handleEventFromRenderer.addListener("notion:new-tab-from-tab-bar", event => {
        var _a;
        (_a = AppController_1.appController.getWindowControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.newTab({
            makeActiveTab: true,
            position: { type: "start" },
        });
    });
    mainIpc.handleEventFromRenderer.addListener("notion:tab-clicked", (event, tabIndex) => {
        var _a;
        (_a = AppController_1.appController
            .getWindowControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.makeTabActive(tabIndex);
    });
    mainIpc.handleEventFromRenderer.addListener("notion:show-tab-menu", (event, tabIndex, clientX, clientY) => {
        var _a;
        (_a = AppController_1.appController
            .getWindowControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.showTabMenu({
            tabIndex,
            clientX,
            clientY,
        });
    });
    mainIpc.handleEventFromRenderer.addListener("notion:close-tab", (event, tabIndex) => {
        var _a;
        (_a = AppController_1.appController
            .getWindowControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.closeTab(tabIndex);
    });
}
function setupSearchListeners() {
    mainIpc.handleEventFromRenderer.addListener("notion:search-start", (event, isPeekView) => {
        var _a;
        (_a = AppController_1.appController
            .getTabControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.handleSearchStartFromNotion(isPeekView);
    });
    mainIpc.handleEventFromRenderer.addListener("notion:search-stop-from-notion", event => {
        var _a;
        (_a = AppController_1.appController
            .getTabControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.handleSearchStopFromNotion();
    });
    mainIpc.handleEventFromRenderer.addListener("notion:search-next", (event, query) => {
        var _a;
        (_a = AppController_1.appController
            .getTabControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.handleSearchNextFromSearch(query);
    });
    mainIpc.handleEventFromRenderer.addListener("notion:search-prev", (event, query) => {
        var _a;
        (_a = AppController_1.appController
            .getTabControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.handleSearchPrevFromSearch(query);
    });
    mainIpc.handleEventFromRenderer.addListener("notion:search-clear", event => {
        var _a;
        (_a = AppController_1.appController
            .getTabControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.handleSearchClearFromSearch();
    });
    mainIpc.handleEventFromRenderer.addListener("notion:search-stop-from-search", event => {
        var _a;
        (_a = AppController_1.appController
            .getTabControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.handleSearchStopFromSearch();
    });
}
function setupSpellcheckListeners() {
    mainIpc.handleRequestFromRenderer.addListener("notion:get-spellchecker-languages", event => {
        var _a;
        return (((_a = AppController_1.appController
            .getTabControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.getSpellcheckerLanguages()) || []);
    });
    mainIpc.handleRequestFromRenderer.addListener("notion:get-available-spellchecker-languages", event => {
        var _a;
        return (((_a = AppController_1.appController
            .getTabControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.getAvailableSpellcheckerLanguages()) || []);
    });
    mainIpc.handleEventFromRenderer.addListener("notion:set-spellchecker-languages", (event, languages) => {
        var _a;
        (_a = AppController_1.appController
            .getTabControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.setSpellcheckerLanguages(languages);
    });
    mainIpc.handleEventFromRenderer.addListener("notion:set-spellchecker-enabled", (event, enabled) => {
        var _a;
        (_a = AppController_1.appController
            .getTabControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.setSpellcheckerEnabled(enabled);
    });
    mainIpc.handleEventFromRenderer.addListener("notion:replace-misspelling", (event, word) => {
        var _a;
        (_a = AppController_1.appController
            .getTabControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.replaceMisspelling(word);
    });
    mainIpc.handleEventFromRenderer.addListener("notion:add-to-dictionary", (event, word) => {
        var _a;
        (_a = AppController_1.appController
            .getTabControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.addToDictionary(word);
    });
    mainIpc.handleRequestFromRenderer.addListener("notion:get-substitutions", event => {
        if (!electron_1.systemPreferences.getUserDefault) {
            return { value: [] };
        }
        const userDefault = electron_1.systemPreferences.getUserDefault("NSUserDictionaryReplacementItems", "array");
        if (!userDefault) {
            return { value: [] };
        }
        return { value: userDefault };
    });
}
function setupHistoryListeners() {
    mainIpc.handleEventFromRenderer.addListener("notion:go-back", event => {
        var _a, _b;
        (_b = (_a = AppController_1.appController
            .getWindowControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.getActiveTabController()) === null || _b === void 0 ? void 0 : _b.goBack();
    });
    mainIpc.handleEventFromRenderer.addListener("notion:go-forward", event => {
        var _a, _b;
        (_b = (_a = AppController_1.appController
            .getWindowControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.getActiveTabController()) === null || _b === void 0 ? void 0 : _b.goForward();
    });
}
function setupPreferencesListeners() {
    mainIpc.handleRequestFromRenderer.addListener("notion:get-electron-app-features", event => {
        const windowController = AppController_1.appController.getWindowControllerForWebContents(event.sender);
        return (0, electronAppFeatures_1.getElectronAppFeatures)({
            isShowingTabBar: windowController
                ? windowController.hasMultipleTabs()
                : true,
        });
    });
    mainIpc.handleEventFromRenderer.addListener("notion:set-user-preference", (_event, key, value) => {
        electron_log_1.default.info("notion:set-user-preference", { key, value });
        state_1.Store.dispatch((0, state_1.updatePreferences)({ [key]: value }));
    });
    mainIpc.handleRequestFromRenderer.addListener("notion:get-app-version", _event => {
        const value = electron_1.app.getVersion();
        return { value };
    });
    mainIpc.handleRequestFromRenderer.addListener("notion:get-is-running-under-arm64-translation", _event => electron_1.app.runningUnderARM64Translation);
    mainIpc.handleRequestFromRenderer.addListener("notion:get-app-path", _event => {
        const value = electron_1.app.getAppPath();
        return { value };
    });
}
function setupCopyPaste() {
    mainIpc.handleEventFromRenderer.addListener("notion:cut", event => {
        event.sender.cut();
    });
    mainIpc.handleEventFromRenderer.addListener("notion:copy", event => {
        event.sender.copy();
    });
    mainIpc.handleEventFromRenderer.addListener("notion:paste", event => {
        event.sender.paste();
    });
}
function setupChildWindowListeners() {
    mainIpc.handleEventFromRenderer.addListener("notion:create-window", (_event, urlPath) => {
        AppController_1.appController.createWindow((0, schemeHelpers_1.normalizeToSchemeUrl)({
            url: urlPath,
            domainBaseUrl: config_1.default.domainBaseUrl,
            protocol: config_1.default.protocol,
        }));
    });
    mainIpc.handleEventFromRenderer.addListener("notion:create-popup", (_event, args) => {
        (0, createPopup_1.createPopup)(args);
    });
    mainIpc.handleEventFromRenderer.addListener("notion:create-google-drive-picker", (_event, args) => {
        (0, createGoogleDrivePicker_1.createGoogleDrivePicker)(args);
    });
}
function setupWindowFeatureListeners() {
    mainIpc.handleEventFromRenderer.addListener("notion:set-window-title", (event, args) => {
    });
    mainIpc.handleEventFromRenderer.addListener("notion:set-badge", (event, args) => {
        if (electron_1.app.dock) {
            electron_1.app.dock.setBadge(args.badgeString);
            return;
        }
        const window = electron_1.BrowserWindow.fromWebContents(event.sender);
        if (!window) {
            return;
        }
        if (!window.setOverlayIcon) {
            return;
        }
        if (args.badgeString === "" || args.badgeImageDataUrl === null) {
            window.setOverlayIcon(null, "");
            return;
        }
        const pngData = electron_1.nativeImage
            .createFromDataURL(args.badgeImageDataUrl)
            .toPNG();
        const img = electron_1.nativeImage.createFromBuffer(pngData, {
            scaleFactor: args.devicePixelRatio,
        });
        window.setOverlayIcon(img, `${args.badgeString} unread notifications`);
    });
    mainIpc.handleEventFromRenderer.addListener("notion:clear-browser-history", (event) => {
        event.sender.clearHistory();
    });
    mainIpc.handleEventFromRenderer.addListener("notion:open-dev-tools", event => {
        event.sender.openDevTools();
    });
    mainIpc.handleEventFromRenderer.addListener("notion:download-url", (event, args) => {
        event.sender.downloadURL(args.url);
    });
    mainIpc.handleEventFromRenderer.addListener("notion:open-external-url", (event, args) => {
        const { url } = args;
        const sanitizedUrl = urlHelpers.sanitizeUrlStrict(url);
        if (sanitizedUrl) {
            void electron_1.shell.openExternal(url);
        }
    });
    mainIpc.handleRequestFromRenderer.addListener("notion:ready", event => {
        return Promise.resolve({ value: undefined });
    });
    mainIpc.handleEventFromRenderer.addListener("notion:alt-key-down", event => {
        var _a;
        (_a = AppController_1.appController
            .getWindowControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.maybeAddWindowsMenuBarSpacing();
    });
}
function setupBroadcastListener() {
    mainIpc.handleEventFromRenderer.addListener("notion:broadcast", (event, args) => {
        const senderWindow = electron_1.BrowserWindow.fromWebContents(event.sender);
        if (!senderWindow) {
            return;
        }
        electron_1.BrowserWindow.getAllWindows().forEach(window => {
            var _a, _b;
            if (senderWindow.id !== window.id) {
                (_b = (_a = AppController_1.appController
                    .getWindowControllerForWebContents(window.webContents)) === null || _a === void 0 ? void 0 : _a.getActiveTabController()) === null || _b === void 0 ? void 0 : _b.broadcast(args);
            }
        });
    });
}
