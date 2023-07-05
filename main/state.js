"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeToSelector = exports.Store = exports.selectTabSearchingState = exports.selectTabStates = exports.selectTabState = exports.removeTabState = exports.updateTabSearchingState = exports.updateTabFavicon = exports.updateTabTitle = exports.selectAppVisibilityBaseOnRenderers = exports.selectWindowState = exports.updateIsRendererVisible = exports.updateIsHtmlFullScreen = exports.updateIsFullScreen = exports.closeAllNonActiveTabs = exports.sliceTabRange = exports.removeTabFromWindow = exports.addTabToWindow = exports.updateActiveTabId = exports.updateWindowSidebarState = exports.initializeWindowState = exports.createWindowId = exports.createTabId = exports.selectAppState = exports.updatePreferences = exports.updateTheme = exports.updateZoomFactor = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const themeHelpers_1 = require("../shared/themeHelpers");
const electron_store_1 = __importDefault(require("electron-store"));
const crypto_1 = __importDefault(require("crypto"));
const lodash_1 = __importDefault(require("lodash"));
const shallowEqual_1 = __importDefault(require("../shared/shallowEqual"));
const electronAppFeatures_1 = require("./electronAppFeatures");
const STATE_LOGGING_ENABLED = false;
const appStatePersister = new electron_store_1.default({ name: "state" });
const legacyStore = new electron_store_1.default();
const legacyZoomFactor = legacyStore.get("zoomFactor", 1);
const appSlice = (0, toolkit_1.createSlice)({
    name: "app",
    initialState: appStatePersister.get("appState", {
        zoomFactor: legacyZoomFactor,
        theme: (0, themeHelpers_1.getElectronTheme)("light"),
        isTabsFeatureEnabled: true,
        preferences: electronAppFeatures_1.DEFAULT_PERSISTED_PREFERENCES,
    }),
    reducers: {
        updateZoomFactor(state, action) {
            state.zoomFactor = action.payload;
        },
        updateTheme(state, action) {
            state.theme = action.payload;
        },
        updatePreferences(state, action) {
            state.preferences = Object.assign(Object.assign({}, state.preferences), action.payload);
        },
    },
});
_a = appSlice.actions, exports.updateZoomFactor = _a.updateZoomFactor, exports.updateTheme = _a.updateTheme, exports.updatePreferences = _a.updatePreferences;
function selectAppState(state) {
    return state.app;
}
exports.selectAppState = selectAppState;
function createTabId() {
    return crypto_1.default.randomUUID();
}
exports.createTabId = createTabId;
function createWindowId() {
    return crypto_1.default.randomUUID();
}
exports.createWindowId = createWindowId;
const windowSlice = (0, toolkit_1.createSlice)({
    name: "windows",
    initialState: {},
    reducers: {
        initializeWindowState(state, action) {
            const payload = action.payload;
            state[payload.windowId] = {
                windowId: payload.windowId,
                tabs: [{ tabId: payload.initialTabId }],
                activeTabId: payload.initialTabId,
                isFullScreen: payload.isFullScreen,
                isHtmlFullScreen: payload.isHtmlFullScreen,
                isRendererVisible: payload.isRendererVisible,
            };
        },
        updateWindowSidebarState(state, action) {
            state[action.payload.windowId].sidebarState = action.payload.sidebarState;
        },
        updateActiveTabId(state, action) {
            state[action.payload.windowId].activeTabId = action.payload.activeTabId;
        },
        addTabToWindow(state, action) {
            const payload = action.payload;
            state[payload.windowId].tabs.splice(payload.index, 0, {
                tabId: payload.tabId,
                parentTabId: payload.parentTabId,
            });
            if (payload.makeActiveTab) {
                state[payload.windowId].activeTabId = payload.tabId;
            }
        },
        removeTabFromWindow(state, action) {
            const payload = action.payload;
            state[payload.windowId].tabs.splice(payload.index, 1);
            if (payload.newActiveTabId) {
                state[payload.windowId].activeTabId = payload.newActiveTabId;
            }
        },
        sliceTabRange(state, action) {
            const payload = action.payload;
            const windowState = state[action.payload.windowId];
            windowState.tabs = windowState.tabs.slice(payload.startIndex, payload.endIndex);
        },
        closeAllNonActiveTabs(state, action) {
            const windowState = state[action.payload.windowId];
            windowState.tabs = windowState.tabs.filter(tab => tab.tabId === windowState.activeTabId);
        },
        updateIsFullScreen(state, action) {
            state[action.payload.windowId].isFullScreen = action.payload.isFullScreen;
        },
        updateIsHtmlFullScreen(state, action) {
            state[action.payload.windowId].isHtmlFullScreen =
                action.payload.isHtmlFullScreen;
        },
        updateIsRendererVisible(state, action) {
            state[action.payload.windowId].isRendererVisible =
                action.payload.isRendererVisible;
        },
    },
});
_b = windowSlice.actions, exports.initializeWindowState = _b.initializeWindowState, exports.updateWindowSidebarState = _b.updateWindowSidebarState, exports.updateActiveTabId = _b.updateActiveTabId, exports.addTabToWindow = _b.addTabToWindow, exports.removeTabFromWindow = _b.removeTabFromWindow, exports.sliceTabRange = _b.sliceTabRange, exports.closeAllNonActiveTabs = _b.closeAllNonActiveTabs, exports.updateIsFullScreen = _b.updateIsFullScreen, exports.updateIsHtmlFullScreen = _b.updateIsHtmlFullScreen, exports.updateIsRendererVisible = _b.updateIsRendererVisible;
function selectWindowState(state, windowId) {
    return state.windows[windowId];
}
exports.selectWindowState = selectWindowState;
function selectAppVisibilityBaseOnRenderers(state) {
    return Object.values(state.windows).some(windowState => windowState.isRendererVisible);
}
exports.selectAppVisibilityBaseOnRenderers = selectAppVisibilityBaseOnRenderers;
const tabSlice = (0, toolkit_1.createSlice)({
    name: "tabs",
    initialState: {},
    reducers: {
        updateTabTitle(state, action) {
            const tabStateElement = state[action.payload.tabId];
            state[action.payload.tabId] = Object.assign(Object.assign({}, tabStateElement), { title: action.payload.title });
        },
        updateTabFavicon(state, action) {
            const tabStateElement = state[action.payload.tabId];
            state[action.payload.tabId] = Object.assign(Object.assign({}, tabStateElement), { favicon: action.payload.favicon });
        },
        updateTabSearchingState(state, action) {
            const tabStateElement = state[action.payload.tabId];
            state[action.payload.tabId] = Object.assign(Object.assign({}, tabStateElement), { searching: {
                    isSearching: action.payload.isSearching,
                    isSearchingCenterPeek: action.payload.isSearchingCenterPeek,
                    isFirstQuery: action.payload.isFirstQuery,
                } });
        },
        removeTabState(state, action) {
            delete state[action.payload.tabId];
        },
    },
});
_c = tabSlice.actions, exports.updateTabTitle = _c.updateTabTitle, exports.updateTabFavicon = _c.updateTabFavicon, exports.updateTabSearchingState = _c.updateTabSearchingState, exports.removeTabState = _c.removeTabState;
function selectTabState(state, tabId) {
    return state.tabs[tabId];
}
exports.selectTabState = selectTabState;
function selectTabStates(state, tabIds) {
    return lodash_1.default.compact(tabIds.map(tabId => state.tabs[tabId]));
}
exports.selectTabStates = selectTabStates;
function selectTabSearchingState(state, tabId) {
    var _a;
    return (_a = selectTabState(state, tabId)) === null || _a === void 0 ? void 0 : _a.searching;
}
exports.selectTabSearchingState = selectTabSearchingState;
const rootReducer = (0, toolkit_1.combineReducers)({
    windows: windowSlice.reducer,
    tabs: tabSlice.reducer,
    app: appSlice.reducer,
});
const loggerMiddleware = storeAPI => next => action => {
    if (STATE_LOGGING_ENABLED) {
        console.log(`Dispatching action: ${action.type}`);
    }
    return next(action);
};
exports.Store = (0, toolkit_1.configureStore)({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(loggerMiddleware),
});
subscribeToSelector(state => selectAppState(state), () => {
    appStatePersister.set("appState", selectAppState(exports.Store.getState()));
});
function subscribeToSelector(selector, listener) {
    let currentState = selector(exports.Store.getState());
    let oldState = currentState;
    return exports.Store.subscribe(() => {
        const newState = selector(exports.Store.getState());
        if (!(0, shallowEqual_1.default)(currentState, newState)) {
            oldState = currentState;
            currentState = newState;
            listener(currentState, oldState);
        }
    });
}
exports.subscribeToSelector = subscribeToSelector;
