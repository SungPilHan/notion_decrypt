"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowController = void 0;
const lodash_1 = __importDefault(require("lodash"));
const electron_1 = require("electron");
const TabController_1 = require("./TabController");
const path_1 = __importDefault(require("path"));
const electron_log_1 = __importDefault(require("electron-log"));
const electron_window_state_1 = __importDefault(require("electron-window-state"));
const state_1 = require("./state");
const TabBarState_1 = require("../helpers/TabBarState");
const notion_intl_1 = require("notion-intl");
const colorHelpers_1 = require("../helpers/colorHelpers");
const schemeHelpers_1 = require("../shared/schemeHelpers");
const config_1 = __importDefault(require("../config"));
const AppController_1 = require("./AppController");
const windowControllerMessages = (0, notion_intl_1.defineMessages)({
    loadingErrorMessage: {
        id: "window.loadingError.message",
        defaultMessage: "Error loading Notion, connect to the internet to get started.",
        description: "Dialog message shown to the user when there's an error loading a page.",
    },
    loadingErrorReload: {
        id: "window.loadingError.reload",
        defaultMessage: "Reload",
        description: "Dialog action allowing the user to reload page that previous had a loading error",
    },
    loadingErrorCancel: {
        id: "window.tabLoadingError.cancel",
        defaultMessage: "Cancel",
        description: "Dialog action allowing the user to dismiss the loading error dialog",
    },
    tabMenuCopyLink: {
        id: "window.tabMenu.copyLink",
        defaultMessage: "Copy Link",
        description: "Right-click menu item to copy the URL for a Notion page",
    },
    tabMenuRefreshTab: {
        id: "window.tabMenu.refresh",
        defaultMessage: "Refresh Tab",
        description: "Right-click menu item to refresh a tab's page contents",
    },
    tabMenuDuplicateTab: {
        id: "window.tabMenu.duplicateTab",
        defaultMessage: "Duplicate Tab",
        description: "Right-click menu item to make a new tab with the same page (i.e. duplicate it)",
    },
    tabMenuMoveToNewWindow: {
        id: "window.tabMenu.moveToNewWindow",
        defaultMessage: "Move Tab to New Window",
        description: "Right-click menu item to make open a new window with this tab",
    },
    tabMenuCloseTab: {
        id: "window.tabMenu.closeTab",
        defaultMessage: "Close Tab",
        description: "Right-click menu item to close a tab",
    },
    tabMenuCloseOtherTabs: {
        id: "window.tabMenu.closeOtherTabs",
        defaultMessage: "Close Other Tabs",
        description: "Right-click menu item to close all tabs except for the one clicked",
    },
    tabMenuCloseTabsToLeft: {
        id: "window.tabMenu.closeTabsToLeft",
        defaultMessage: "Close Tabs to the Left",
        description: "Right-click menu item to close tabs to the left of the current one",
    },
    tabMenuCloseTabsToRight: {
        id: "window.tabMenu.closeTabsToRight",
        defaultMessage: "Close Tabs to the Right",
        description: "Right-click menu item to close tabs to the right of the current one",
    },
});
const TRAFFIC_LIGHT_POSITION_WITH_TABS = { x: 10, y: 10 };
class WindowController {
    static newInstanceWithUrl(windowId, intl, initialUrl, startsAsFullscreen) {
        const initialTabController = TabController_1.TabController.newInstance((0, state_1.createTabId)(), initialUrl);
        return new WindowController(windowId, intl, initialTabController, startsAsFullscreen);
    }
    static newInstanceWithController(windowId, intl, initialController, startsAsFullscreen) {
        return new WindowController(windowId, intl, initialController, startsAsFullscreen);
    }
    constructor(windowId, intl, initialTabController, startAsFullscreen) {
        this.tabControllers = [];
        this.tabStateUnsubscribe = undefined;
        this.windowId = windowId;
        this.intl = intl;
        this.windowStateKeeper = (0, electron_window_state_1.default)({
            defaultWidth: 1320,
            defaultHeight: 860,
        });
        const desiredWindowBounds = WindowController.getNewWindowRectFromFocusedWindow(this.windowStateKeeper);
        const windowCreationArgs = Object.assign(Object.assign({}, desiredWindowBounds), { show: false, backgroundColor: colorHelpers_1.electronColors.notionBackground[state_1.Store.getState().app.theme.mode], titleBarStyle: "hiddenInset", trafficLightPosition: TRAFFIC_LIGHT_POSITION_WITH_TABS, autoHideMenuBar: true, minWidth: 640, minHeight: 480, webPreferences: {
                preload: path_1.default.resolve(__dirname, "../renderer/index.js"),
                sandbox: false,
                contextIsolation: false,
            } });
        this.browserWindow = new electron_1.BrowserWindow(windowCreationArgs);
        if (startAsFullscreen || this.windowStateKeeper.isFullScreen) {
            this.browserWindow.setFullScreen(true);
        }
        this.browserWindow.addListener("app-command", (e, cmd) => this.handleAppCommandNavigation(e, cmd));
        this.browserWindow.addListener("swipe", (e, dir) => this.handleSwipeNavigation(e, dir));
        this.browserWindow.addListener("enter-full-screen", () => {
            state_1.Store.dispatch((0, state_1.updateIsFullScreen)({
                windowId: this.windowId,
                isFullScreen: true,
            }));
            this.handleFullscreenEvent();
        });
        this.browserWindow.addListener("leave-full-screen", () => {
            state_1.Store.dispatch((0, state_1.updateIsFullScreen)({
                windowId: this.windowId,
                isFullScreen: false,
            }));
            this.handleFullscreenEvent();
        });
        this.browserWindow.addListener("enter-html-full-screen", () => {
            state_1.Store.dispatch((0, state_1.updateIsHtmlFullScreen)({
                windowId: this.windowId,
                isHtmlFullScreen: true,
            }));
            this.handleFullscreenEvent();
        });
        this.browserWindow.addListener("leave-html-full-screen", () => {
            state_1.Store.dispatch((0, state_1.updateIsHtmlFullScreen)({
                windowId: this.windowId,
                isHtmlFullScreen: false,
            }));
            this.handleFullscreenEvent();
        });
        this.browserWindow.addListener("resize", () => this.handleResize());
        this.browserWindow.on("close", () => this.handleClose());
        this.tabControllers.push(initialTabController);
        this.activeTabController = initialTabController;
        state_1.Store.dispatch((0, state_1.initializeWindowState)({
            windowId: this.windowId,
            initialTabId: initialTabController.tabId,
            isFullScreen: startAsFullscreen,
            isHtmlFullScreen: false,
            isRendererVisible: true,
        }));
        this.activeTabController.attachToWindow(this.windowId, this.browserWindow);
        this.activeTabController.bringToFront();
        void this.activeTabController.initialReadyStatePromise.then(() => {
            this.browserWindow.once("show", () => {
                if (this.activeTabController === initialTabController) {
                    this.activeTabController.focus();
                }
            });
            this.browserWindow.show();
        });
        this.activeTabController.initialLoadingStatePromise.catch(() => {
            if (this.activeTabController === initialTabController) {
                this.handleTabLoadingError();
            }
        });
        this.tabBarLoaded = false;
        this.updateState();
        this.appStateUnsubscribe = (0, state_1.subscribeToSelector)(state_1.selectAppState, () => this.updateState());
        this.windowStateUnsubscribe = (0, state_1.subscribeToSelector)(state => (0, state_1.selectWindowState)(state, windowId), () => this.updateState());
        this.subscribeToTabStates();
    }
    isFullScreen() {
        return this.browserWindow.isFullScreen();
    }
    newTab(args) {
        const { initialUrl, makeActiveTab, position } = args;
        AppController_1.appController.trackAnalyticsEvent("electron_new_tab");
        const alwaysDefinedInitialUrl = initialUrl ||
            (0, schemeHelpers_1.getSchemeUrl)({
                httpUrl: config_1.default.domainBaseUrl,
                protocol: config_1.default.protocol,
            });
        let insertionIndex = -1;
        if (position.type === "start") {
            insertionIndex = 0;
        }
        else if (position.type === "after") {
            insertionIndex =
                this.tabControllers.findIndex(controller => controller.tabId === position.parentTabId) + 1;
        }
        else if (position.type === "after-children") {
            insertionIndex = this.computeAfterChildrenInsertionIndex(position.parentTabId);
        }
        else if (position.type === "end") {
            insertionIndex = this.tabControllers.length;
        }
        if (insertionIndex === -1) {
            insertionIndex = this.tabControllers.length;
        }
        const newTabController = TabController_1.TabController.newInstance((0, state_1.createTabId)(), alwaysDefinedInitialUrl);
        this.tabControllers.splice(insertionIndex, 0, newTabController);
        this.subscribeToTabStates();
        newTabController.attachToWindow(this.windowId, this.browserWindow);
        if (makeActiveTab) {
            this.activeTabController.bringToFront();
            this.activeTabController = newTabController;
            void this.activeTabController.initialReadyStatePromise.then(() => {
                this.activeTabController.bringToFront();
            });
            this.activeTabController.initialLoadingStatePromise.catch(() => {
                if (this.activeTabController === newTabController) {
                    this.handleTabLoadingError();
                }
            });
        }
        else {
            this.activeTabController.bringToFront();
        }
        state_1.Store.dispatch((0, state_1.addTabToWindow)({
            windowId: this.windowId,
            tabId: newTabController.tabId,
            index: insertionIndex,
            makeActiveTab,
            parentTabId: position.type === "after-children" ? position.parentTabId : undefined,
        }));
    }
    computeAfterChildrenInsertionIndex(parentTabId) {
        var _a;
        const windowTabState = (_a = state_1.Store.getState().windows[this.windowId]) === null || _a === void 0 ? void 0 : _a.tabs;
        if (!windowTabState) {
            return -1;
        }
        const parentIdSet = new Set();
        parentIdSet.add(parentTabId);
        const parentIndex = windowTabState.findIndex(tab => tab.tabId === parentTabId);
        if (parentIndex === -1) {
            return -1;
        }
        for (let i = parentIndex + 1; i < windowTabState.length; i++) {
            const tab = windowTabState[i];
            if (tab.parentTabId && parentIdSet.has(tab.parentTabId)) {
                parentIdSet.add(tab.tabId);
                continue;
            }
            return i;
        }
        return -1;
    }
    openTabInNewWindow(tabIndex) {
        const activeTabIndex = this.tabControllers.findIndex(controller => controller === this.activeTabController);
        if (activeTabIndex === -1) {
            throw new Error(`Active tab controller isn't in controller array`);
        }
        if (tabIndex === activeTabIndex) {
            const newActiveTabIndex = tabIndex === this.tabControllers.length - 1
                ? tabIndex - 1
                : tabIndex + 1;
            this.activeTabController = this.tabControllers[newActiveTabIndex];
            this.activeTabController.attachToWindow(this.windowId, this.browserWindow);
            this.activeTabController.bringToFront();
        }
        const tabControllerToMove = this.tabControllers[tabIndex];
        tabControllerToMove.detachFromWindow();
        AppController_1.appController.createWindowForTabController(tabControllerToMove);
        this.tabControllers.splice(tabIndex, 1);
        this.subscribeToTabStates();
        state_1.Store.dispatch((0, state_1.removeTabFromWindow)({
            windowId: this.windowId,
            index: tabIndex,
            newActiveTabId: this.activeTabController.tabId,
        }));
    }
    reloadActiveTab() {
        const controllerToReload = this.activeTabController;
        this.activeTabController.reloadAtCurrentUrl().catch(() => {
            if (this.activeTabController === controllerToReload) {
                this.handleTabLoadingError();
            }
        });
    }
    loadUrlInActiveTab(url) {
        const controllerToLoad = this.activeTabController;
        this.activeTabController.loadUrl(url).catch(() => {
            if (this.activeTabController === controllerToLoad) {
                this.handleTabLoadingError();
            }
        });
    }
    makeTabActive(tab) {
        if (typeof tab !== "number") {
            if (tab === this.activeTabController) {
                return;
            }
            if (!this.tabControllers.find(tc => tc === tab)) {
                throw new Error("Cannot focus on this tab, because it was no longer in the tabControllers of the window");
            }
            this.activeTabController = tab;
        }
        else {
            if (this.tabControllers[tab] === this.activeTabController) {
                return;
            }
            if (this.tabControllers.length <= tab) {
                throw new Error(`Cannot focus tab at index ${tab} because there are only ${this.tabControllers.length} tabs`);
            }
            this.activeTabController = this.tabControllers[tab];
        }
        state_1.Store.dispatch((0, state_1.updateActiveTabId)({
            windowId: this.windowId,
            activeTabId: this.activeTabController.tabId,
        }));
        this.activeTabController.attachToWindow(this.windowId, this.browserWindow);
        this.activeTabController.bringToFront();
        this.activeTabController.focus();
        if (this.activeTabController.loadingState === "errored") {
            const currentActiveTabController = this.activeTabController;
            this.activeTabController.reloadAtCurrentUrl().catch(() => {
                if (currentActiveTabController === this.activeTabController) {
                    this.handleTabLoadingError();
                }
            });
        }
        this.updateState();
    }
    makeTabActiveIgnoringInvalidIndices(tabIndex) {
        if (tabIndex >= this.tabControllers.length || tabIndex < 0) {
            return;
        }
        this.makeTabActive(tabIndex);
    }
    showPreviousTab() {
        if (this.tabControllers.length === 0) {
            return;
        }
        const activeTabIndex = this.tabControllers.findIndex(controller => controller.tabId === this.activeTabController.tabId);
        if (activeTabIndex === -1) {
            throw new Error(`Active tab controller isn't in controller array`);
        }
        this.makeTabActive(activeTabIndex === 0 ? this.tabControllers.length - 1 : activeTabIndex - 1);
    }
    showNextTab() {
        if (this.tabControllers.length === 0) {
            return;
        }
        const activeTabIndex = this.tabControllers.findIndex(controller => controller.tabId === this.activeTabController.tabId);
        if (activeTabIndex === -1) {
            throw new Error(`Active tab controller isn't in controller array`);
        }
        this.makeTabActive(activeTabIndex === this.tabControllers.length - 1 ? 0 : activeTabIndex + 1);
    }
    showLastTab() {
        this.makeTabActive(this.tabControllers.length - 1);
    }
    closeActiveTab() {
        const activeTabIndex = this.tabControllers.findIndex(controller => controller.tabId === this.activeTabController.tabId);
        if (activeTabIndex === -1) {
            throw new Error(`Active tab controller isn't in controller array`);
        }
        this.closeTab(activeTabIndex);
    }
    closeTab(tabIndex) {
        if (this.tabControllers.length === 1) {
            this.browserWindow.close();
            return;
        }
        const activeTabIndex = this.tabControllers.findIndex(controller => controller.tabId === this.activeTabController.tabId);
        if (activeTabIndex === -1) {
            throw new Error(`Active tab controller isn't in controller array`);
        }
        if (tabIndex === activeTabIndex) {
            const newActiveTabIndex = tabIndex === this.tabControllers.length - 1
                ? tabIndex - 1
                : tabIndex + 1;
            this.makeTabActive(newActiveTabIndex);
        }
        else {
            this.activeTabController.focus();
        }
        const controllerToDestroy = this.tabControllers[tabIndex];
        this.tabControllers.splice(tabIndex, 1);
        this.subscribeToTabStates();
        state_1.Store.dispatch((0, state_1.removeTabFromWindow)({
            windowId: this.windowId,
            index: tabIndex,
            newActiveTabId: this.activeTabController.tabId,
        }));
        controllerToDestroy.destroy();
    }
    closeOtherTabs(tabIndex) {
        this.makeTabActive(tabIndex);
        const controllersToDestroy = this.tabControllers.filter(controller => {
            return controller !== this.activeTabController;
        });
        this.tabControllers = [this.activeTabController];
        this.subscribeToTabStates();
        state_1.Store.dispatch((0, state_1.closeAllNonActiveTabs)({
            windowId: this.windowId,
        }));
        controllersToDestroy.forEach(controller => {
            controller.destroy();
        });
    }
    closeTabsToRight(tabIndex) {
        const activeTabIndex = this.tabControllers.findIndex(controller => controller.tabId === this.activeTabController.tabId);
        if (activeTabIndex === -1) {
            throw new Error(`Active tab controller isn't in controller array`);
        }
        if (tabIndex < activeTabIndex) {
            this.makeTabActive(tabIndex);
        }
        const controllersToDestroy = this.tabControllers.slice(tabIndex + 1);
        this.tabControllers = this.tabControllers.slice(0, tabIndex + 1);
        this.subscribeToTabStates();
        state_1.Store.dispatch((0, state_1.sliceTabRange)({
            windowId: this.windowId,
            startIndex: 0,
            endIndex: tabIndex + 1,
        }));
        controllersToDestroy.forEach(controller => {
            controller.destroy();
        });
    }
    closeTabsToLeft(tabIndex) {
        const activeTabIndex = this.tabControllers.findIndex(controller => controller.tabId === this.activeTabController.tabId);
        if (activeTabIndex === -1) {
            throw new Error(`Active tab controller isn't in controller array`);
        }
        if (tabIndex > activeTabIndex) {
            this.makeTabActive(tabIndex);
        }
        const controllersToDestroy = this.tabControllers.slice(0, tabIndex);
        this.tabControllers = this.tabControllers.slice(tabIndex);
        this.subscribeToTabStates();
        state_1.Store.dispatch((0, state_1.sliceTabRange)({
            windowId: this.windowId,
            startIndex: tabIndex,
        }));
        controllersToDestroy.forEach(controller => {
            controller.destroy();
        });
    }
    showTabMenu(args) {
        const { tabIndex, clientX, clientY } = args;
        const tabController = this.tabControllers[tabIndex];
        const menuTemplate = [
            {
                label: this.intl.formatMessage(windowControllerMessages.tabMenuCopyLink),
                click: () => {
                    tabController.copyHttpLinkToClipboard();
                },
            },
            {
                label: this.intl.formatMessage(windowControllerMessages.tabMenuRefreshTab),
                click: () => {
                    tabController
                        .reloadAtCurrentUrl()
                        .catch(() => this.handleTabLoadingError());
                },
            },
            {
                type: "separator",
            },
            {
                label: this.intl.formatMessage(windowControllerMessages.tabMenuDuplicateTab),
                click: () => {
                    this.newTab({
                        initialUrl: tabController.getUrl(),
                        makeActiveTab: true,
                        position: {
                            type: "after",
                            parentTabId: tabController.tabId,
                        },
                    });
                },
            },
            {
                label: this.intl.formatMessage(windowControllerMessages.tabMenuMoveToNewWindow),
                click: () => {
                    this.openTabInNewWindow(tabIndex);
                },
                enabled: this.tabControllers.length > 1,
            },
            {
                type: "separator",
            },
            {
                label: this.intl.formatMessage(windowControllerMessages.tabMenuCloseTab),
                click: () => {
                    this.closeTab(tabIndex);
                },
            },
            {
                label: this.intl.formatMessage(windowControllerMessages.tabMenuCloseOtherTabs),
                click: () => {
                    this.closeOtherTabs(tabIndex);
                },
                enabled: this.tabControllers.length > 1,
            },
            {
                label: this.intl.formatMessage(windowControllerMessages.tabMenuCloseTabsToLeft),
                click: () => {
                    this.closeTabsToLeft(tabIndex);
                },
                enabled: this.tabControllers.length > 1 && tabIndex !== 0,
            },
            {
                label: this.intl.formatMessage(windowControllerMessages.tabMenuCloseTabsToRight),
                click: () => {
                    this.closeTabsToRight(tabIndex);
                },
                enabled: this.tabControllers.length > 1 &&
                    tabIndex !== this.tabControllers.length - 1,
            },
        ];
        electron_1.Menu.buildFromTemplate(menuTemplate).popup({
            window: this.browserWindow,
            x: clientX,
            y: clientY,
        });
    }
    getTabControllerForWebContents(contents) {
        for (const tabController of this.tabControllers) {
            if (tabController.isManagerOf(contents)) {
                return tabController;
            }
        }
    }
    getActiveTabController() {
        return this.activeTabController;
    }
    getActiveTabUrl() {
        return this.activeTabController.getUrl();
    }
    isActiveTab(sender) {
        return this.activeTabController.isManagerOf(sender);
    }
    getTabControllerWithUrl(url) {
        const sortedTabControllers = lodash_1.default.compact([
            this.activeTabController,
            ...this.tabControllers.filter(tc => tc !== this.activeTabController),
        ]);
        for (const tabController of sortedTabControllers) {
            if (tabController.getUrl() === url) {
                return tabController;
            }
        }
    }
    hasMultipleTabs() {
        return this.tabControllers.length > 1;
    }
    openTabsConsole() {
        if (!this.tabBar) {
            return;
        }
        this.tabBar.webContents.openDevTools({
            mode: "detach",
        });
    }
    setRendererVisibility(isVisible) {
        state_1.Store.dispatch((0, state_1.updateIsRendererVisible)({
            windowId: this.windowId,
            isRendererVisible: isVisible,
        }));
    }
    setWindowSidebarState(sender, state) {
        if (this.activeTabController.isManagerOf(sender)) {
            state_1.Store.dispatch((0, state_1.updateWindowSidebarState)({
                windowId: this.windowId,
                sidebarState: state,
            }));
        }
    }
    updateState() {
        var _a;
        const appState = state_1.Store.getState().app;
        const windowState = state_1.Store.getState().windows[this.windowId];
        if (!windowState) {
            return;
        }
        this.browserWindow.setBackgroundColor(colorHelpers_1.electronColors.notionBackground[appState.theme.mode]);
        if (!this.tabBar) {
            this.setupTabBar(appState.theme.mode);
        }
        if (this.tabBar) {
            if (this.tabBarLoaded) {
                this.tabBar.setBounds({
                    x: 0,
                    y: 0,
                    height: Math.ceil(TabBarState_1.TAB_BAR_HEIGHT_PX * appState.zoomFactor),
                    width: this.browserWindow.getContentBounds().width,
                });
                this.tabBar.webContents.setZoomFactor(appState.zoomFactor);
            }
            this.tabBar.setBackgroundColor(colorHelpers_1.electronColors.tabBarBackground[appState.theme.mode]);
        }
        const tabState = state_1.Store.getState().tabs;
        if (!tabState) {
            return;
        }
        const activeTabTitle = (_a = tabState[this.activeTabController.tabId]) === null || _a === void 0 ? void 0 : _a.title;
        if (activeTabTitle) {
            this.browserWindow.setTitle(activeTabTitle);
        }
        const tabs = this.tabControllers.map(controller => {
            const storeState = tabState[controller.tabId];
            if (storeState) {
                return {
                    active: controller === this.activeTabController,
                    title: tabState[controller.tabId].title,
                    favicon: tabState[controller.tabId].favicon,
                };
            }
            else {
                return {
                    active: controller === this.activeTabController,
                };
            }
        });
        this.sendToTabBar("tabs:set-state", {
            tabs,
            locale: AppController_1.appController.notionLocale,
            themeMode: appState.theme.mode,
            isWindows: process.platform === "win32",
            isFullscreen: this.browserWindow.isFullScreen(),
            canGoBack: this.activeTabController.canGoBack(),
            canGoForward: this.activeTabController.canGoForward(),
            windowSidebarState: windowState === null || windowState === void 0 ? void 0 : windowState.sidebarState,
        });
        const isWindowsMenuBarVisible = process.platform === "win32" && this.browserWindow.isMenuBarVisible();
        if (!isWindowsMenuBarVisible && this.browserWindow.isFocused()) {
            this.activeTabController.focus();
        }
    }
    setupTabBar(mode) {
        const tabBarPreferences = {
            spellcheck: false,
            sandbox: false,
            contextIsolation: false,
            preload: path_1.default.resolve(__dirname, "../renderer/tabsPreload.js"),
        };
        this.tabBar = new electron_1.BrowserView({
            webPreferences: tabBarPreferences,
        });
        if (process.platform === "darwin") {
            this.browserWindow.setTrafficLightPosition(TRAFFIC_LIGHT_POSITION_WITH_TABS);
        }
        this.tabBar.webContents
            .loadFile("renderer/tabs.html")
            .then(() => {
            this.tabBarLoaded = true;
            this.updateState();
        })
            .catch(err => {
            electron_log_1.default.error("Error loading tabs URL", err);
        });
        this.tabBar.setBackgroundColor(colorHelpers_1.electronColors.tabBarBackground[mode]);
        this.browserWindow.addBrowserView(this.tabBar);
        this.activeTabController.bringToFront();
    }
    refresh(options) {
        this.tabControllers.forEach(tabController => {
            if (options.includeActiveTab ||
                tabController !== this.activeTabController) {
                void tabController.reloadAtCurrentUrl();
            }
        });
    }
    close() {
        this.browserWindow.close();
    }
    sendMainToAllNotionInstances(eventName, ...args) {
        this.tabControllers.forEach(controller => {
            controller.sendToNotion(eventName, ...args);
        });
    }
    sendToTabBar(eventName, ...args) {
        if (!this.tabBar) {
            return;
        }
        this.tabBar.webContents.send(eventName, ...args);
    }
    handleAppCommandNavigation(e, cmd) {
        this.activeTabController.handleAppCommandNavigation(e, cmd);
    }
    handleSwipeNavigation(e, dir) {
        this.activeTabController.handleSwipeNavigation(e, dir);
    }
    handleFullscreenEvent() {
        this.tabControllers.forEach(controller => {
            controller.handleFullscreenEvent();
        });
        this.updateState();
    }
    handleResize() {
        this.updateState();
    }
    handleClose() {
        var _a;
        electron_log_1.default.info(`Window with id ${this.browserWindow.id} closed`);
        this.browserWindow.removeAllListeners();
        this.browserWindow.webContents.removeAllListeners();
        this.appStateUnsubscribe();
        this.windowStateUnsubscribe();
        (_a = this.tabStateUnsubscribe) === null || _a === void 0 ? void 0 : _a.call(this);
        this.tabControllers.forEach(controller => {
            controller.destroy();
        });
        if (this.tabBar) {
            const castTabBarWebContents = this.tabBar.webContents;
            castTabBarWebContents.destroy();
        }
        this.windowStateKeeper.saveState(this.browserWindow);
        if (process.platform === "win32") {
            const currentWindows = electron_1.BrowserWindow.getAllWindows();
            const hasNoOtherOpenWindows = currentWindows.every(currentWindow => currentWindow.id === this.browserWindow.id);
            if (hasNoOtherOpenWindows) {
                electron_1.app.quit();
            }
        }
    }
    handleTabLoadingError() {
        electron_1.dialog
            .showMessageBox(this.browserWindow, {
            message: this.intl.formatMessage(windowControllerMessages.loadingErrorMessage),
            buttons: [
                this.intl.formatMessage(windowControllerMessages.loadingErrorReload),
                this.intl.formatMessage(windowControllerMessages.loadingErrorCancel),
            ],
            noLink: true,
        })
            .then(messageBoxReturn => {
            if (messageBoxReturn.response === 0) {
                void this.activeTabController.reloadAtCurrentUrl();
            }
        })
            .catch(err => {
            electron_log_1.default.error(`error showing dialog`, err);
        });
    }
    maybeAddWindowsMenuBarSpacing() {
        let fastTimeout = undefined;
        let mediumTimeout = undefined;
        let slowTimeout = undefined;
        const action = () => {
            if (this.browserWindow.isMenuBarVisible()) {
                this.tabControllers.forEach(controller => {
                    controller.refreshForWindowsMenuBarSpacing();
                });
                this.updateState();
                clearTimeout(fastTimeout);
                clearTimeout(mediumTimeout);
                clearTimeout(slowTimeout);
            }
        };
        fastTimeout = setTimeout(action, 100);
        mediumTimeout = setTimeout(action, 150);
        slowTimeout = setTimeout(action, 500);
    }
    refreshForWindowsMenuBarSpacing() {
        if (!this.browserWindow.isMenuBarVisible()) {
            this.tabControllers.forEach(controller => {
                controller.refreshForWindowsMenuBarSpacing();
            });
            this.updateState();
        }
    }
    static getNewWindowRectFromFocusedWindow(windowState) {
        const rect = {
            x: windowState.x,
            y: windowState.y,
            width: windowState.width,
            height: windowState.height,
        };
        const focusedWindow = electron_1.BrowserWindow.getFocusedWindow();
        if (focusedWindow) {
            const [x, y] = focusedWindow.getPosition();
            rect.x = x + 20;
            rect.y = y + 20;
            const [width, height] = focusedWindow.getSize();
            rect.width = width;
            rect.height = height;
        }
        return rect;
    }
    subscribeToTabStates() {
        var _a;
        (_a = this.tabStateUnsubscribe) === null || _a === void 0 ? void 0 : _a.call(this);
        this.tabStateUnsubscribe = (0, state_1.subscribeToSelector)(state => (0, state_1.selectTabStates)(state, this.tabControllers.map(controller => controller.tabId)), () => this.updateState());
    }
}
exports.WindowController = WindowController;
