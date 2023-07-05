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
require("../helpers/setEnvironment");
const rendererIpc = __importStar(require("./rendererIpc"));
const localizationHelper = __importStar(require("../helpers/localizationHelper"));
const react_1 = __importStar(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const typography_1 = __importDefault(require("../shared/typography"));
const icons_1 = __importDefault(require("../shared/icons"));
const TabBarState_1 = require("../helpers/TabBarState");
const colorHelpers_1 = require("../helpers/colorHelpers");
const notion_intl_1 = require("notion-intl");
const messages = (0, notion_intl_1.defineMessages)({
    closeSidebarLabel: {
        id: "desktop.tabBar.closeSidebarLabel",
        defaultMessage: "Close Sidebar",
        description: "Label for the button that closes the sidebar in the tab bar",
    },
    openSidebarLabel: {
        id: "desktop.tabBar.openSidebarLabel",
        defaultMessage: "Open Sidebar",
        description: "Label for the button that opens the sidebar in the tab bar",
    },
    backButtonLabel: {
        id: "desktop.tabBar.backButtonLabel",
        defaultMessage: "Back",
        description: "Label for the button that goes back in the tab bar",
    },
    forwardButtonLabel: {
        id: "desktop.tabBar.forwardButtonLabel",
        defaultMessage: "Forward",
        description: "Label for the button that goes forward in the tab bar",
    },
    newTabButtonLabel: {
        id: "desktop.tabBar.newTabButtonLabel",
        defaultMessage: "New Tab",
        description: "Label for the button that opens a new tab in the tab bar",
    },
    closeTabLabel: {
        id: "desktop.tabBar.closeTabLabel",
        defaultMessage: "Close Tab, {tabTitle}",
        description: "Label for the button that closes a tab in the tab bar, followed by the tab title",
    },
    loadingPlaceholder: {
        id: "desktop.tabBar.loadingPlaceholder",
        defaultMessage: "Loading...",
        description: "Placeholder message displayed in the tab title while we're fetching the actual title",
    },
});
function TabBar() {
    const [state, setState] = (0, react_1.useState)(undefined);
    (0, react_1.useEffect)(() => {
        const listener = (_event, state) => {
            setState(state);
        };
        tabsApi.tabBarState.addListener(listener);
        return () => tabsApi.tabBarState.removeListener(listener);
    }, []);
    if (!state) {
        return react_1.default.createElement("div", { style: { backgroundColor: "#202020" } });
    }
    const styles = getTabBarStyles({
        mode: state.themeMode,
        isWindows: state.isWindows,
        tabCount: state.tabs.length,
    });
    const activeTabIndex = state.tabs.findIndex(tabState => {
        return tabState.active;
    });
    return (react_1.default.createElement(notion_intl_1.IntlProvider, { locale: state.locale, messages: localizationHelper.getMessages(state.locale), defaultLocale: "en-US" },
        react_1.default.createElement("div", { style: styles.root },
            react_1.default.createElement("div", { style: styles.interactableArea, onDoubleClick: handleToggleMaximized },
                react_1.default.createElement(TabBarActions, { state: state }),
                state.tabs.length > 1
                    ? state.tabs.map((tabState, index) => {
                        return (react_1.default.createElement(Tab, { tabState: tabState, tabIndex: index, mode: state.themeMode, key: `${index}`, isWindows: state.isWindows, isLastTab: index === state.tabs.length - 1, activeTabIndex: activeTabIndex }));
                    })
                    : []),
            !state.isWindows && react_1.default.createElement("div", { style: styles.hackyDraggableArea }))));
}
function TabBarActions(props) {
    var _a, _b;
    const intl = (0, notion_intl_1.useIntl)();
    const { state } = props;
    const styles = getTabBarActionsStyles(state);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", { style: styles.sidebarContainer },
            react_1.default.createElement("div", { style: styles.actionLeftPadding, onDoubleClick: handleToggleMaximized }),
            ((_a = state.windowSidebarState) === null || _a === void 0 ? void 0 : _a.isExpanded) || false ? (react_1.default.createElement(TabAction, { label: intl.formatMessage(messages.closeSidebarLabel), mode: state.themeMode, icon: icons_1.default.doubleChevronLeft, enabled: true, widthPx: 16, heightPx: 16, fill: colorHelpers_1.electronColors.collapseButtonColor[state.themeMode], onClick: () => {
                    tabsApi.toggleSidebarExpansion();
                }, isWindows: state.isWindows })) : (react_1.default.createElement(TabAction, { label: intl.formatMessage(messages.openSidebarLabel), mode: state.themeMode, icon: icons_1.default.hamburgerMenu, enabled: ((_b = state.windowSidebarState) === null || _b === void 0 ? void 0 : _b.isLoggedIn) || false, widthPx: 16, heightPx: 16, onClick: () => {
                    tabsApi.toggleSidebarExpansion();
                }, isWindows: state.isWindows })),
            react_1.default.createElement("div", { style: styles.sidebarActionSpacer, onDoubleClick: handleToggleMaximized })),
        react_1.default.createElement("div", { style: styles.nonSidebarActionSpacer }),
        react_1.default.createElement(TabAction, { label: intl.formatMessage(messages.backButtonLabel), mode: state.themeMode, icon: icons_1.default.chevronLeftRoundedThin, enabled: state.canGoBack, widthPx: 24, heightPx: 24, onClick: () => {
                tabsApi.goBack();
            }, isWindows: state.isWindows }),
        react_1.default.createElement(TabAction, { label: intl.formatMessage(messages.forwardButtonLabel), mode: state.themeMode, icon: icons_1.default.chevronRightRoundedThin, enabled: state.canGoForward, widthPx: 24, heightPx: 24, onClick: () => {
                tabsApi.goForward();
            }, isWindows: state.isWindows }),
        react_1.default.createElement(TabAction, { label: intl.formatMessage(messages.newTabButtonLabel), mode: state.themeMode, icon: icons_1.default.plusRounded, enabled: true, widthPx: 24, heightPx: 24, onClick: () => {
                tabsApi.newTab();
            }, isWindows: state.isWindows }),
        react_1.default.createElement("div", { style: { width: "10px" } })));
}
function TabAction(props) {
    const { label, mode, icon, enabled, onClick, isWindows, fill } = props;
    const [hovered, setHovered] = (0, react_1.useState)(false);
    const [focused, setFocused] = (0, react_1.useState)(false);
    const styles = getTabActionStyles({
        mode,
        hovered: enabled && hovered,
        focused: enabled && focused,
        enabled,
        isWindows,
    });
    return (react_1.default.createElement("div", { "aria-label": label, "aria-disabled": !enabled ? true : undefined, role: "button", style: styles.root, onClick: enabled ? onClick : undefined, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), onFocus: () => setFocused(true), onBlur: () => setFocused(false) }, icon({
        width: `${props.widthPx}px`,
        height: `${props.heightPx}px`,
        fill: fill ? fill : colorHelpers_1.electronColors.enabledButtonColor[mode],
    })));
}
function Tab(props) {
    const { tabState, tabIndex, mode, isWindows, isLastTab, activeTabIndex } = props;
    const [hovered, setHovered] = (0, react_1.useState)(false);
    const [focused, setFocused] = (0, react_1.useState)(false);
    const [closeHovered, setCloseHovered] = (0, react_1.useState)(false);
    const styles = getTabStyles({
        mode,
        active: tabState.active,
        hovered,
        focused,
        closeHovered,
        isWindows,
        isLastTab,
        activeTabIndex,
        tabIndex,
    });
    const intl = (0, notion_intl_1.useIntl)();
    const tabTitle = tabState.title === undefined
        ? intl.formatMessage(messages.loadingPlaceholder)
        : tabState.title;
    return (react_1.default.createElement("div", { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), onFocus: () => setFocused(true), onBlur: () => setFocused(false), style: styles.root },
        react_1.default.createElement("div", { role: "button", title: tabTitle, onClick: () => handleTabClick(tabIndex), onAuxClick: event => {
                if (event.button === 1) {
                    handleTabClose(event, tabIndex);
                }
                else if (event.button === 2) {
                    handleTabMenu(event, tabIndex);
                }
            }, style: styles.tab },
            react_1.default.createElement("div", { style: styles.titleAndIconWrapper },
                tabState.favicon && (react_1.default.createElement("img", { width: 16, height: 16, style: styles.icon, src: tabState.favicon })),
                react_1.default.createElement("div", { style: styles.title }, tabTitle))),
        react_1.default.createElement("div", { style: styles.closeButtonShadowArea },
            react_1.default.createElement("div", { "aria-label": intl.formatMessage(messages.closeTabLabel, { tabTitle }), role: "button", style: styles.closeButton, onClick: event => handleTabClose(event, tabIndex), onMouseEnter: () => setCloseHovered(true), onMouseLeave: () => setCloseHovered(false) }, icons_1.default.closeSmall({
                width: 16,
                height: 16,
                fill: colorHelpers_1.electronColors.enabledButtonColor[mode],
            })))));
}
function getTabBarStyles(args) {
    return {
        root: {
            height: `${TabBarState_1.TAB_BAR_HEIGHT_PX}`,
            userSelect: "none",
        },
        interactableArea: Object.assign({ width: "100%", height: args.tabCount > 1 ? `${TabBarState_1.TAB_BAR_HEIGHT_PX}` : 0, zIndex: 1, position: "absolute", top: "0px", left: "0px", backgroundColor: args.tabCount === 1
                ? colorHelpers_1.electronColors.activeTabBackground[args.mode]
                : colorHelpers_1.electronColors.tabBarBackground[args.mode], display: "flex", flexDirection: "row", alignItems: "center" }, electronDraggable(true, args.isWindows)),
        hackyDraggableArea: Object.assign({ width: "100%", height: "12px", zIndex: 2, position: "absolute", top: "0px", left: "0px" }, electronDraggable(true, args.isWindows)),
    };
}
function getTabBarActionsStyles(state) {
    const { isWindows, isFullscreen, windowSidebarState, themeMode: mode } = state;
    let sidebarStyling = {};
    if (windowSidebarState) {
        if (windowSidebarState.isExpanded) {
            if (windowSidebarState.resizing.isResizerHovered ||
                windowSidebarState.resizing.isResizing) {
                sidebarStyling = {
                    width: `${windowSidebarState.targetWidth - 4}px`,
                    minWidth: `${windowSidebarState.targetWidth - 4}px`,
                    transition: "box-shadow 300ms ease",
                    boxShadow: `inset -2px 0px 0px 0px ${colorHelpers_1.electronColors.sidebarDividerHovered[mode]}`,
                    paddingRight: "4px",
                    backgroundColor: colorHelpers_1.electronColors.tabBarBackground[mode],
                };
            }
            else {
                sidebarStyling = {
                    width: `${windowSidebarState.observedWidth - 4}px`,
                    minWidth: `${windowSidebarState.observedWidth - 4}px`,
                    transition: "box-shadow 300ms ease",
                    boxShadow: `inset -1px 0px 0px 0px ${colorHelpers_1.electronColors.sidebarDivider[mode]}`,
                    paddingRight: "4px",
                    backgroundColor: colorHelpers_1.electronColors.tabBarBackground[mode],
                };
            }
        }
        else {
            sidebarStyling = {
                width: `${windowSidebarState.observedWidth}px`,
                minWidth: "fit-content",
                backgroundColor: colorHelpers_1.electronColors.tabBarBackground[mode],
            };
        }
    }
    else {
        sidebarStyling = {
            width: "auto",
            backgroundColor: colorHelpers_1.electronColors.tabBarBackground[mode],
        };
    }
    return {
        sidebarContainer: Object.assign({ height: "100%", flexDirection: "row", alignItems: "center", display: "flex" }, sidebarStyling),
        nonSidebarActionSpacer: {
            width: (windowSidebarState === null || windowSidebarState === void 0 ? void 0 : windowSidebarState.isExpanded) ? "12px" : "6px",
        },
        sidebarActionSpacer: {
            width: (windowSidebarState === null || windowSidebarState === void 0 ? void 0 : windowSidebarState.isExpanded) ? "8px" : "0px",
        },
        actionLeftPadding: Object.assign({ height: "100%", width: isFullscreen || isWindows ? "12px" : "73px", flexShrink: 0, flexGrow: 1 }, electronDraggable(true, isWindows)),
    };
}
function getTabActionStyles(args) {
    return {
        root: Object.assign({ width: "24px", height: "24px", flexShrink: 0, flexGrow: 0, borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", opacity: args.enabled ? 1 : 0.4, backgroundColor: args.hovered || args.focused
                ? colorHelpers_1.electronColors.buttonBackground[args.mode]
                : "transparent" }, electronDraggable(false, args.isWindows)),
    };
}
function getTabStyles(args) {
    const { mode, active, hovered, focused, closeHovered, isWindows, isLastTab, activeTabIndex, tabIndex, } = args;
    let backgroundColor = "transparent";
    if (active) {
        backgroundColor = colorHelpers_1.electronColors.activeTabBackground[mode];
    }
    else if (hovered || focused || closeHovered) {
        backgroundColor = colorHelpers_1.electronColors.hoveredTabBackground[mode];
    }
    return {
        root: {
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            flexShrink: 0,
            flexBasis: "52px",
            position: "relative",
            maxWidth: "200px",
            overflow: "hidden",
        },
        tab: Object.assign(Object.assign(Object.assign(Object.assign({}, (!active && tabIndex !== activeTabIndex + 1 && tabIndex !== 0
            ? { borderLeft: `1px solid ${colorHelpers_1.electronColors.tabBorder[mode]}` }
            : { borderLeft: `1px solid ${backgroundColor}` })), (isLastTab && !active
            ? { borderRight: `1px solid ${colorHelpers_1.electronColors.tabBorder[mode]}` }
            : { borderRight: `1px solid ${backgroundColor}` })), { paddingLeft: "16px", paddingRight: "16px", backgroundColor }), electronDraggable(false, isWindows)),
        titleAndIconWrapper: {
            width: "100%",
            height: `${TabBarState_1.TAB_BAR_HEIGHT_PX}`,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            zIndex: 1,
        },
        icon: {
            paddingRight: "8px",
            opacity: active || hovered || closeHovered ? "100%" : "75%",
        },
        title: {
            color: active || hovered || closeHovered
                ? colorHelpers_1.electronColors.activeTabText[mode]
                : colorHelpers_1.electronColors.inactiveTabText[mode],
            fontFamily: typography_1.default.baseFontFamily.sans,
            fontWeight: active
                ? typography_1.default.fontWeight.medium
                : typography_1.default.fontWeight.regular,
            fontSize: "13px",
            lineHeight: typography_1.default.lineHeight.UIRegular.desktop,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        },
        closeButtonShadowArea: {
            position: "absolute",
            top: "0",
            right: "0",
            backgroundColor,
            width: `${TabBarState_1.TAB_BAR_HEIGHT_PX}`,
            height: `${TabBarState_1.TAB_BAR_HEIGHT_PX}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            opacity: hovered || focused || closeHovered ? 1 : 0,
        },
        closeButton: {
            padding: "2px",
            borderRadius: "3px",
            backgroundColor: closeHovered
                ? colorHelpers_1.electronColors.buttonBackground[mode]
                : "transparent",
        },
    };
}
function electronDraggable(drag, isWindows) {
    if (isWindows) {
        return {};
    }
    else {
        return {
            WebkitAppRegion: drag ? "drag" : "no-drag",
        };
    }
}
function handleTabClick(tabIndex) {
    rendererIpc.sendToMain("notion:tab-clicked", tabIndex);
}
function handleTabClose(event, tabIndex) {
    event.stopPropagation();
    rendererIpc.sendToMain("notion:close-tab", tabIndex);
    return true;
}
function handleTabMenu(event, tabIndex) {
    event.stopPropagation();
    rendererIpc.sendToMain("notion:show-tab-menu", tabIndex, event.clientX, event.clientY);
}
function handleToggleMaximized(event) {
    if (event.target === event.currentTarget) {
        tabsApi.toggleMaximized();
    }
}
const tabsApi = {
    tabBarState: {
        addListener(fn) {
            rendererIpc.handleMainToTabsEvent.addListener("tabs:set-state", fn);
        },
        removeListener(fn) {
            rendererIpc.handleMainToTabsEvent.removeListener("tabs:set-state", fn);
        },
    },
    goBack() {
        rendererIpc.sendToMain("notion:go-back");
    },
    goForward() {
        rendererIpc.sendToMain("notion:go-forward");
    },
    newTab() {
        rendererIpc.sendToMain("notion:new-tab-from-tab-bar");
    },
    toggleSidebarExpansion() {
        rendererIpc.sendToMain("notion:toggle-sidebar-expanded");
    },
    toggleMaximized() {
        rendererIpc.sendToMain("notion:toggle-maximized");
    },
};
window["__start"] = () => {
    const rootElm = document.getElementById("root");
    react_dom_1.default.render(react_1.default.createElement(TabBar, null), rootElm);
};
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        rendererIpc.sendToMain("notion:renderer-visibility-changed", true);
    }
    else {
        rendererIpc.sendToMain("notion:renderer-visibility-changed", false);
    }
});
