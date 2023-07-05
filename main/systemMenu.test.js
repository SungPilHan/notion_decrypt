"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const jest_mock_1 = require("jest-mock");
const systemMenu_1 = require("./systemMenu");
const electron_1 = require("electron");
(0, globals_1.describe)("setupSystemMenu", () => {
    const originalPlatform = process.platform;
    (0, globals_1.afterEach)(() => {
        Object.defineProperty(process, "platform", { value: originalPlatform });
    });
    const getAllLabels = (menus) => {
        return menus.flatMap(getLabels);
    };
    const getLabels = (menu) => {
        const labels = [];
        if (menu.label) {
            labels.push(menu.label);
        }
        if (menu.submenu && Array.isArray(menu.submenu)) {
            labels.push(...getAllLabels(menu.submenu));
        }
        return labels;
    };
    globals_1.it.each(["darwin", "win32"])("escapes all the ampersands on %s", platform => {
        Object.defineProperty(process, "platform", { value: platform });
        (0, systemMenu_1.setupSystemMenu)();
        const allLabels = getAllLabels((0, jest_mock_1.mocked)(electron_1.Menu.buildFromTemplate).mock
            .calls[0][0]);
        (0, globals_1.expect)(allLabels.filter(l => l.includes("&"))).toEqual([
            "Reset && Update App",
            ...(platform === "darwin" ? ["Reset && Erase All Local Data"] : []),
            "Open help && documentation",
        ]);
    });
});
