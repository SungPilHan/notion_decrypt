"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const TabController_1 = require("./TabController");
const AppController_1 = require("./AppController");
const electron_1 = require("electron");
TabController_1.TabController.prototype.navigateToUrl = function (navigateToUrlObject) {
    this.getUrl = () => navigateToUrlObject.url;
};
(0, globals_1.describe)("AppController tests", () => {
    let appController;
    const getWindowControllers = () => {
        return appController.windowControllers;
    };
    const getTabControllers = (windowController) => {
        return windowController.tabControllers;
    };
    (0, globals_1.beforeEach)(() => {
        appController = new AppController_1.AppController_TEST_ONLY();
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.describe)("handleProtocolUrl", () => {
        const getTabUrls = () => getWindowControllers().map(windowController => getTabControllers(windowController).map(tabController => tabController.getUrl()));
        (0, globals_1.describe)("when the URL came from a deep-link intended to open a new page", () => {
            let protocolUrl;
            (0, globals_1.beforeEach)(() => {
                protocolUrl =
                    "notion://notion.so/deep-link?foo=bar&deepLinkOpenNewTab=true";
            });
            (0, globals_1.describe)("and there are no existing windows open", () => {
                (0, globals_1.it)("opens in a new window", () => {
                    (0, globals_1.expect)(getTabUrls()).toEqual([]);
                    appController.handleProtocolUrl(protocolUrl);
                    (0, globals_1.expect)(getTabUrls()).toEqual([
                        ["notion://notion.so/deep-link?foo=bar"],
                    ]);
                    (0, globals_1.expect)(getWindowControllers()[0].browserWindow.focus).toHaveBeenCalled();
                });
            });
            (0, globals_1.describe)("and there are existing windows open", () => {
                (0, globals_1.beforeEach)(() => {
                    appController.createWindow("notion://notion.so/window-0-tab-0");
                });
                (0, globals_1.describe)("and tabs are enabled", () => {
                    (0, globals_1.describe)("and there is no tab that matches the incoming URL", () => {
                        (0, globals_1.it)("opens in a new tab and focuses", () => {
                            (0, globals_1.expect)(getTabUrls()).toEqual([
                                ["notion://notion.so/window-0-tab-0"],
                            ]);
                            appController.handleProtocolUrl(protocolUrl);
                            (0, globals_1.expect)(getTabUrls()).toEqual([
                                [
                                    "notion://notion.so/window-0-tab-0",
                                    "notion://notion.so/deep-link?foo=bar",
                                ],
                            ]);
                            const windowController = getWindowControllers()[0];
                            (0, globals_1.expect)(windowController.getActiveTabController()).toEqual(windowController.getTabControllerWithUrl("notion://notion.so/deep-link?foo=bar"));
                            (0, globals_1.expect)(windowController.browserWindow.focus).toHaveBeenCalled();
                        });
                    });
                    (0, globals_1.describe)("and there is a tab that matches the incoming URL", () => {
                        (0, globals_1.it)("opens in the matching tab and focuses", () => {
                            appController.createWindow("notion://notion.so/window-1-tab-0");
                            const windowControllers = getWindowControllers();
                            const secondWindow = windowControllers[1];
                            secondWindow.newTab({
                                initialUrl: "notion://notion.so/window-1-tab-1",
                                makeActiveTab: false,
                                position: { type: "end" },
                            });
                            secondWindow.newTab({
                                initialUrl: "notion://notion.so/deep-link?foo=bar",
                                makeActiveTab: false,
                                position: { type: "end" },
                            });
                            (0, globals_1.expect)(getTabUrls()).toEqual([
                                ["notion://notion.so/window-0-tab-0"],
                                [
                                    "notion://notion.so/window-1-tab-0",
                                    "notion://notion.so/window-1-tab-1",
                                    "notion://notion.so/deep-link?foo=bar",
                                ],
                            ]);
                            appController.handleProtocolUrl(protocolUrl);
                            (0, globals_1.expect)(getTabUrls()).toEqual([
                                ["notion://notion.so/window-0-tab-0"],
                                [
                                    "notion://notion.so/window-1-tab-0",
                                    "notion://notion.so/window-1-tab-1",
                                    "notion://notion.so/deep-link?foo=bar",
                                ],
                            ]);
                            (0, globals_1.expect)(secondWindow.getActiveTabController()).toEqual(secondWindow.getTabControllerWithUrl("notion://notion.so/deep-link?foo=bar"));
                            (0, globals_1.expect)(secondWindow.browserWindow.focus).toHaveBeenCalled();
                        });
                    });
                    (0, globals_1.it)("unminimizes the window if it is minimized", () => {
                        globals_1.jest
                            .spyOn(electron_1.BrowserWindow.prototype, "isMinimized")
                            .mockReturnValue(true);
                        globals_1.jest.spyOn(electron_1.BrowserWindow.prototype, "restore");
                        appController.handleProtocolUrl(protocolUrl);
                        (0, globals_1.expect)(electron_1.BrowserWindow.prototype.restore).toHaveBeenCalled();
                    });
                });
            });
        });
        (0, globals_1.describe)("when the URL came from a deep-link intended to change the current page (login etc)", () => {
            let protocolUrl;
            (0, globals_1.beforeEach)(() => {
                protocolUrl = "notion://notion.so/deep-link?foo=bar";
            });
            (0, globals_1.describe)("and there are no existing windows open", () => {
                (0, globals_1.it)("opens in a new window", () => {
                    (0, globals_1.expect)(getTabUrls()).toEqual([]);
                    appController.handleProtocolUrl(protocolUrl);
                    (0, globals_1.expect)(getTabUrls()).toEqual([
                        ["notion://notion.so/deep-link?foo=bar"],
                    ]);
                    (0, globals_1.expect)(getWindowControllers()[0].browserWindow.focus).toHaveBeenCalled();
                });
            });
            (0, globals_1.describe)("and there are existing windows open", () => {
                (0, globals_1.beforeEach)(() => {
                    appController.createWindow("notion://notion.so/window-0-tab-0");
                });
                (0, globals_1.it)("opens the URL in an existing window and focuses", () => {
                    (0, globals_1.expect)(getTabUrls()).toEqual([["notion://notion.so/window-0-tab-0"]]);
                    appController.handleProtocolUrl(protocolUrl);
                    (0, globals_1.expect)(getTabUrls()).toEqual([
                        ["notion://notion.so/deep-link?foo=bar"],
                    ]);
                    (0, globals_1.expect)(getWindowControllers()[0].browserWindow.focus).toHaveBeenCalled();
                });
                (0, globals_1.it)("unminimizes the window if it is minimized", () => {
                    globals_1.jest
                        .spyOn(electron_1.BrowserWindow.prototype, "isMinimized")
                        .mockReturnValue(true);
                    globals_1.jest.spyOn(electron_1.BrowserWindow.prototype, "restore");
                    appController.handleProtocolUrl(protocolUrl);
                    (0, globals_1.expect)(electron_1.BrowserWindow.prototype.restore).toHaveBeenCalled();
                });
            });
        });
    });
});
