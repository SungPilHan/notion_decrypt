"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabController = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const constants_1 = require("../shared/constants");
const electron_log_1 = __importDefault(require("electron-log"));
const config_1 = __importDefault(require("../config"));
const schemeHelpers_1 = require("../shared/schemeHelpers");
const topbarDimensions_1 = require("../shared/topbarDimensions");
const state_1 = require("./state");
const TabBarState_1 = require("../helpers/TabBarState");
const PromiseUtils_1 = require("../shared/PromiseUtils");
const colorHelpers_1 = require("../helpers/colorHelpers");
const lodash_1 = __importDefault(require("lodash"));
const Spring_1 = __importDefault(require("../shared/Spring"));
const electronAppFeatures_1 = require("./electronAppFeatures");
class TabController {
    static newInstance(id, initialUrl) {
        return new TabController(id, initialUrl);
    }
    constructor(tabId, initialUrl) {
        this.tabBarOffset = 0;
        this.animating = false;
        this.handleResize = () => {
            if (!this.parentWindowControllerId) {
                return;
            }
            if (state_1.Store.getState().windows[this.parentWindowControllerId].activeTabId ===
                this.tabId) {
                this.updateState();
            }
        };
        this.handleResized = () => {
            this.updateState();
        };
        this.debouncedUpdateState = lodash_1.default.debounce(() => this.updateState(), 200);
        this.tabId = tabId;
        const notionPreferences = {
            spellcheck: true,
            contextIsolation: false,
            sandbox: false,
            session: electron_1.session.fromPartition(constants_1.electronSessionPartition),
            preload: path_1.default.resolve(__dirname, "../renderer/preload.js"),
        };
        this.notion = new electron_1.BrowserView({
            webPreferences: notionPreferences,
        });
        this.notion.setBackgroundColor(colorHelpers_1.electronColors.notionBackground[state_1.Store.getState().app.theme.mode]);
        this.notion.webContents.addListener("found-in-page", (event, result) => this.handleFoundInPage(event, result));
        this.notion.webContents.addListener("context-menu", (event, params) => this.handleContextMenu(event, params));
        this.notion.webContents.setWindowOpenHandler(details => {
            const isUrlAllowed = details.url === "about:blank#blocked" || "about:blank";
            const isNotion = details.frameName.startsWith("Notion");
            if (isUrlAllowed && isNotion) {
                return {
                    action: "allow",
                    show: false,
                    overrideBrowserWindowOptions: {
                        webPreferences: {
                            nodeIntegration: false,
                            nodeIntegrationInWorker: false,
                            nodeIntegrationInSubFrames: false,
                            preload: undefined,
                            webSecurity: true,
                            sandbox: false,
                        },
                    },
                };
            }
            this.sendToNotion("notion:new-window", details.url);
            return { action: "deny" };
        });
        this.notion.webContents.addListener("page-title-updated", (event, title) => this.handlePageTitleUpdated(event, title));
        this.notion.webContents.addListener("page-favicon-updated", (event, favicons) => this.handlePageFaviconUpdated(event, favicons));
        this.initialLoadedOrErroredDeferred = (0, PromiseUtils_1.deferred)();
        this.initialReadyToShowDeferred = (0, PromiseUtils_1.deferred)();
        if (state_1.Store.getState().app.theme.mode === "dark") {
            this._loadingState = "loading-not-ready-to-show";
            this.notion.webContents
                .loadFile("renderer/darkModePlaceholder.html")
                .then(() => {
                this._loadingState = "loading-ready-to-show";
                this.initialReadyToShowDeferred.resolve();
                this.notion.webContents
                    .loadURL(initialUrl)
                    .then(() => {
                    this.notion.webContents.clearHistory();
                    this._loadingState = "loaded";
                    this.initialLoadedOrErroredDeferred.resolve();
                })
                    .catch(err => {
                    this.notion.webContents.clearHistory();
                    this.handleInitialLoadError(initialUrl, err);
                });
            })
                .catch(() => {
                electron_log_1.default.error("Error loading placeholder page");
            });
        }
        else {
            this._loadingState = "loading-ready-to-show";
            this.initialReadyToShowDeferred.resolve();
            this.notion.webContents
                .loadURL(initialUrl)
                .then(() => {
                this._loadingState = "loaded";
                this.initialLoadedOrErroredDeferred.resolve();
            })
                .catch(err => {
                this.handleInitialLoadError(initialUrl, err);
            });
        }
        const searchPreferences = {
            spellcheck: false,
            contextIsolation: false,
            sandbox: false,
            preload: path_1.default.resolve(__dirname, "../renderer/search.js"),
        };
        const hack = searchPreferences;
        hack.transparent = true;
        this.search = new electron_1.BrowserView({
            webPreferences: searchPreferences,
        });
        this.search.webContents
            .loadURL(`file://${path_1.default.join(__dirname, "../renderer/search.html")}`)
            .catch(err => {
            electron_log_1.default.error("Error loading search URL", err);
        });
        this.appStateUnsubscribe = (0, state_1.subscribeToSelector)(state => (0, state_1.selectAppState)(state), () => this.updateState());
        this.tabStateUnsubscribe = (0, state_1.subscribeToSelector)(state => (0, state_1.selectTabState)(state, tabId), () => this.updateState());
    }
    get initialReadyStatePromise() {
        return this.initialReadyToShowDeferred.promise;
    }
    get initialLoadingStatePromise() {
        return this.initialLoadedOrErroredDeferred.promise;
    }
    get loadingState() {
        return this._loadingState;
    }
    isManagerOf(webContents) {
        if (!webContents) {
            return false;
        }
        return (this.notion.webContents.id === webContents.id ||
            this.search.webContents.id === webContents.id);
    }
    loadUrl(url) {
        return this.loadFullUrl(url);
    }
    navigateToUrl(navigateToUrlObject) {
        this.sendToNotion("notion:navigate-to-url", navigateToUrlObject);
    }
    reloadAtCurrentUrl() {
        let targetUrl = this.notion.webContents.getURL();
        const schemeUrl = (0, schemeHelpers_1.getSchemeUrl)({
            httpUrl: config_1.default.domainBaseUrl,
            protocol: config_1.default.protocol,
        });
        if (!targetUrl.startsWith(schemeUrl)) {
            targetUrl = schemeUrl;
        }
        return this.loadFullUrl(targetUrl);
    }
    loadFullUrl(fullUrl) {
        this._loadingState = "loading-ready-to-show";
        return this.notion.webContents
            .loadURL(fullUrl)
            .then(() => {
            this._loadingState = "loaded";
        })
            .catch(err => {
            if (err.code && err.code === "ERR_ABORTED") {
                return;
            }
            electron_log_1.default.error(`Error loading URL in loadFullUrl: ${fullUrl}`, err);
            this._loadingState = "errored";
            throw err;
        });
    }
    attachToWindow(parentWindowControllerId, parentWindow) {
        var _a;
        if (this.parentWindow === parentWindow) {
            return;
        }
        if (this.parentWindow) {
            throw new Error("Already attached to some other window");
        }
        this.parentWindow = parentWindow;
        this.parentWindow.addBrowserView(this.notion);
        this.notion.setBounds({
            x: 0,
            y: this.tabBarOffset,
            width: this.parentWindow.getContentBounds().width,
            height: this.parentWindow.getContentBounds().height - this.tabBarOffset,
        });
        if ((_a = (0, state_1.selectTabSearchingState)(state_1.Store.getState(), this.tabId)) === null || _a === void 0 ? void 0 : _a.isSearching) {
            this.parentWindow.addBrowserView(this.search);
        }
        this.parentWindow.on("resize", this.handleResize);
        this.parentWindow.on("resized", this.handleResized);
        this.parentWindowControllerId = parentWindowControllerId;
        this.parentWindowStateUnsubscribe = (0, state_1.subscribeToSelector)((state) => (0, state_1.selectWindowState)(state, parentWindowControllerId), () => this.debouncedUpdateState());
        this.updateState();
    }
    detachFromWindow() {
        var _a, _b;
        if (!this.parentWindow) {
            return;
        }
        this.parentWindow.removeBrowserView(this.notion);
        if ((_a = (0, state_1.selectTabSearchingState)(state_1.Store.getState(), this.tabId)) === null || _a === void 0 ? void 0 : _a.isSearching) {
            this.parentWindow.removeBrowserView(this.notion);
        }
        this.parentWindow.removeListener("resize", this.handleResize);
        this.parentWindow.removeListener("resized", this.handleResized);
        this.parentWindow = undefined;
        this.parentWindowControllerId = undefined;
        (_b = this.parentWindowStateUnsubscribe) === null || _b === void 0 ? void 0 : _b.call(this);
        this.updateState();
    }
    bringToFront() {
        var _a, _b, _c;
        (_a = this.parentWindow) === null || _a === void 0 ? void 0 : _a.setTopBrowserView(this.notion);
        if ((_b = (0, state_1.selectTabSearchingState)(state_1.Store.getState(), this.tabId)) === null || _b === void 0 ? void 0 : _b.isSearching) {
            (_c = this.parentWindow) === null || _c === void 0 ? void 0 : _c.setTopBrowserView(this.search);
            this.search.webContents.focus();
        }
        else {
            this.notion.webContents.focus();
        }
    }
    focus() {
        var _a;
        if ((_a = (0, state_1.selectTabSearchingState)(state_1.Store.getState(), this.tabId)) === null || _a === void 0 ? void 0 : _a.isSearching) {
            this.search.webContents.focus();
        }
        else {
            this.notion.webContents.focus();
        }
    }
    destroy() {
        var _a, _b, _c, _d;
        this.appStateUnsubscribe();
        this.tabStateUnsubscribe();
        this.notion.webContents.removeAllListeners();
        this.search.webContents.removeAllListeners();
        (_a = this.parentWindow) === null || _a === void 0 ? void 0 : _a.removeListener("resize", this.handleResize);
        (_b = this.parentWindow) === null || _b === void 0 ? void 0 : _b.removeBrowserView(this.notion);
        (_c = this.parentWindow) === null || _c === void 0 ? void 0 : _c.removeBrowserView(this.search);
        (_d = this.parentWindowStateUnsubscribe) === null || _d === void 0 ? void 0 : _d.call(this);
        this.debouncedUpdateState.cancel();
        this.parentWindow = undefined;
        const castSearchWebContents = this.search.webContents;
        const castNotionWebContents = this.notion.webContents;
        castSearchWebContents.destroy();
        castNotionWebContents.destroy();
        state_1.Store.dispatch((0, state_1.removeTabState)({ tabId: this.tabId }));
    }
    handleSearchStartFromNotion(isCenterPeekView) {
        state_1.Store.dispatch((0, state_1.updateTabSearchingState)({
            tabId: this.tabId,
            isSearching: true,
            isFirstQuery: true,
            isSearchingCenterPeek: isCenterPeekView,
        }));
        this.search.webContents.focus();
        this.sendToSearch("search:start");
        this.sendToNotion("notion:search-started");
    }
    handleSearchStopFromNotion() {
        var _a;
        if (!((_a = (0, state_1.selectTabSearchingState)(state_1.Store.getState(), this.tabId)) === null || _a === void 0 ? void 0 : _a.isSearching)) {
            return;
        }
        state_1.Store.dispatch((0, state_1.updateTabSearchingState)({
            tabId: this.tabId,
            isSearching: false,
            isFirstQuery: true,
            isSearchingCenterPeek: false,
        }));
        this.notion.webContents.focus();
        this.sendToSearch("search:stop");
        this.notion.webContents.stopFindInPage("clearSelection");
        this.sendToNotion("notion:search-stopped");
    }
    handleSearchStopFromSearch() {
        var _a;
        if (!((_a = (0, state_1.selectTabSearchingState)(state_1.Store.getState(), this.tabId)) === null || _a === void 0 ? void 0 : _a.isSearching)) {
            return;
        }
        state_1.Store.dispatch((0, state_1.updateTabSearchingState)({
            tabId: this.tabId,
            isSearching: false,
            isFirstQuery: true,
            isSearchingCenterPeek: false,
        }));
        this.notion.webContents.focus();
        this.notion.webContents.stopFindInPage("clearSelection");
        this.sendToNotion("notion:search-stopped");
    }
    handleSearchNextFromSearch(query) {
        const searchingState = (0, state_1.selectTabSearchingState)(state_1.Store.getState(), this.tabId);
        if (!searchingState || !searchingState.isSearching) {
            return;
        }
        const findNext = !searchingState.isFirstQuery;
        state_1.Store.dispatch((0, state_1.updateTabSearchingState)(Object.assign(Object.assign({ tabId: this.tabId }, searchingState), { isFirstQuery: false })));
        this.notion.webContents.findInPage(query, {
            forward: true,
            findNext,
        });
    }
    handleSearchPrevFromSearch(query) {
        const searchingState = (0, state_1.selectTabSearchingState)(state_1.Store.getState(), this.tabId);
        if (!searchingState || !searchingState.isSearching) {
            return;
        }
        const findNext = !searchingState.isFirstQuery;
        state_1.Store.dispatch((0, state_1.updateTabSearchingState)(Object.assign(Object.assign({ tabId: this.tabId }, searchingState), { isFirstQuery: false })));
        this.notion.webContents.findInPage(query, {
            forward: false,
            findNext,
        });
    }
    handleSearchClearFromSearch() {
        const searchingState = (0, state_1.selectTabSearchingState)(state_1.Store.getState(), this.tabId);
        if (!searchingState || !searchingState.isSearching) {
            return;
        }
        state_1.Store.dispatch((0, state_1.updateTabSearchingState)(Object.assign(Object.assign({ tabId: this.tabId }, searchingState), { isFirstQuery: true })));
        this.notion.webContents.stopFindInPage("clearSelection");
    }
    getUrl() {
        return this.notion.webContents.getURL();
    }
    openSettings() {
        this.sendToNotion("notion:open-settings");
    }
    broadcast(payload) {
        this.sendToNotion("notion:broadcast", payload);
    }
    canGoBack() {
        return this.notion.webContents.canGoBack();
    }
    canGoForward() {
        return this.notion.webContents.canGoForward();
    }
    goBack() {
        if (!this.canGoBack()) {
            return;
        }
        this.notion.webContents.goBack();
        this.focus();
    }
    goForward() {
        if (!this.canGoForward()) {
            return;
        }
        this.notion.webContents.goForward();
        this.focus();
    }
    refreshForWindowsMenuBarSpacing() {
        this.updateState();
    }
    toggleSidebarInNotion() {
        this.sendToNotion("notion:toggle-sidebar-expanded");
    }
    copyHttpLinkToClipboard() {
        electron_1.clipboard.writeText((0, schemeHelpers_1.getHttpUrl)({
            schemeUrl: this.getUrl(),
            baseUrl: config_1.default.domainBaseUrl,
        }));
    }
    setSpellcheckerEnabled(enabled) {
        this.notion.webContents.session.setSpellCheckerEnabled(enabled);
    }
    setSpellcheckerLanguages(languages) {
        const session = this.notion.webContents.session;
        session.setSpellCheckerLanguages(languages.filter(language => session.availableSpellCheckerLanguages.includes(language)));
    }
    getSpellcheckerLanguages() {
        return this.notion.webContents.session.getSpellCheckerLanguages();
    }
    getAvailableSpellcheckerLanguages() {
        return this.notion.webContents.session.availableSpellCheckerLanguages;
    }
    replaceMisspelling(word) {
        this.notion.webContents.replaceMisspelling(word);
    }
    addToDictionary(word) {
        this.notion.webContents.session.addWordToSpellCheckerDictionary(word);
    }
    handleAppCommandNavigation(e, cmd) {
        if (cmd === "browser-backward" && this.notion.webContents.canGoBack()) {
            this.notion.webContents.goBack();
        }
        else if (cmd === "browser-forward" &&
            this.notion.webContents.canGoForward()) {
            this.notion.webContents.goForward();
        }
    }
    handleSwipeNavigation(e, dir) {
        if (dir === "left" && this.notion.webContents.canGoBack()) {
            this.notion.webContents.goBack();
        }
        else if (dir === "right" && this.notion.webContents.canGoForward()) {
            this.notion.webContents.goForward();
        }
    }
    handleFullscreenEvent() {
        this.sendToNotion("notion:full-screen-changed");
    }
    handleFoundInPage(event, result) {
        const matches = result
            ? { count: result.matches, index: result.activeMatchOrdinal }
            : { count: 0, index: 0 };
        this.sendToSearch("search:result", matches);
    }
    handleContextMenu(event, params) {
        event.preventDefault();
        this.sendToNotion("notion:context-menu", params);
    }
    handlePageTitleUpdated(event, title) {
        if (title ===
            "Notion – The all-in-one workspace for your notes, tasks, wikis, and databases.") {
            return;
        }
        state_1.Store.dispatch((0, state_1.updateTabTitle)({
            tabId: this.tabId,
            title,
        }));
    }
    handlePageFaviconUpdated(event, favicons) {
        var _a;
        let favicon = undefined;
        if (favicons.length !== 0) {
            favicon = favicons[0];
            if (favicon.endsWith("favicon-local.ico") ||
                favicon.endsWith("favicon-dev.ico") ||
                favicon.endsWith("favicon-stg.ico") ||
                favicon.endsWith("favicon.ico")) {
                favicon = undefined;
            }
        }
        if (((_a = state_1.Store.getState().tabs[this.tabId]) === null || _a === void 0 ? void 0 : _a.favicon) !== favicon) {
            state_1.Store.dispatch((0, state_1.updateTabFavicon)({
                tabId: this.tabId,
                favicon: favicon,
            }));
        }
    }
    sendToNotion(eventName, ...args) {
        if (this.notion.webContents) {
            this.notion.webContents.send(eventName, ...args);
        }
    }
    sendToSearch(eventName, ...args) {
        this.search.webContents.send(eventName, ...args);
    }
    toggleDevTools() {
        this.notion.webContents.toggleDevTools();
    }
    openNotionConsole() {
        this.notion.webContents.openDevTools({
            mode: "detach",
        });
    }
    openSearchConsole() {
        this.search.webContents.openDevTools({
            mode: "detach",
        });
    }
    getProcessIds() {
        return [
            this.notion.webContents.getOSProcessId(),
            this.search.webContents.getOSProcessId(),
        ];
    }
    startTabBarAnimation(start, end) {
        let lastTime = Date.now();
        const spring = new Spring_1.default();
        spring.currentValue = start;
        spring.endValue = end;
        this.animating = true;
        const handler = () => {
            const currentTime = Date.now();
            const dt = currentTime - lastTime;
            lastTime = currentTime;
            spring.step(dt);
            this.tabBarOffset = Math.ceil(spring.currentValue);
            if (!spring.isAtRest()) {
                setTimeout(handler);
            }
            else {
                this.animating = false;
                this.tabBarOffset = end;
            }
            this.updateState();
        };
        setTimeout(handler, 50);
    }
    updateState() {
        var _a;
        const state = state_1.Store.getState();
        const appState = state.app;
        const searchingState = (0, state_1.selectTabSearchingState)(state, this.tabId);
        const windowState = this.parentWindowControllerId
            ? state.windows[this.parentWindowControllerId]
            : undefined;
        const isShowingTabBar = ((_a = windowState === null || windowState === void 0 ? void 0 : windowState.tabs) === null || _a === void 0 ? void 0 : _a.length) !== 1 && !Boolean(windowState === null || windowState === void 0 ? void 0 : windowState.isHtmlFullScreen);
        const targetTabBarHeight = isShowingTabBar
            ? Math.ceil(TabBarState_1.TAB_BAR_HEIGHT_PX * appState.zoomFactor)
            : 0;
        if (this.tabBarOffset !== targetTabBarHeight && !this.animating) {
            if ((windowState === null || windowState === void 0 ? void 0 : windowState.activeTabId) === this.tabId) {
                this.startTabBarAnimation(this.tabBarOffset, targetTabBarHeight);
            }
            else {
                this.tabBarOffset = targetTabBarHeight;
            }
        }
        const features = (0, electronAppFeatures_1.getElectronAppFeatures)({
            isShowingTabBar,
        });
        this.sendToNotion("notion:set-electron-app-features", features);
        if (this.parentWindow && (searchingState === null || searchingState === void 0 ? void 0 : searchingState.isSearching)) {
            if (!electron_1.BrowserWindow.fromBrowserView(this.search)) {
                this.parentWindow.addBrowserView(this.search);
            }
            const topOffset = (searchingState === null || searchingState === void 0 ? void 0 : searchingState.isSearchingCenterPeek)
                ? 0
                : (0, topbarDimensions_1.getTopbarHeight)(process.platform === "darwin");
            const desiredSearchViewHeight = Math.ceil(80 * appState.zoomFactor);
            const desiredSearchViewWidth = Math.ceil(500 * appState.zoomFactor);
            const newBounds = {
                x: this.parentWindow.getContentBounds().width - desiredSearchViewWidth,
                y: topOffset + this.tabBarOffset,
                width: desiredSearchViewWidth,
                height: desiredSearchViewHeight,
            };
            this.search.setBounds(newBounds);
        }
        else if (this.parentWindow) {
            if (electron_1.BrowserWindow.fromBrowserView(this.search) === this.parentWindow) {
                this.parentWindow.removeBrowserView(this.search);
            }
        }
        if (this.parentWindow) {
            this.notion.setBounds({
                x: 0,
                y: this.tabBarOffset,
                width: this.parentWindow.getContentBounds().width,
                height: this.parentWindow.getContentBounds().height - this.tabBarOffset,
            });
        }
        this.notion.setBackgroundColor(colorHelpers_1.electronColors.notionBackground[appState.theme.mode]);
        this.notion.webContents.setZoomFactor(appState.zoomFactor);
        this.search.webContents.setZoomFactor(appState.zoomFactor);
        this.sendToSearch("search:set-theme", appState.theme);
        if (this.parentWindowControllerId) {
            const windowState = state_1.Store.getState().windows[this.parentWindowControllerId];
            if (windowState &&
                windowState.sidebarState &&
                windowState.activeTabId &&
                windowState.activeTabId !== this.tabId) {
                this.sendToNotion("notion:set-window-sidebar-state", windowState.sidebarState);
            }
            this.sendToNotion("notion:set-is-active-tab", windowState.activeTabId === this.tabId);
        }
    }
    handleInitialLoadError(initialUrl, err) {
        if (err.code && err.code === "ERR_ABORTED") {
            this._loadingState = "loaded";
            this.initialLoadedOrErroredDeferred.resolve();
            return;
        }
        electron_log_1.default.error(`Error loading initial URL: ${initialUrl}`, err);
        this._loadingState = "errored";
        this.initialLoadedOrErroredDeferred.reject(err);
    }
}
exports.TabController = TabController;
