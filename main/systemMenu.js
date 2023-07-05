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
exports.setupSystemMenu = void 0;
const electron_1 = require("electron");
const fs_extra_1 = __importDefault(require("fs-extra"));
const config_1 = __importDefault(require("../config"));
const notion_intl_1 = require("notion-intl");
const debugMenu_1 = require("./debugMenu");
const AppController_1 = require("./AppController");
const assetCache_1 = require("./assetCache");
const tracing = __importStar(require("./tracing"));
const troubleshooting = __importStar(require("./troubleshooting"));
const menuMessages = (0, notion_intl_1.defineMessages)({
    fileMenuTitle: {
        id: "desktopTopbar.fileMenu.title",
        defaultMessage: "File",
    },
    editMenuTitle: {
        id: "desktopTopbar.editMenu.title",
        defaultMessage: "Edit",
    },
    viewMenuTitle: {
        id: "desktopTopbar.viewMenu.title",
        defaultMessage: "View",
    },
    historyMenuTitle: {
        id: "desktopTopbar.historyMenu.title",
        defaultMessage: "History",
        description: "Menu for navigating the history of Notion documents",
    },
    windowMenuTitle: {
        id: "desktopTopbar.windowMenu.title",
        defaultMessage: "Window",
    },
    helpTitle: {
        id: "desktopTopbar.helpMenu.title",
        defaultMessage: "Help",
    },
    troubleshootingTitle: {
        id: "desktopTopbar.troubleshootingMenu.title",
        defaultMessage: "Troubleshooting",
        description: "The title of the menu that contains troubleshooting options",
    },
    newWindow: {
        id: "desktopTopbar.fileMenu.newWindow",
        defaultMessage: "New Window",
    },
    newTab: {
        id: "desktopTopbar.fileMenu.newTab",
        defaultMessage: "New Tab",
        description: "Menu item for opening a new tab in the current window",
    },
    closeTab: {
        id: "desktopTopbar.fileMenu.closeTab",
        defaultMessage: "Close Tab",
        description: "Menu item for closing the current tab in the current window",
    },
    closeWindow: {
        id: "desktopTopbar.fileMenu.close",
        defaultMessage: "Close Window",
    },
    quit: {
        id: "desktopTopbar.fileMenu.quit",
        defaultMessage: "Exit",
    },
    undo: {
        id: "desktopTopbar.editMenu.undo",
        defaultMessage: "Undo",
    },
    redo: {
        id: "desktopTopbar.editMenu.redo",
        defaultMessage: "Redo",
    },
    cut: {
        id: "desktopTopbar.editMenu.cut",
        defaultMessage: "Cut",
    },
    copy: {
        id: "desktopTopbar.editMenu.copy",
        defaultMessage: "Copy",
    },
    paste: {
        id: "desktopTopbar.editMenu.paste",
        defaultMessage: "Paste",
    },
    pasteAndMatchStyle: {
        id: "desktopTopbar.editMenu.pasteAndMatchStyle",
        defaultMessage: "Paste and Match Style",
    },
    selectAll: {
        id: "desktopTopbar.editMenu.selectAll",
        defaultMessage: "Select All",
    },
    startSpeaking: {
        id: "desktopTopbar.editMenu.speech.startSpeaking",
        defaultMessage: "Start Speaking",
    },
    stopSpeaking: {
        id: "desktopTopbar.editMenu.speech.stopSpeaking",
        defaultMessage: "Stop Speaking",
    },
    speech: {
        id: "desktopTopbar.editMenu.speech",
        defaultMessage: "Speech",
    },
    reload: {
        id: "desktopTopbar.viewMenu.reload",
        defaultMessage: "Reload",
    },
    reloadAllTabs: {
        id: "desktopTopbar.viewMenu.reloadAllTabs",
        defaultMessage: "Reload All Tabs",
        description: "Menu item to let the user reload all of their tabs and not just the current one",
    },
    showHideSidebar: {
        id: "desktopTopbar.viewMenu.showHideSidebar",
        defaultMessage: "Show/Hide Sidebar",
        description: "Button to let the user show/hide the sidebar that shows pages",
    },
    togglefullscreen: {
        id: "desktopTopbar.viewMenu.togglefullscreen",
        defaultMessage: "Toggle Full Screen",
    },
    toggleDevTools: {
        id: "desktopTopbar.toggleDevTools",
        defaultMessage: "Toggle Developer Tools",
    },
    toggleWindowDevTools: {
        id: "desktopTopbar.toggleWindowDevTools",
        defaultMessage: "Toggle Window Developer Tools",
    },
    historyBack: {
        id: "desktopTopbar.historyMenu.historyBack",
        defaultMessage: "Back",
        description: "Move back one page (similar to the back button in a browser)",
    },
    historyForward: {
        id: "desktopTopbar.historyMenu.historyForward",
        defaultMessage: "Forward",
        description: "Move forward one page (similar to the forward button in a browser)",
    },
    maximize: {
        id: "desktopTopbar.windowMenu.maximize",
        defaultMessage: "Maximize",
    },
    minimize: {
        id: "desktopTopbar.windowMenu.minimize",
        defaultMessage: "Minimize",
    },
    zoom: {
        id: "desktopTopbar.windowMenu.zoom",
        defaultMessage: "Zoom",
    },
    showNextTab: {
        id: "desktopTopbar.windowMenu.showNextTab",
        defaultMessage: "Show Next Tab",
        description: "Shows the tab to the right of the currently shown one (or loops around)",
    },
    showPreviousTab: {
        id: "desktopTopbar.windowMenu.showPreviousTab",
        defaultMessage: "Show Previous Tab",
        description: "Shows the tab to the left of the currently shown one (or loops around)",
    },
    front: {
        id: "desktopTopbar.windowMenu.front",
        defaultMessage: "Front",
    },
    close: {
        id: "desktopTopbar.windowMenu.close",
        defaultMessage: "Close",
    },
    help: {
        id: "desktopTopbar.helpMenu.openHelpAndSupport",
        defaultMessage: "Open help & documentation",
    },
    showLogsInFinder: {
        id: "desktopTopbar.helpMenu.showLogsInFinder",
        defaultMessage: "Show logs in Finder",
        description: "Used as the label for a button that shows the logs in macOS Finder",
    },
    showLogsInExplorer: {
        id: "desktopTopbar.helpMenu.showLogsInExplorer",
        defaultMessage: "Show logs in Explorer",
        description: "Used as the label for a button that shows the logs in Windows Explorer",
    },
    recordPerformanceTrace: {
        id: "desktopTopbar.helpMenu.recordPerformanceTrace",
        defaultMessage: "Record performance trace",
        description: "Used as the label for a button that triggers a performance trace recording",
    },
    recordPerformanceTraceConfirm: {
        id: "desktopTopbar.helpMenu.recordPerformanceTraceConfirm",
        defaultMessage: "Do you want to record a performance trace for the next 30 seconds? Once done, it will be placed in your Downloads folder.",
        description: "Label for the text field in a confirmation dialog that triggers a performance trace recording",
    },
    recordPerformanceTraceConfirmTitle: {
        id: "desktopTopbar.helpMenu.recordPerformanceTraceConfirmTitle",
        defaultMessage: "Record a performance trace?",
        description: "Label for the title field in a confirmation dialog that triggers a performance trace recording",
    },
    recordPerformanceTraceConfirmOk: {
        id: "desktopTopbar.helpMenu.recordPerformanceTraceConfirmOk",
        defaultMessage: "Record performance trace",
        description: "Label for the 'ok' button in a confirmation dialog that triggers a performance trace recording",
    },
    recordPerformanceTraceConfirmCancel: {
        id: "desktopTopbar.helpMenu.recordPerformanceTraceConfirmCancel",
        defaultMessage: "Cancel",
        description: "Label for the 'cancel' button in a confirmation dialog that triggers a performance trace recording",
    },
    resetAndUpdateApp: {
        id: "desktopTopbar.appMenu.resetAndUpdateApp",
        defaultMessage: "Reset & Update App",
        description: "Button that refreshes all windows and updates the app to the " +
            "latest version.",
    },
    resetAndEraseAllLocalData: {
        id: "desktopTopbar.appMenu.resetAndEraseAllLocalData",
        defaultMessage: "Reset & Erase All Local Data",
        description: "Button that completely resets the app, as if it were just installed.",
    },
    preferences: {
        id: "desktopTopbar.appMenu.preferences",
        defaultMessage: "Preferences…",
        description: "Standard macOS 'Preferences' menu. The ellipsis should be the Unicode " +
            "U+2026 and not three periods. Ideally, if you have access to a Mac, " +
            "this word should match what is present in the menu of other apps.",
    },
    about: { id: "desktopTopbar.appMenu.about", defaultMessage: "About Notion" },
    services: {
        id: "desktopTopbar.appMenu.services",
        defaultMessage: "Services",
    },
    hide: { id: "desktopTopbar.appMenu.hide", defaultMessage: "Hide Notion" },
    hideOthers: {
        id: "desktopTopbar.appMenu.hideOthers",
        defaultMessage: "Hide Others",
    },
    unhide: { id: "desktopTopbar.appMenu.unhide", defaultMessage: "Show All" },
    quitMac: { id: "desktopTopbar.appMenu.quit", defaultMessage: "Quit" },
});
function escapeAllAmpersands(template) {
    const escapeAmpersand = (message) => {
        return message.replace(/&/g, "&&");
    };
    return template.map(menu => {
        const newMenu = Object.assign({}, menu);
        if (menu.label) {
            newMenu.label = escapeAmpersand(menu.label);
        }
        if (menu.submenu && Array.isArray(menu.submenu)) {
            newMenu.submenu = escapeAllAmpersands(menu.submenu);
        }
        return newMenu;
    });
}
function setupSystemMenu() {
    const isElectronMac = process.platform === "darwin";
    const intl = AppController_1.appController.intl;
    const fileMenu = buildFileMenu(intl);
    const editMenu = {
        role: "editMenu",
        label: intl.formatMessage(menuMessages.editMenuTitle),
        submenu: isElectronMac
            ? [
                {
                    role: "undo",
                    label: intl.formatMessage(menuMessages.undo),
                },
                {
                    role: "redo",
                    label: intl.formatMessage(menuMessages.redo),
                },
                { type: "separator" },
                {
                    role: "cut",
                    label: intl.formatMessage(menuMessages.cut),
                },
                {
                    role: "copy",
                    label: intl.formatMessage(menuMessages.copy),
                },
                {
                    role: "paste",
                    label: intl.formatMessage(menuMessages.paste),
                },
                {
                    role: "pasteAndMatchStyle",
                    label: intl.formatMessage(menuMessages.pasteAndMatchStyle),
                },
                {
                    role: "selectAll",
                    label: intl.formatMessage(menuMessages.selectAll),
                },
                { type: "separator" },
                {
                    label: intl.formatMessage(menuMessages.speech),
                    submenu: [
                        {
                            role: "startSpeaking",
                            label: intl.formatMessage(menuMessages.startSpeaking),
                        },
                        {
                            role: "stopSpeaking",
                            label: intl.formatMessage(menuMessages.stopSpeaking),
                        },
                    ],
                },
            ]
            : [
                {
                    role: "undo",
                    label: intl.formatMessage(menuMessages.undo),
                },
                {
                    role: "redo",
                    label: intl.formatMessage(menuMessages.redo),
                },
                { type: "separator" },
                {
                    role: "cut",
                    label: intl.formatMessage(menuMessages.cut),
                },
                {
                    role: "copy",
                    label: intl.formatMessage(menuMessages.copy),
                },
                {
                    role: "paste",
                    label: intl.formatMessage(menuMessages.paste),
                },
                { type: "separator" },
                {
                    role: "selectAll",
                    label: intl.formatMessage(menuMessages.selectAll),
                },
            ],
    };
    const viewMenu = {
        role: "viewMenu",
        label: intl.formatMessage(menuMessages.viewMenuTitle),
        submenu: [
            {
                label: intl.formatMessage(menuMessages.reload),
                accelerator: "CmdOrCtrl+R",
                click() {
                    var _a;
                    if (assetCache_1.assetCache.isUpdateAvailable()) {
                        void assetCache_1.assetCache.syncVersions().then(() => {
                            AppController_1.appController.refreshAll(true);
                        });
                    }
                    else {
                        (_a = AppController_1.appController.getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.reloadActiveTab();
                    }
                },
            },
            {
                label: intl.formatMessage(menuMessages.reloadAllTabs),
                click() {
                    void assetCache_1.assetCache.syncVersions().then(() => {
                        AppController_1.appController.refreshAll(true);
                    });
                },
            },
            {
                label: intl.formatMessage(menuMessages.toggleDevTools),
                accelerator: isElectronMac ? "Alt+Command+I" : "Ctrl+Shift+I",
                click() {
                    var _a;
                    const notionController = (_a = AppController_1.appController
                        .getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.getActiveTabController();
                    if (!notionController) {
                        return;
                    }
                    notionController.toggleDevTools();
                },
            },
            { type: "separator" },
            {
                label: intl.formatMessage(menuMessages.showHideSidebar),
                accelerator: "CmdOrCtrl+\\",
                click() {
                    var _a, _b;
                    (_b = (_a = AppController_1.appController
                        .getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.getActiveTabController()) === null || _b === void 0 ? void 0 : _b.toggleSidebarInNotion();
                },
            },
            { type: "separator" },
            {
                role: "togglefullscreen",
                label: intl.formatMessage(menuMessages.togglefullscreen),
            },
        ],
    };
    const historyMenu = {
        label: intl.formatMessage(menuMessages.historyMenuTitle),
        submenu: [
            {
                accelerator: "CmdOrCtrl+[",
                label: intl.formatMessage(menuMessages.historyBack),
                click() {
                    var _a, _b;
                    (_b = (_a = AppController_1.appController
                        .getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.getActiveTabController()) === null || _b === void 0 ? void 0 : _b.goBack();
                },
            },
            {
                accelerator: "CmdOrCtrl+]",
                label: intl.formatMessage(menuMessages.historyForward),
                click() {
                    var _a, _b;
                    (_b = (_a = AppController_1.appController
                        .getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.getActiveTabController()) === null || _b === void 0 ? void 0 : _b.goForward();
                },
            },
        ],
    };
    const windowMenu = {
        role: "windowMenu",
        label: intl.formatMessage(menuMessages.windowMenuTitle),
        submenu: isElectronMac
            ? [
                {
                    role: "minimize",
                    label: intl.formatMessage(menuMessages.minimize),
                },
                {
                    role: "zoom",
                    label: intl.formatMessage(menuMessages.zoom),
                },
                { type: "separator" },
                {
                    accelerator: "Ctrl+Shift+Tab",
                    label: intl.formatMessage(menuMessages.showPreviousTab),
                    click() {
                        var _a;
                        (_a = AppController_1.appController.getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.showPreviousTab();
                    },
                },
                {
                    accelerator: "Ctrl+Tab",
                    label: intl.formatMessage(menuMessages.showNextTab),
                    click() {
                        var _a;
                        (_a = AppController_1.appController.getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.showNextTab();
                    },
                },
                { type: "separator" },
                ...generateMacOnlyHiddenTabSwitchingShortcuts(intl),
                ...generateHiddenTabSwitchingShortcuts(),
                { role: "front" },
            ]
            : [
                {
                    role: "minimize",
                    label: intl.formatMessage(menuMessages.minimize),
                },
                {
                    accelerator: "Ctrl+Shift+Tab",
                    label: intl.formatMessage(menuMessages.showPreviousTab),
                    click() {
                        var _a;
                        (_a = AppController_1.appController.getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.showPreviousTab();
                    },
                },
                {
                    accelerator: "Ctrl+Tab",
                    label: intl.formatMessage(menuMessages.showNextTab),
                    click() {
                        var _a;
                        (_a = AppController_1.appController.getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.showNextTab();
                    },
                },
                {
                    label: intl.formatMessage(menuMessages.maximize),
                    click(item, focusedWindow) {
                        if (focusedWindow) {
                            if (focusedWindow.isMaximized()) {
                                focusedWindow.unmaximize();
                            }
                            else {
                                focusedWindow.maximize();
                            }
                        }
                    },
                },
                ...generateHiddenTabSwitchingShortcuts(),
            ],
    };
    const helpMenu = {
        role: "help",
        label: intl.formatMessage(menuMessages.helpTitle),
        submenu: [
            {
                label: intl.formatMessage(menuMessages.troubleshootingTitle),
                submenu: [
                    {
                        label: process.platform === "win32"
                            ? intl.formatMessage(menuMessages.showLogsInExplorer)
                            : intl.formatMessage(menuMessages.showLogsInFinder),
                        async click(_item, focusedWindow) {
                            await troubleshooting.showLogsInShell();
                        },
                    },
                    {
                        label: intl.formatMessage(menuMessages.recordPerformanceTrace),
                        async click(_item, focusedWindow) {
                            const { response } = await electron_1.dialog.showMessageBox({
                                title: intl.formatMessage(menuMessages.recordPerformanceTraceConfirmTitle),
                                type: "question",
                                textWidth: 300,
                                message: intl.formatMessage(menuMessages.recordPerformanceTraceConfirm),
                                buttons: [
                                    intl.formatMessage(menuMessages.recordPerformanceTraceConfirmCancel),
                                    intl.formatMessage(menuMessages.recordPerformanceTraceConfirmOk),
                                ],
                            });
                            if (response === 1) {
                                await tracing.recordTraceAndPackage(focusedWindow);
                            }
                        },
                    },
                ],
            },
            {
                type: "separator",
            },
            {
                label: intl.formatMessage(menuMessages.help),
                click() {
                    void electron_1.shell.openExternal(`${config_1.default.domainBaseUrl}/help`);
                },
            },
        ],
    };
    const appMenu = {
        role: "appMenu",
        submenu: [
            {
                role: "about",
                label: intl.formatMessage(menuMessages.about),
            },
            { type: "separator" },
            {
                label: intl.formatMessage(menuMessages.preferences),
                accelerator: "Cmd+,",
                click(item, focusedWindow) {
                    var _a, _b;
                    if (!focusedWindow) {
                        return;
                    }
                    (_b = (_a = AppController_1.appController
                        .getWindowControllerForWebContents(focusedWindow.webContents)) === null || _a === void 0 ? void 0 : _a.getActiveTabController()) === null || _b === void 0 ? void 0 : _b.openSettings();
                },
            },
            { type: "separator" },
            {
                label: intl.formatMessage(menuMessages.resetAndUpdateApp),
                accelerator: "CmdOrCtrl+Shift+R",
                async click() {
                    await assetCache_1.assetCache.reset();
                    void assetCache_1.assetCache.checkForUpdates();
                    AppController_1.appController.refreshAll(true);
                },
            },
            {
                label: intl.formatMessage(menuMessages.resetAndEraseAllLocalData),
                async click(item, focusedWindow) {
                    await fs_extra_1.default.remove(electron_1.app.getPath("userData"));
                    electron_1.app.relaunch();
                    electron_1.app.exit();
                },
            },
            { type: "separator" },
            {
                role: "services",
                label: intl.formatMessage(menuMessages.services),
            },
            { type: "separator" },
            {
                role: "hide",
                label: intl.formatMessage(menuMessages.hide),
            },
            {
                role: "hideOthers",
                label: intl.formatMessage(menuMessages.hideOthers),
            },
            {
                role: "unhide",
                label: intl.formatMessage(menuMessages.unhide),
            },
            { type: "separator" },
            {
                role: "quit",
                label: intl.formatMessage(menuMessages.quitMac),
            },
        ],
    };
    const template = [
        fileMenu,
        editMenu,
        viewMenu,
        historyMenu,
        windowMenu,
        helpMenu,
    ];
    if (isElectronMac) {
        template.unshift(appMenu);
    }
    if ((0, debugMenu_1.shouldShowDebugMenu)()) {
        template.push((0, debugMenu_1.getDebugMenu)());
    }
    const menu = electron_1.Menu.buildFromTemplate(escapeAllAmpersands(template));
    electron_1.Menu.setApplicationMenu(menu);
    if (isElectronMac) {
        const dockMenu = electron_1.Menu.buildFromTemplate([
            {
                label: intl.formatMessage(menuMessages.newWindow),
                click: () => AppController_1.appController.createWindow(),
            },
        ]);
        electron_1.app.dock.setMenu(dockMenu);
    }
}
exports.setupSystemMenu = setupSystemMenu;
function buildFileMenu(intl) {
    return {
        role: "fileMenu",
        label: intl.formatMessage(menuMessages.fileMenuTitle),
        submenu: process.platform === "darwin"
            ? buildMacFileSubMenu(intl)
            : buildWindowsFileSubMenu(intl),
    };
}
function buildMacFileSubMenu(intl) {
    const result = [
        {
            label: intl.formatMessage(menuMessages.newWindow),
            accelerator: "CmdOrCtrl+Shift+N",
            click: () => AppController_1.appController.createWindow(),
        },
    ];
    addTabsFileSubMenuItems(result, intl);
    return result;
}
function buildWindowsFileSubMenu(intl) {
    const result = [
        {
            label: intl.formatMessage(menuMessages.newWindow),
            accelerator: "CmdOrCtrl+Shift+N",
            click: () => {
                AppController_1.appController.createWindow();
            },
        },
    ];
    addTabsFileSubMenuItems(result, intl);
    result.push({ type: "separator" });
    result.push({
        label: intl.formatMessage(menuMessages.resetAndUpdateApp),
        accelerator: "CmdOrCtrl+Shift+R",
        async click() {
            await assetCache_1.assetCache.reset();
            void assetCache_1.assetCache.checkForUpdates();
            AppController_1.appController.refreshAll(true);
        },
    });
    result.push({ type: "separator" });
    result.push({
        role: "quit",
        label: intl.formatMessage(menuMessages.quit),
    });
    return result;
}
function addTabsFileSubMenuItems(submenu, intl) {
    submenu.unshift({
        label: intl.formatMessage(menuMessages.newTab),
        accelerator: "CmdOrCtrl+T",
        click: () => {
            var _a;
            (_a = AppController_1.appController.getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.newTab({
                makeActiveTab: true,
                position: { type: "start" },
            });
        },
    });
    submenu.push({ type: "separator" });
    submenu.push({
        label: intl.formatMessage(menuMessages.closeTab),
        accelerator: "CmdOrCtrl+W",
        click: () => {
            var _a;
            (_a = AppController_1.appController.getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.closeActiveTab();
        },
    });
    submenu.push({
        accelerator: "CmdOrCtrl+Shift+W",
        label: intl.formatMessage(menuMessages.closeWindow),
        click(_item, browserWindow) {
            const focusedWindowCtrl = AppController_1.appController.getFocusedWindowController();
            if (focusedWindowCtrl) {
                return focusedWindowCtrl.close();
            }
            if (browserWindow) {
                return browserWindow.close();
            }
        },
    });
}
function generateMacOnlyHiddenTabSwitchingShortcuts(intl) {
    return [
        {
            visible: false,
            accelerator: "Command+Option+Left",
            acceleratorWorksWhenHidden: true,
            label: intl.formatMessage(menuMessages.showPreviousTab),
            click() {
                var _a;
                (_a = AppController_1.appController.getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.showPreviousTab();
            },
        },
        {
            visible: false,
            accelerator: "Command+Option+Right",
            acceleratorWorksWhenHidden: true,
            label: intl.formatMessage(menuMessages.showNextTab),
            click() {
                var _a;
                (_a = AppController_1.appController.getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.showNextTab();
            },
        },
        {
            visible: false,
            accelerator: "Command+Shift+[",
            acceleratorWorksWhenHidden: true,
            label: intl.formatMessage(menuMessages.showPreviousTab),
            click() {
                var _a;
                (_a = AppController_1.appController.getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.showPreviousTab();
            },
        },
        {
            visible: false,
            accelerator: "Command+Shift+]",
            acceleratorWorksWhenHidden: true,
            label: intl.formatMessage(menuMessages.showNextTab),
            click() {
                var _a;
                (_a = AppController_1.appController.getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.showNextTab();
            },
        },
    ];
}
function generateHiddenTabSwitchingShortcuts() {
    const result = [];
    for (let i = 1; i <= 8; i++) {
        result.push({
            visible: false,
            label: `Select tab number ${i}`,
            accelerator: `CmdOrCtrl+${i}`,
            acceleratorWorksWhenHidden: true,
            click: () => {
                var _a;
                (_a = AppController_1.appController
                    .getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.makeTabActiveIgnoringInvalidIndices(i - 1);
            },
        });
    }
    result.push({
        visible: false,
        label: "Select last tab",
        accelerator: `CmdOrCtrl+9`,
        acceleratorWorksWhenHidden: true,
        click: () => {
            var _a;
            (_a = AppController_1.appController.getFocusedWindowController()) === null || _a === void 0 ? void 0 : _a.showLastTab();
        },
    });
    return result;
}
