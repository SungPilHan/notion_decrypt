"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.electronColors = void 0;
const colors_1 = require("../shared/colors");
exports.electronColors = {
    tabBarBackground: {
        light: "#F7F7F5",
        dark: "#202020",
    },
    activeTabBackground: {
        light: colors_1.colors.white,
        dark: colors_1.accentColors.dark.gray[50],
    },
    notionBackground: {
        light: colors_1.colors.white,
        dark: "#191919",
    },
    hoveredTabBackground: {
        light: "#EFEEEE",
        dark: colors_1.accentColors.dark.gray[300],
    },
    tabBorder: {
        light: colors_1.accentColors.light.gray[75],
        dark: colors_1.accentColors.dark.gray[400],
    },
    activeTabText: {
        light: colors_1.accentColors.light.gray[900],
        dark: colors_1.accentColors.dark.gray[850],
    },
    inactiveTabText: {
        light: colors_1.accentColors.light.gray[600],
        dark: colors_1.accentColors.dark.gray[700],
    },
    buttonBackground: {
        light: "#DDDDDC",
        dark: "#434343",
    },
    enabledButtonColor: {
        light: "rgba(55, 53, 47, 0.85)",
        dark: colors_1.accentColors.dark.translucentGray[800],
    },
    collapseButtonColor: {
        light: "rgba(55, 53, 47, 0.45)",
        dark: colors_1.accentColors.dark.translucentGray[600],
    },
    sidebarDivider: {
        light: "#F1F1EF",
        dark: "#2B2B2B",
    },
    sidebarDividerHovered: {
        light: "#DEDEDC",
        dark: "#373737",
    },
};
