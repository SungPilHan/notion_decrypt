"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHighlightColorStyle = exports.getCalloutBlockColorStyle = exports.getBlockColorFromUserId = exports.getBlockColorStyle = exports.blockColorIsBackgroundColor = exports.getBoardSelectStyle = exports.getSelectTokenStyle = exports.getHexFromRGB = exports.flattenColorsByAlpha = exports.findClosestThemeColor = exports.findClosestSelectColor = exports.findClosestColor = exports.getDefaultTheme = exports.commentBackgroundWithLevel = exports.commentContextBarBackground = exports.temporaryCommentBackground = exports.commentUnderlineColor = exports.selectColors = exports.blockBackgroundColors = exports.blockTextColors = exports.blockColors = exports.getTheme = exports.accentColors = exports.colors = exports.grayscale = exports.darken = void 0;
const chroma_js_1 = __importDefault(require("chroma-js"));
const lodash_1 = __importDefault(require("lodash"));
const shadows_1 = require("./shadows");
const typeUtils_1 = require("./typeUtils");
const lightBase = (opacity) => `rgba(55, 53, 47, ${opacity})`;
const darken = (color, value) => (0, chroma_js_1.default)(color).darken(value).css();
exports.darken = darken;
function getGrayscale(tint) {
    const saturate = (color, saturation) => tint >= 0 && tint < 360
        ? color.set("hsl.s", saturation).set("hsl.h", tint)
        : color.set("hsl.s", 0);
    return {
        black: saturate(chroma_js_1.default.hsl(0, 0.01, 0.07), 0.16),
        darkgray: saturate(chroma_js_1.default.hsl(0, 0.01, 0.2), 0.08),
        gray: saturate(chroma_js_1.default.hsl(0, 0.01, 0.5), 0.06),
        lightgray: saturate(chroma_js_1.default.hsl(0, 0.01, 0.8), 0.04),
        white: saturate(chroma_js_1.default.hsl(0, 0.01, 1.0), 0.02),
    };
}
const basicColors = {
    inherit: "inherit",
    transparent: "transparent",
    black: "black",
    white: "white",
};
exports.grayscale = {
    light: getGrayscale(45),
    dark: getGrayscale(205),
};
const alphaColors = {
    whiteWithAlpha: (alpha = 1) => `rgba(255, 255, 255, ${alpha})`,
    blackWithAlpha: (alpha = 1) => `rgba(0, 0, 0, ${alpha})`,
    redWithAlpha: (alpha = 1) => `rgba(235, 87, 87, ${alpha})`,
    blueWithAlpha: (alpha = 1) => `rgba(35, 131, 226, ${alpha})`,
};
const oldColors = {
    blue: "#2383E2",
    red: "#EB5757",
    contentBorder: "#E4E3E2",
    contentGrayBackground: "#F7F6F5",
    contentPlaceholder: "#C4C4C4",
    defaultText: "rgb(66, 66, 65)",
    uiBlack: "#333",
    uiExtraLightGray: "#E2E2E2",
    uiGray: "#A5A5A5",
    uiLightBlack: "#888",
    uiLightBorder: "#F2F1F0",
    uiLightGray: "#C4C4C4",
};
const nakedColors = {
    EmailBaseColor: "#333333",
    EmailBorderColor: "#EEEEEE",
    EmailCaptionColor: "#AAAAAA",
    EmailPasswordBackground: "#F4F4F4",
    EmailSecondaryTextColor: "#787774",
    EmailLinkBackground: "#F9F9F8",
    EmailTitleColor: "#1D1B16",
    EmailFooterSecondaryTextColor: "#ACABA9",
    twitterBrandBlueColor: "#1da1f2",
    UIDocNotificationsDarkGrayColor: "#6A6A6A",
    UIDocNotificationsLightGrayBackground: "#F1F1F1",
    UIDocNotificationsMediumGrayBackground: "#D7D7D7",
    UIDocNotificationsMediumLightGrayBackground: "#E9E9E9",
};
const frontColors = {
    frontText: "#040404",
    frontTextLight: "rgba(0,0,0,0.4)",
    frontTextMedium: "rgba(0,0,0,0.6)",
    frontTextDark: "#111111",
    frontBorder: "rgba(0, 0, 0, 0.1)",
    frontCreamBackground: "#FFFEFC",
    frontCreamBackgroundDark: "#F9F5F1",
    frontCreamText: "#463D34",
    frontCreamBorder: "#D4CFCB",
    frontBlueBackground: "#EFF3F5",
    frontBlueBackgroundDark: "#D7E3E8",
    frontBlueText: "#2383E2",
    frontBlueBorder: "#B5C7D8",
    frontPurpleBackground: "#E7E6EA",
    frontPurpleBackgroundDark: "#D9D7DF",
    frontPurpleText: "#382F49",
    frontPurpleBorder: "#ACA8BD",
    frontOrangeBackground: "#F8EDE7",
    frontOrangeBackgroundDark: "#F2DCCF",
    frontOrangeText: "#5B3322",
    frontOrangeBorder: "#DEBEAC",
    frontRed: "#eb5757",
    frontPrimaryButtonBackground: "#E16259",
    frontPrimaryButtonBackgroundHovered: "#CF534A",
    frontPrimaryButtonBackgroundPressed: "#BF4D45",
    frontPrimaryButtonBorder: "#BE5643",
    frontSecondaryButtonBackground: "#FDF5F2",
    frontSecondaryButtonBackgroundHovered: "#FBEBE8",
    frontSecondaryButtonBackgroundPressed: "#F9E5E2",
    frontTertiaryButtonBackground: "transparent",
    frontTertiaryButtonBackgroundHovered: exports.grayscale.light.darkgray
        .alpha(0.08)
        .css(),
    frontTertiaryButtonBackgroundPressed: exports.grayscale.light.darkgray
        .alpha(0.16)
        .css(),
    frontQuaternaryButtonBackground: "#2383E2",
    frontQuaternaryButtonBackgroundHovered: "#2383E2",
    frontQuaternaryButtonBackgroundPressed: "#2383E2",
    frontQuaternaryButtonBorder: "#2383E2",
    frontMobilePhoneBackground: "#1d1d1d",
    frontLiveDemoSidebarText: "#777",
    frontLiveDemoSidebarLabelText: "rgba(55, 53, 47, 0.3)",
    frontTransparent: "transparent",
    frontBlackButtonBackground: exports.grayscale.dark.darkgray.css(),
    frontBlackButtonBackgroundHovered: "rgb(98, 102, 104)",
    frontBlackButtonBackgroundPressed: "rgb(120, 123, 123)",
    frontBlueButtonBackground: "#2383E2",
    frontBlueButtonHoveredBackground: (0, exports.darken)("#2383E2", 0.3),
    frontBlueButtonPressedBackground: (0, exports.darken)("#2383E2", 0.6),
};
const nonThemeColors = {
    regularTextColor: lightBase(1),
    mediumTextColor: lightBase(0.7),
    lightTextColor: lightBase(0.4),
    regularIconColor: exports.grayscale.light.darkgray.alpha(0.8).css(),
    mediumIconColor: exports.grayscale.light.darkgray.alpha(0.4).css(),
    lightIconColor: exports.grayscale.light.darkgray.alpha(0.2).css(),
    dividerColor: exports.grayscale.light.darkgray.alpha(0.09).css(),
    invertedTextColor: (0, chroma_js_1.default)("white").alpha(0.9).css(),
    selectionColor: 'rgba(35, 131, 226, 0.28)',
};
const newColors = {
    halfWhite: "rgba(255, 255, 255, 0.5)",
    diffTextColor: oldColors.blue,
    diffBackground: (0, chroma_js_1.default)(oldColors.blue).alpha(0.1).css(),
};
exports.colors = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, basicColors), alphaColors), oldColors), nakedColors), frontColors), nonThemeColors), newColors);
exports.accentColors = {
    light: {
        pink: {
            900: "rgba(44, 20, 32, 1)",
            800: "rgba(76, 35, 55, 1)",
            700: "rgba(111, 49, 81, 1)",
            600: "rgba(162, 51, 111, 1)",
            500: "rgba(193, 76, 138, 1)",
            400: "rgba(205, 116, 159, 1)",
            300: "rgba(223, 149, 183, 1)",
            200: "rgba(227, 188, 205, 1)",
            100: "rgba(245, 224, 233, 1)",
            50: "rgba(249, 238, 243, 0.8)",
            30: "rgba(251, 245, 251, 0.7)",
        },
        purple: {
            900: "rgba(38, 21, 46, 1)",
            800: "rgba(65, 36, 84, 1)",
            700: "rgba(90, 56, 114, 1)",
            600: "rgba(117, 77, 146, 1)",
            500: "rgba(144, 101, 176, 1)",
            400: "rgba(167, 130, 195, 1)",
            300: "rgba(188, 161, 207, 1)",
            200: "rgba(209, 192, 221, 1)",
            100: "rgba(232, 222, 238, 1)",
            50: "rgba(244, 240, 247, 0.8)",
            30: "rgba(249, 246, 252, 0.7)",
        },
        green: {
            900: "rgba(16, 36, 22, 1)",
            800: "rgba(28, 56, 41, 1)",
            700: "rgba(31, 79, 59, 1)",
            600: "rgba(51, 104, 78, 1)",
            500: "rgba(68, 131, 97, 1)",
            400: "rgba(108, 155, 125, 1)",
            300: "rgba(147, 181, 156, 1)",
            200: "rgba(184, 207, 187, 1)",
            100: "rgba(219, 237, 219, 1)",
            50: "rgba(237, 243, 236, 1)",
            30: "rgba(244, 248, 243, 0.7)",
        },
        gray: {
            900: "rgba(29, 27, 22, 1)",
            800: "rgba(50, 48, 44, 1)",
            700: "rgba(72, 71, 67, 1)",
            600: "rgba(95, 94, 91, 1)",
            500: "rgba(120, 119, 116, 1)",
            400: "rgba(145, 145, 142, 1)",
            300: "rgba(172, 171, 169, 1)",
            200: "rgba(199, 198, 196, 1)",
            100: "rgba(227, 226, 224, 1)",
            75: "rgba(227, 226, 224, 0.5)",
            50: "rgba(241, 241, 239, 1)",
            30: "rgba(249, 249, 248, 1)",
            0: "rgba(255, 255, 255, 1)",
        },
        translucentGray: {
            30: "rgba(10, 10, 10, 1)",
            50: "rgba(19, 19, 19, 1)",
            75: "rgba(255, 255, 255, 0.0135)",
            100: "rgba(255, 255, 255, 0.0375)",
            200: "rgba(255, 255, 255, 0.07)",
            300: "rgba(255, 255, 255, 0.11)",
            400: "rgba(255, 255, 255, 0.155)",
            500: "rgba(255, 255, 255, 0.335)",
            600: "rgba(255, 255, 255, 0.46)",
            700: "rgba(255, 255, 255, 0.62)",
            800: "rgba(255, 255, 255, 0.815)",
            850: "rgba(255, 255, 255, 0.89)",
            900: "rgba(255, 255, 255, 0.9875)",
        },
        orange: {
            900: "rgba(40, 24, 9, 1)",
            800: "rgba(73, 41, 14, 1)",
            700: "rgba(106, 59, 18, 1)",
            600: "rgba(141, 78, 23, 1)",
            500: "rgba(217, 115, 13, 1)",
            400: "rgba(215, 129, 58, 1)",
            300: "rgba(228, 155, 98, 1)",
            200: "rgba(236, 189, 155, 1)",
            100: "rgba(250, 222, 201, 1)",
            50: "rgba(251, 236, 221, 1)",
            30: "rgba(252, 245, 242, 0.7)",
        },
        brown: {
            900: "rgba(45, 21, 6, 1)",
            800: "rgba(68, 42, 30, 1)",
            700: "rgba(97, 62, 46, 1)",
            600: "rgba(128, 84, 63, 1)",
            500: "rgba(159, 107, 83, 1)",
            400: "rgba(187, 132, 108, 1)",
            300: "rgba(208, 161, 140, 1)",
            200: "rgba(218, 194, 183, 1)",
            100: "rgba(238, 224, 218, 1)",
            50: "rgba(244, 238, 238, 1)",
            30: "rgba(250, 246, 245, 0.7)",
        },
        red: {
            900: "rgba(48, 19, 15, 1)",
            800: "rgba(93, 23, 21, 1)",
            700: "rgba(134, 33, 32, 1)",
            600: "rgba(174, 47, 46, 1)",
            500: "rgba(212, 76, 71, 1)",
            400: "rgba(225, 111, 100, 1)",
            300: "rgba(227, 152, 142, 1)",
            200: "rgba(239, 186, 179, 1)",
            100: "rgba(255, 226, 221, 1)",
            50: "rgba(253, 235, 236, 1)",
            30: "rgba(253, 245, 243, 0.7)",
        },
        yellow: {
            900: "rgba(37, 25, 16, 1)",
            800: "rgba(64, 44, 27, 1)",
            700: "rgba(95, 64, 35, 1)",
            600: "rgba(131, 94, 51, 1)",
            500: "rgba(203, 145, 47, 1)",
            400: "rgba(203, 148, 51, 1)",
            300: "rgba(223, 175, 73, 1)",
            200: "rgba(234, 197, 103, 1)",
            100: "rgba(253, 236, 200, 1)",
            50: "rgba(251, 243, 219, 1)",
            30: "rgba(250, 247, 237, 0.7)",
        },
        blue: {
            900: "rgba(12, 29, 43, 1)",
            800: "rgba(24, 51, 71, 1)",
            700: "rgba(31, 74, 104, 1)",
            600: "rgba(45, 99, 135, 1)",
            500: "rgba(51, 126, 169, 1)",
            400: "rgba(91, 151, 189, 1)",
            300: "rgba(132, 177, 206, 1)",
            200: "rgba(170, 203, 223, 1)",
            100: "rgba(211, 229, 239, 1)",
            50: "rgba(231, 243, 248, 1)",
            30: "rgba(241, 248, 251, 0.7)",
        },
    },
    dark: {
        pink: {
            30: "rgba(246, 218, 247, 1)",
            50: "rgba(35, 28, 31, 1)",
            75: "rgba(42, 32, 36, 1)",
            100: "rgba(48, 34, 40, 1)",
            200: "rgba(59, 39, 48, 1)",
            300: "rgba(78, 44, 60, 1)",
            400: "rgba(105, 49, 76, 1)",
            500: "rgba(144, 58, 101, 1)",
            600: "rgba(185, 65, 128, 1)",
            700: "rgba(196, 67, 135, 1)",
            800: "rgba(201, 75, 140, 1)",
            900: "rgba(209, 87, 150, 1)",
        },
        purple: {
            30: "rgba(232, 222, 246, 1)",
            50: "rgba(31, 29, 33, 1)",
            75: "rgba(38, 33, 42, 1)",
            100: "rgba(43, 36, 49, 1)",
            200: "rgba(48, 39, 57, 1)",
            300: "rgba(60, 45, 73, 1)",
            400: "rgba(73, 47, 100, 1)",
            500: "rgba(112, 74, 150, 1)",
            600: "rgba(128, 83, 175, 1)",
            700: "rgba(141, 91, 193, 1)",
            800: "rgba(157, 103, 210, 1)",
            900: "rgba(157, 104, 211, 1)",
        },
        green: {
            30: "rgba(215, 232, 217, 1)",
            50: "rgba(29, 34, 32, 1)",
            75: "rgba(32, 38, 35, 1)",
            100: "rgba(34, 43, 38, 1)",
            200: "rgba(35, 49, 42, 1)",
            300: "rgba(36, 61, 48, 1)",
            400: "rgba(43, 89, 63, 1)",
            500: "rgba(45, 118, 80, 1)",
            600: "rgba(42, 142, 92, 1)",
            700: "rgba(45, 153, 100, 1)",
            800: "rgba(60, 157, 106, 1)",
            900: "rgba(82, 158, 114, 1)",
        },
        gray: {
            0: "rgba(0, 0, 0, 1)",
            30: "rgba(21, 21, 21, 1)",
            50: "rgba(25, 25, 25, 1)",
            75: "rgba(28, 28, 28, 1)",
            100: "rgba(32, 32, 32, 1)",
            200: "rgba(37, 37, 37, 1)",
            300: "rgba(47, 47, 47, 1)",
            400: "rgba(55, 55, 55, 1)",
            500: "rgba(90, 90, 90, 1)",
            600: "rgba(127, 127, 127, 1)",
            700: "rgba(155, 155, 155, 1)",
            800: "rgba(211, 211, 211, 1)",
            850: "rgba(225, 225, 225, 1)",
            900: "rgba(246, 246, 246, 1)",
        },
        transparentGray: {
            30: "rgba(21, 21, 21, 0)",
            50: "rgba(25, 25, 25, 0)",
            75: "rgba(28, 28, 28, 0)",
            100: "rgba(32, 32, 32, 0)",
            200: "rgba(37, 37, 37, 0)",
            300: "rgba(47, 47, 47, 0)",
            400: "rgba(55, 55, 55, 0)",
            500: "rgba(90, 90, 90, 0)",
            600: "rgba(127, 127, 127, 0)",
            700: "rgba(155, 155, 155, 0)",
            800: "rgba(211, 211, 211, 0)",
            850: "rgba(225, 225, 225, 0)",
            900: "rgba(246, 246, 246, 0)",
        },
        translucentGray: {
            30: "rgba(21, 21, 21, 1)",
            50: "rgba(25, 25, 25, 1)",
            75: "rgba(255, 255, 255, 0.015)",
            100: "rgba(255, 255, 255, 0.03)",
            200: "rgba(255, 255, 255, 0.055)",
            300: "rgba(255, 255, 255, 0.095)",
            400: "rgba(255, 255, 255, 0.13)",
            500: "rgba(255, 255, 255, 0.283)",
            600: "rgba(255, 255, 255, 0.445)",
            700: "rgba(255, 255, 255, 0.565)",
            800: "rgba(255, 255, 255, 0.81)",
            850: "rgba(255, 255, 255, 0.87)",
            900: "rgba(255, 255, 255, 0.96)",
        },
        orange: {
            30: "rgba(240, 224, 200, 1)",
            50: "rgba(37, 31, 27, 1)",
            75: "rgba(44, 35, 30, 1)",
            100: "rgba(56, 40, 30, 1)",
            200: "rgba(66, 47, 34, 1)",
            300: "rgba(92, 59, 35, 1)",
            400: "rgba(133, 76, 29, 1)",
            500: "rgba(167, 91, 26, 1)",
            600: "rgba(205, 108, 20, 1)",
            700: "rgba(216, 118, 32, 1)",
            800: "rgba(228, 133, 56, 1)",
            900: "rgba(199, 125, 72, 1)",
        },
        brown: {
            30: "rgba(244, 224, 211, 1)",
            50: "rgba(35, 30, 28, 1)",
            75: "rgba(41, 34, 31, 1)",
            100: "rgba(47, 39, 35, 1)",
            200: "rgba(54, 40, 34, 1)",
            300: "rgba(74, 50, 40, 1)",
            400: "rgba(96, 59, 44, 1)",
            500: "rgba(132, 86, 65, 1)",
            600: "rgba(153, 103, 80, 1)",
            700: "rgba(170, 117, 95, 1)",
            800: "rgba(178, 126, 103, 1)",
            900: "rgba(186, 133, 111, 1)",
        },
        red: {
            30: "rgba(253, 218, 218, 1)",
            50: "rgba(36, 30, 29, 1)",
            75: "rgba(42, 32, 31, 1)",
            100: "rgba(54, 36, 34, 1)",
            200: "rgba(62, 40, 37, 1)",
            300: "rgba(82, 46, 42, 1)",
            400: "rgba(110, 54, 48, 1)",
            500: "rgba(143, 58, 53, 1)",
            600: "rgba(180, 65, 60, 1)",
            700: "rgba(205, 73, 69, 1)",
            800: "rgba(222, 85, 80, 1)",
            900: "rgba(223, 84, 82, 1)",
        },
        yellow: {
            30: "rgba(240, 226, 203, 1)",
            50: "rgba(35, 31, 26, 1)",
            75: "rgba(43, 37, 31, 1)",
            100: "rgba(57, 46, 30, 1)",
            200: "rgba(64, 51, 36, 1)",
            300: "rgba(86, 67, 40, 1)",
            400: "rgba(137, 99, 42, 1)",
            500: "rgba(155, 110, 35, 1)",
            600: "rgba(191, 134, 24, 1)",
            700: "rgba(202, 142, 27, 1)",
            800: "rgba(217, 158, 53, 1)",
            900: "rgba(202, 152, 73, 1)",
        },
        blue: {
            30: "rgba(203, 230, 247, 1)",
            50: "rgba(27, 31, 34, 1)",
            75: "rgba(31, 37, 41, 1)",
            100: "rgba(29, 40, 46, 1)",
            200: "rgba(27, 45, 56, 1)",
            300: "rgba(20, 58, 78, 1)",
            400: "rgba(40, 69, 108, 1)",
            500: "rgba(41, 90, 149, 1)",
            600: "rgba(38, 111, 192, 1)",
            700: "rgba(46, 124, 209, 1)",
            800: "rgba(70, 148, 242, 1)",
            900: "rgba(94, 135, 201, 1)",
        },
    },
};
function getThemeColors() {
    return Object.assign(Object.assign({ mode: {
            light: "light",
            dark: "dark",
        }, regularTextColor: {
            light: lightBase(1),
            dark: exports.accentColors.dark.translucentGray[800],
        }, darkTextColor: {
            light: lightBase(0.8),
            dark: exports.accentColors.dark.translucentGray[700],
        }, mediumTextColor: {
            light: lightBase(0.65),
            dark: exports.accentColors.dark.translucentGray[600],
        }, lightTextColor: {
            light: lightBase(0.5),
            dark: exports.accentColors.dark.translucentGray[500],
        }, actionMenuButtonTextColor: {
            light: lightBase(0.65),
            dark: exports.accentColors.dark.gray[700],
        }, pageTitlePlaceholderTextColor: {
            light: "rgba(55, 53, 47, 0.15)",
            dark: exports.accentColors.dark.gray[400],
        }, headerBlockPlaceholderTextColor: {
            light: "rgba(55, 53, 47, 0.2)",
            dark: exports.accentColors.dark.gray[400],
        }, regularInvertedTextColor: {
            light: exports.grayscale.light.white.alpha(0.9).css(),
            dark: exports.accentColors.dark.gray[800],
        }, mediumInvertedTextColor: {
            light: exports.grayscale.light.lightgray.alpha(0.6).css(),
            dark: exports.accentColors.dark.gray[600],
        }, regularIconColor: {
            light: lightBase(0.85),
            dark: exports.accentColors.dark.translucentGray[800],
        }, mediumIconColor: {
            light: lightBase(0.45),
            dark: exports.accentColors.dark.translucentGray[600],
        }, lightIconColor: {
            light: lightBase(0.35),
            dark: exports.accentColors.dark.translucentGray[500],
        }, lightDividerColor: {
            light: exports.grayscale.light.darkgray.alpha(0.06).css(),
            dark: exports.accentColors.dark.translucentGray[200],
        }, regularDividerColor: {
            light: exports.grayscale.light.darkgray.alpha(0.09).css(),
            dark: exports.accentColors.dark.translucentGray[300],
        }, darkDividerColor: {
            light: exports.grayscale.light.darkgray.alpha(0.16).css(),
            dark: exports.accentColors.dark.translucentGray[400],
        }, tableDividerColor: {
            light: "rgb(233,233,231)",
            dark: exports.accentColors.dark.gray[300],
        }, tableLightDividerColor: {
            light: "rgb(238,238,237)",
            dark: exports.accentColors.dark.gray[200],
        }, linkDecorationColor: {
            light: exports.grayscale.light.darkgray.alpha(0.25).css(),
            dark: exports.accentColors.dark.gray[400],
        }, strikethroughLineColor: {
            light: exports.grayscale.light.darkgray.alpha(0.25).css(),
            dark: exports.accentColors.dark.gray[600],
        }, opacityLinkDecorationColor: {
            light: exports.grayscale.light.darkgray.alpha(0.4).css(),
            dark: exports.accentColors.dark.translucentGray[500],
        }, inlineInputBackground: {
            light: "rgba(148, 148, 148, 0.15)",
            dark: exports.accentColors.dark.translucentGray[200],
        }, regularEmojiColor: {
            light: exports.colors.black,
            dark: exports.accentColors.dark.gray[900],
        }, updateSidebarBackground: {
            light: "#F6F6F6",
            dark: "#F6F6F6",
        }, sidebarTextColor: {
            light: "rgba(25, 23, 17, 0.6)",
            dark: exports.accentColors.dark.gray[700],
        }, sidebarBackground: {
            light: "#FBFBFA",
            dark: exports.accentColors.dark.gray[100],
        }, desktopTabsSidebarBackground: {
            light: "rgba(247, 247, 245, 1)",
            dark: exports.accentColors.dark.gray[100],
        }, cardSidebarBackground: {
            light: "#FBFBFA",
            dark: exports.accentColors.dark.translucentGray[100],
        }, androidSidebarBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.gray[100],
        }, floatingSidebarBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.gray[200],
        }, groupedFormBackground: {
            light: exports.colors.blackWithAlpha(0.025),
            dark: exports.accentColors.dark.gray[100],
        }, groupedFormBorder: {
            light: exports.grayscale.light.darkgray.alpha(0.09).css(),
            dark: exports.accentColors.dark.gray[200],
        }, sidebarItemSelectedBackground: {
            light: "rgba(0, 0, 0, 0.04)",
            dark: exports.accentColors.dark.translucentGray[200],
        }, groupedFormLabel: {
            light: "#6B6B6B",
            dark: "#6B6B6B",
        }, sidebarSecondaryBackground: {
            light: exports.colors.blackWithAlpha(0.025),
            dark: exports.colors.blackWithAlpha(0.025),
        }, sidebarSwitcherFooterBackground: {
            light: "#FBFAF9",
            dark: exports.accentColors.dark.gray[200],
        }, sidebarHideButtonHoveredBackground: {
            light: (0, exports.darken)("#E8E7E4", 0.3),
            dark: exports.accentColors.dark.gray[300],
        }, sidebarHideButtonPressedBackground: {
            light: (0, exports.darken)("#E8E7E4", 0.6),
            dark: exports.accentColors.dark.gray[200],
        }, mobileSidebarIOSBackground: {
            light: "rgb(247, 246, 243)",
            dark: exports.accentColors.dark.gray[100],
        }, mobileSidebarAndroidBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.gray[100],
        }, onboardingSidebarOverlay: {
            light: "rgba(251, 251, 250, 0.6)",
            dark: "rgba(15, 15, 15, 0.7)",
        }, onboardingContentOverlay: {
            light: "rgba(255, 255, 255, 0.8)",
            dark: "rgba(15, 15, 15, 0.7)",
        }, onboardingFlatBackground: {
            light: "rgb(246, 246, 245)",
            dark: "rgb(55, 60, 63)",
        }, onboardingExpandIconColor: {
            light: "rgb(176, 175, 172)",
            dark: "rgb(176, 175, 172)",
        }, contentBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.gray[50],
        }, cardContentBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.gray[100],
        }, contentBackgroundTransparent: {
            light: `rgba(255,255,255,0)`,
            dark: exports.accentColors.dark.transparentGray[50],
        }, cardContentBackgroundTransparent: {
            light: `rgba(255, 255, 255, 0)`,
            dark: exports.accentColors.dark.transparentGray[100],
        }, overlaySmokescreen: {
            light: "rgba(0, 0, 0, 0.4)",
            dark: "rgba(15, 15, 15, 0.8)",
        }, calendarItemBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.gray[300],
        }, calendarItemHoveredBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.gray[400],
        }, popoverBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.gray[200],
        }, popoverHoveredBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.gray[300],
        }, peekModalBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.gray[100],
        }, boardItemDefaultBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.translucentGray[200],
        }, boardItemDefaultHoveredBackground: {
            light: exports.grayscale.light.darkgray.alpha(0.08).css(),
            dark: exports.accentColors.dark.translucentGray[300],
        }, collectionGalleryPreviewCardBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.translucentGray[200],
        }, collectionGalleryPreviewCardCover: {
            light: "rgba(55, 53, 47, 0.025)",
            dark: exports.accentColors.dark.translucentGray[100],
        }, collectionUnsetDependencyArrow: {
            light: exports.accentColors.light.gray[300],
            dark: exports.accentColors.dark.gray[600],
        }, collectionValidDependencyArrow: {
            light: exports.accentColors.light.yellow[300],
            dark: exports.accentColors.dark.yellow[600],
        }, collectionInvalidDependencyArrow: {
            light: exports.accentColors.light.red[300],
            dark: exports.accentColors.dark.red[600],
        }, modalBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.gray[100],
        }, modalUnderlayBackground: {
            light: exports.grayscale.light.black.alpha(0.6).css(),
            dark: "rgba(15, 15, 15, 0.8)",
        }, tooltipBackground: {
            light: exports.grayscale.light.black.css(),
            dark: exports.accentColors.dark.gray[300],
        }, filterGroupBackground: {
            light: exports.colors.blackWithAlpha(0.02),
            dark: exports.accentColors.dark.translucentGray[100],
        }, beigeBannerBackground: { light: "#FBF8F3", dark: "rgb(55, 60, 63)" }, darkBannerBackground: { light: "#EAE9E7", dark: "rgb(55, 60, 63)" }, keyboardDoneBarBackground: { light: "#F0F1F2", dark: "#27292B" }, keyboardActionBarBackground: { light: exports.colors.white, dark: "#272829" }, UIUserAvatarBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.gray[700],
        }, codeBlockBackground: {
            light: "rgb(247, 246, 243)",
            dark: exports.accentColors.dark.translucentGray[100],
        }, codeBlockButtonBackground: {
            light: "#EAE9E5",
            dark: exports.accentColors.dark.gray[200],
        }, tableHeaderRowColumnBackground: {
            light: "rgb(247, 246, 243)",
            dark: exports.accentColors.dark.translucentGray[100],
        }, embedPlaceholderBackground: {
            light: (0, chroma_js_1.default)("rgb(247, 246, 243)").darken(0.1).css(),
            dark: exports.accentColors.dark.translucentGray[100],
        }, defaultBadgeBackground: {
            light: exports.grayscale.light.lightgray.alpha(0.5).css(),
            dark: exports.accentColors.dark.translucentGray[200],
        }, redBadgeBackground: {
            light: exports.colors.red,
            dark: exports.accentColors.dark.red[600],
        }, inputBackground: {
            light: "rgba(242,241,238,0.6)",
            dark: exports.accentColors.dark.translucentGray[200],
        }, tokenInputMenuItemBackground: {
            light: "rgba(242,241,238,0.6)",
            dark: exports.accentColors.dark.translucentGray[100],
        }, marginDiscussionBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.gray[100],
        }, hoveredDiscussionBackground: {
            light: exports.grayscale.light.darkgray.alpha(0.03).css(),
            dark: exports.accentColors.dark.gray[100],
        }, hoveredMarginDiscussionBackground: {
            light: "rgb(249, 249, 248)",
            dark: exports.accentColors.dark.gray[100],
        }, selectedMarginDiscussionBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.gray[200],
        }, focusDiscussionBackground: {
            light: "rgba(255, 212, 0, 0.065)",
            dark: exports.accentColors.dark.gray[200],
        }, focusDiscussionInputBackground: {
            light: exports.grayscale.light.darkgray.alpha(0.06).css(),
            dark: exports.accentColors.dark.translucentGray[200],
        }, discussionInputActivatedBackground: {
            light: exports.colors.white,
            dark: "transparent",
        }, blueColor: {
            light: "rgba(35, 131, 226, 1)",
            dark: "rgba(35, 131, 226, 1)",
        }, buttonBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.gray[100],
        }, filterPillBackground: {
            light: "rgba(35, 131, 226, 0.03)",
            dark: "rgba(35, 131, 226, 0.07)",
        }, filterPillBorder: {
            light: "rgba(35, 131, 226, 0.35)",
            dark: "rgba(35, 131, 226, 0.35)",
        }, buttonHoveredBackground: {
            light: exports.grayscale.light.darkgray.alpha(0.08).css(),
            dark: exports.accentColors.dark.translucentGray[200],
        }, outlineButtonHoveredBackground: {
            light: "rgb(225, 225, 225)",
            dark: exports.accentColors.dark.gray[300],
        }, outlineButtonPressedBackground: {
            light: exports.grayscale.light.darkgray.alpha(0.16).css(),
            dark: exports.accentColors.dark.gray[200],
        }, buttonPressedBackground: {
            light: exports.grayscale.light.darkgray.alpha(0.16).css(),
            dark: exports.accentColors.dark.translucentGray[100],
        }, cardBackground: {
            light: exports.grayscale.light.darkgray.alpha(0.03).css(),
            dark: exports.accentColors.dark.gray[200],
        }, cardHoveredBackground: {
            light: exports.grayscale.light.darkgray.alpha(0.03).css(),
            dark: exports.accentColors.dark.gray[300],
        }, cardPressedBackground: {
            light: exports.grayscale.light.darkgray.alpha(0.06).css(),
            dark: exports.accentColors.dark.gray[200],
        }, blueButtonBackground: {
            light: exports.colors.blue,
            dark: exports.accentColors.dark.blue[600],
        }, blueButtonHoveredBackground: {
            light: (0, exports.darken)(exports.colors.blue, 0.3),
            dark: (0, exports.darken)(exports.colors.blue, 0.3),
        }, blueButtonPressedBackground: {
            light: (0, exports.darken)(exports.colors.blue, 0.6),
            dark: (0, exports.darken)(exports.colors.blue, 0.6),
        }, commentFileDropZoneBackground: {
            light: exports.colors.whiteWithAlpha(0.8),
            dark: exports.accentColors.dark.translucentGray[100],
        }, white: {
            light: exports.colors.white,
            dark: exports.colors.black,
        }, whiteButtonBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.gray[200],
        }, redButtonBackground: {
            light: exports.colors.red,
            dark: exports.accentColors.dark.red[600],
        }, redButtonHoveredBackground: {
            light: (0, exports.darken)(exports.colors.red, 0.3),
            dark: (0, exports.darken)(exports.accentColors.dark.red[600], 0.3),
        }, redButtonPressedBackground: {
            light: (0, exports.darken)(exports.colors.red, 0.6),
            dark: (0, exports.darken)(exports.accentColors.dark.red[600], 0.6),
        }, buttonGroupBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.gray[300],
        }, whiteButtonHoveredBackground: {
            light: "rgb(239, 239, 238)",
            dark: exports.accentColors.dark.gray[300],
        }, whiteButtonPressedBackground: {
            light: "rgb(223, 223, 222)",
            dark: exports.accentColors.dark.gray[200],
        }, segmentedControlActiveBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.gray[500],
        }, outlineBlueButtonHoveredBackground: {
            light: "rgba(35, 131, 226, 0.07)",
            dark: "rgba(35, 131, 226, 0.07)",
        }, outlineBlueButtonPressedBackground: {
            light: "rgba(35, 131, 226, 0.14)",
            dark: "rgba(35, 131, 226, 0.14)",
        }, outlineRedButtonBorder: {
            light: exports.colors.redWithAlpha(0.5),
            dark: exports.accentColors.dark.red[400],
        }, outlinefrontSecondaryButtonHoveredBackground: {
            light: exports.colors.redWithAlpha(0.1),
            dark: exports.colors.redWithAlpha(0.1),
        }, outlinefrontSecondaryButtonPressedBackground: {
            light: exports.colors.redWithAlpha(0.2),
            dark: exports.colors.redWithAlpha(0.2),
        }, outlineButtonBorder: {
            light: exports.grayscale.light.darkgray.alpha(0.16).css(),
            dark: exports.accentColors.dark.translucentGray[400],
        }, outlinePressedButtonBorder: {
            light: exports.grayscale.light.darkgray.alpha(0.9).css(),
            dark: exports.accentColors.dark.translucentGray[900],
        }, filterGroupBorder: {
            light: exports.grayscale.light.darkgray.alpha(0.1).css(),
            dark: exports.accentColors.dark.translucentGray[200],
        }, radioButtonBorder: {
            light: exports.colors.blackWithAlpha(0.2),
            dark: exports.accentColors.dark.translucentGray[400],
        }, timelineBackground: {
            light: "rgb(253,253,253)",
            dark: exports.accentColors.dark.gray[50],
        }, peekTimelineBackground: {
            light: "rgb(253,253,253)",
            dark: exports.accentColors.dark.gray[100],
        }, timelineDarkerBackground: {
            light: "rgb(247,247,247)",
            dark: exports.accentColors.dark.translucentGray[100],
        }, peekTimelineDarkerBackground: {
            light: "rgb(247,247,247)",
            dark: exports.accentColors.dark.translucentGray[100],
        }, timelineRed: {
            light: "rgb(211,79,67)",
            dark: exports.accentColors.dark.red[600],
        }, topbarFavorite: {
            light: "#F6C050",
            dark: exports.accentColors.dark.yellow[900],
        }, calendarTodayBackground: {
            light: "#EB5757",
            dark: exports.accentColors.dark.red[700],
        }, importOptionsButtonBackground: {
            light: exports.colors.white,
            dark: exports.accentColors.dark.translucentGray[100],
        }, importOptionsIconWrapBackground: {
            light: "#FBFBFA",
            dark: exports.accentColors.dark.gray[100],
        }, accentColors: exports.accentColors, selectLightGray: {
            light: {
                900: "rgba(29, 27, 22, 0.7)",
                800: "rgba(50, 48, 44, 1)",
                700: "rgba(72, 71, 67, 0.5)",
                600: "rgba(95, 94, 91, 0.5)",
                500: "rgba(120, 119, 116, 0.5)",
                400: "rgba(145, 145, 142, 0.5)",
                300: "rgba(172, 171, 169, 0.5)",
                200: "rgba(199, 198, 196, 0.5)",
                100: "rgba(227, 226, 224, 0.5)",
                50: "rgba(241, 241, 239, 0.5)",
                30: "rgba(249, 249, 245, 0.5)",
            },
            dark: {
                30: "rgba(21, 21, 21, 1)",
                50: "rgba(25, 25, 25, 1)",
                75: "rgba(28, 28, 28, 1)",
                100: "rgba(32, 32, 32, 1)",
                200: "rgba(37, 37, 37, 1)",
                300: "rgba(47, 47, 47, 1)",
                400: "rgba(55, 55, 55, 1)",
                500: "rgba(90, 90, 90, 1)",
                600: "rgba(127, 127, 127, 1)",
                700: "rgba(155, 155, 155, 1)",
                800: "rgba(211, 211, 211, 1)",
                850: "rgba(225, 225, 225, 1)",
                900: "rgba(246, 246, 246, 1)",
            },
        }, guestIconColor: {
            light: "rgba(218, 163, 64, 1)",
            dark: "rgba(218, 163, 64, 1)",
        }, legacyDefaultSelectColor: {
            light: exports.grayscale.light.lightgray.alpha(0.5).css(),
            dark: exports.accentColors.dark.translucentGray[300],
        }, legacyRedSelectColor: {
            light: "rgba(255,0,26,0.2)",
            dark: "rgba(255,115,105, 0.5)",
        }, equationEmptyPlaceholderBackground: {
            light: (0, chroma_js_1.default)("rgb(247, 246, 243)").darken(0.1).css(),
            dark: exports.accentColors.dark.translucentGray[100],
        }, equationErrorPlaceholderBackground: {
            light: exports.colors.redWithAlpha(0.1),
            dark: exports.accentColors.dark.red[300],
        }, equationTemporaryPlaceholderBackground: {
            light: "rgba(35, 131, 226, 0.14)",
            dark: exports.accentColors.dark.translucentGray[100],
        }, simpleTableSelectionBorder: {
            light: "rgba(116, 182, 219, 1)",
            dark: exports.accentColors.dark.blue[900],
        }, onboardingBackground: {
            light: "rgb(247, 246, 243)",
            dark: exports.accentColors.dark.gray[100],
        }, onboardingPreviewBackground: {
            light: "rgb(247, 247, 245)",
            dark: exports.accentColors.dark.gray[100],
        }, onboardingBackground_exp01: {
            light: "#FAFAF8",
            dark: exports.accentColors.dark.gray[100],
        }, onboardingBackgroundMask: {
            light: "rgba(247, 246, 243, 0)",
            dark: "rgba(55, 60, 63, 0)",
        }, errorText: {
            light: "#eb5757",
            dark: exports.accentColors.dark.red[700],
        }, illustrationFilter: {
            light: undefined,
            dark: "contrast(0)",
        }, transclusionBorderColor: {
            light: "#e38676",
            dark: exports.accentColors.dark.red[400],
        }, aiBlockBorderColor: {
            light: exports.accentColors.light.purple[300],
            dark: exports.accentColors.dark.purple[300],
        }, aiPurpleColor: {
            light: exports.accentColors.light.purple[400],
            dark: exports.accentColors.dark.purple[800],
        }, msDocDiscussionInputPreview: {
            light: "#29528E",
            dark: "#29528E",
        }, msExcelDiscussionInputPreview: {
            light: "#47723E",
            dark: "#47723E",
        }, pdfDiscussionInputPreview: {
            light: "#D34F43",
            dark: "#D34F43",
        }, commentUnreadIndicator: {
            light: "#CA4B44",
            dark: "#CA4B44",
        }, invoiceGreen: {
            light: "#53A83F",
            dark: "#53A83F",
        }, statusTokenBackground: {
            light: {
                green: "rgb(0 150 88 / 6%)",
                yellow: "rgb(234 197 103 / 25%)",
                red: "rgb(211 79 67 / 10%)",
            },
            dark: {
                green: "rgb(0 150 88 / 10%)",
                yellow: "rgb(234 197 103 / 10%)",
                red: "rgb(211 79 67 / 10%)",
            },
        }, statusTokenIndicator: {
            light: {
                green: "rgb(0 150 88)",
                yellow: "rgb(234 197 103)",
                red: "rgb(211 79 67)",
            },
            dark: {
                green: "rgb(0 150 88)",
                yellow: "rgb(234 197 103)",
                red: "rgb(211 79 67)",
            },
        }, statusTokenText: {
            light: {
                green: "#2D7650",
                yellow: "#CA8E1B",
                red: "#BE4135",
            },
            dark: {
                green: "#2D7650",
                yellow: "#CA8E1B",
                red: "#BE4135",
            },
        }, guestTokenBackground: {
            light: "rgba(218, 163, 64, 0.2)",
            dark: "rgba(218, 163, 64, 0.2)",
        }, teamAccessLevelIcons: {
            light: {
                blue: "#2383E2",
                orange: "#F98F2C",
                red: "#D34F43",
            },
            dark: {
                blue: "#2383E2",
                orange: "#F98F2C",
                red: "#D34F43",
            },
        }, dismissIconFill: {
            light: exports.accentColors.light.gray[400],
            dark: exports.accentColors.dark.gray[800],
        } }, shadows_1.themeShadows), { accent: {
            light: {
                purple: {
                    icon: exports.accentColors.light.purple[500],
                    background: exports.accentColors.light.purple[50],
                },
            },
            dark: {
                purple: {
                    icon: exports.accentColors.dark.purple[800],
                    background: exports.accentColors.dark.purple[200],
                },
            },
        } });
}
function getThemeUncached(args) {
    const themeColors = getThemeColors();
    const result = {};
    const keys = Object.keys(themeColors);
    for (const key of keys) {
        result[key] = themeColors[key][args.theme];
    }
    return result;
}
const themeCache = new Map();
function getTheme(args) {
    const key = `${args.theme}`;
    const cached = themeCache.get(key);
    if (cached) {
        return cached;
    }
    else {
        const result = getThemeUncached(args);
        themeCache.set(key, result);
        return result;
    }
}
exports.getTheme = getTheme;
exports.blockColors = [
    "default",
    "gray",
    "brown",
    "orange",
    "yellow",
    "teal",
    "blue",
    "purple",
    "pink",
    "red",
    "gray_background",
    "brown_background",
    "orange_background",
    "yellow_background",
    "teal_background",
    "blue_background",
    "purple_background",
    "pink_background",
    "red_background",
];
exports.blockTextColors = exports.blockColors.filter(color => color.indexOf("background") === -1);
exports.blockBackgroundColors = exports.blockColors.filter(color => color.indexOf("background") !== -1);
exports.selectColors = [
    "default",
    "gray",
    "brown",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "pink",
    "red",
];
exports.commentUnderlineColor = "rgb(255, 212, 0)";
exports.temporaryCommentBackground = "rgba(255, 212, 0, 0.14)";
exports.commentContextBarBackground = "rgba(255, 212, 0, 0.8)";
const commentBackgroundWithLevel = ({ level, selected, hovered, }) => {
    const selectCommentLevelIncrement = selected ? 3 : 0;
    const hoveredCommentLevelIncrement = hovered ? 2 : 0;
    const alphaScalingFactor = (level === 1 ? level : Math.min(level, 2) * 2) +
        selectCommentLevelIncrement +
        hoveredCommentLevelIncrement;
    return (0, chroma_js_1.default)(exports.commentUnderlineColor)
        .alpha(Math.min(0.14 * alphaScalingFactor, 1))
        .css();
};
exports.commentBackgroundWithLevel = commentBackgroundWithLevel;
const getDefaultTheme = () => getTheme({ theme: "light" });
exports.getDefaultTheme = getDefaultTheme;
function findClosestColor(color, options) {
    const result = (0, typeUtils_1.objectKeys)(options).map((name) => {
        const value = options[name];
        try {
            const distance = chroma_js_1.default.distance(color, value);
            return { name, distance };
        }
        catch (e) {
            return { name, distance: 360 };
        }
    });
    const min = lodash_1.default.minBy(result, ({ distance }) => distance);
    return min.name;
}
exports.findClosestColor = findClosestColor;
function findClosestSelectColor(providedColor) {
    const backgroundColors = {};
    for (const color of exports.selectColors) {
        const selectTokenStyle = getSelectTokenStyle(getTheme({ theme: "light" }), color);
        backgroundColors[color] = selectTokenStyle.backgroundColor;
    }
    return findClosestColor(providedColor, backgroundColors);
}
exports.findClosestSelectColor = findClosestSelectColor;
function findClosestThemeColor(providedColor) {
    const backgroundColors = {};
    const theme = getTheme({ theme: "light" });
    for (const [colorName, colorSet] of Object.entries(theme.accentColors)) {
        for (const [shadeNum, color] of Object.entries(colorSet)) {
            backgroundColors[`${colorName}:${shadeNum}`] = color;
        }
    }
    const colorKey = findClosestColor(providedColor, backgroundColors);
    const [colorName, shade] = colorKey.split(":");
    return { colorName, shade: parseInt(shade) };
}
exports.findClosestThemeColor = findClosestThemeColor;
function flattenColorsByAlpha(colorStrings) {
    const colors = colorStrings.map(string => (0, chroma_js_1.default)(string)).reverse();
    let backColor = colors.shift();
    if (!backColor) {
        return "red";
    }
    for (const frontColor of colors) {
        const frontAlpha = frontColor.alpha();
        const backAlpha = backColor.alpha();
        if (frontAlpha === 1) {
            backColor = frontColor;
            continue;
        }
        const newAlpha = Math.min(frontAlpha + backAlpha, 1);
        const ratio = frontAlpha / backAlpha;
        backColor = chroma_js_1.default
            .mix(backColor.alpha(1), frontColor.alpha(1), ratio)
            .alpha(newAlpha);
    }
    return backColor.css();
}
exports.flattenColorsByAlpha = flattenColorsByAlpha;
function getHexFromRGB(color) {
    if (!color) {
        return undefined;
    }
    const splitComponents = color.split(/\(|\)/);
    if (splitComponents.length !== 3) {
        return undefined;
    }
    const colorComponents = splitComponents[1].split(/(?:,| )+/);
    const isRGB = splitComponents[0] === "rgb" && colorComponents.length === 3;
    const isRGBA = splitComponents[0] === "rgba" && colorComponents.length === 4;
    if (!isRGB && !isRGBA) {
        return undefined;
    }
    const r = Number(colorComponents[0]);
    const g = Number(colorComponents[1]);
    const b = Number(colorComponents[2]);
    let hex = `#${numberToHex(r)}${numberToHex(g)}${numberToHex(b)}`;
    let a = 255;
    if (isRGBA) {
        a = Math.round(Number(colorComponents[3]) * 255);
    }
    hex = hex.concat(numberToHex(a));
    return hex.toUpperCase();
}
exports.getHexFromRGB = getHexFromRGB;
function numberToHex(n) {
    var h = n.toString(16);
    if (h.length === 1) {
        h = "0".concat(h);
    }
    return h;
}
function getValidatedSelectColorSettings(theme, color) {
    const selectedColorSettings = color && theme.accentColors[color];
    return selectedColorSettings || theme.selectLightGray;
}
function getSelectTokenStyle(theme, color) {
    const settings = getValidatedSelectColorSettings(theme, color);
    const selectTextColor = {
        light: settings[800],
        dark: "rgba(255, 255, 255, 0.805)",
    };
    const selectBackgroundColor = {
        light: settings[100],
        dark: color === "gray" ? settings[500] : settings[400],
    };
    const selectMenuBackgroundColor = {
        light: settings[100],
        dark: color === "gray" ? settings[500] : settings[400],
    };
    if (theme.mode === "dark") {
        return {
            textColor: selectTextColor.dark,
            backgroundColor: selectBackgroundColor.dark,
            menuBackgroundColor: selectMenuBackgroundColor.dark,
        };
    }
    else {
        return {
            textColor: selectTextColor.light,
            backgroundColor: selectBackgroundColor.light,
            menuBackgroundColor: selectMenuBackgroundColor.light,
        };
    }
}
exports.getSelectTokenStyle = getSelectTokenStyle;
function getBoardSelectStyle(theme, color) {
    const settings = getValidatedSelectColorSettings(theme, color);
    const isLightGray = !color || color === "default";
    const selectTextColor = {
        light: settings[400],
        dark: isLightGray || color === "gray" ? settings[600] : settings[500],
    };
    const selectBackgroundColor = {
        light: settings[30],
        dark: isLightGray
            ? settings[75]
            : color === "gray"
                ? settings[100]
                : settings[50],
    };
    const selectPeekBackgroundColor = {
        light: settings[30],
        dark: color === "gray" ? "rgba(255, 255, 255, 0.03)" : settings[75],
    };
    const selectCardBackgroundColor = {
        light: undefined,
        dark: isLightGray || color === "gray" ? settings[300] : settings[200],
    };
    const selectCardHoveredBackgroundColor = {
        light: undefined,
        dark: isLightGray || color === "gray" ? settings[400] : settings[300],
    };
    const selectCardPressedBackgroundColor = {
        light: undefined,
        dark: isLightGray || color === "gray" ? settings[300] : settings[200],
    };
    if (theme.mode === "dark") {
        return {
            textColor: selectTextColor.dark,
            backgroundColor: selectBackgroundColor.dark,
            peekBackgroundColor: selectPeekBackgroundColor.dark,
            cardBackgroundColor: selectCardBackgroundColor.dark,
            cardHoveredBackgroundColor: selectCardHoveredBackgroundColor.dark,
            cardPressedBackgroundColor: selectCardPressedBackgroundColor.dark,
        };
    }
    else {
        return {
            textColor: selectTextColor.light,
            backgroundColor: selectBackgroundColor.light,
            peekBackgroundColor: selectPeekBackgroundColor.light,
            cardBackgroundColor: selectCardBackgroundColor.light,
            cardHoveredBackgroundColor: selectCardHoveredBackgroundColor.light,
            cardPressedBackgroundColor: selectCardPressedBackgroundColor.light,
        };
    }
}
exports.getBoardSelectStyle = getBoardSelectStyle;
const blockColorToAccentColor = {
    default: undefined,
    gray: "gray",
    brown: "brown",
    orange: "orange",
    yellow: "yellow",
    teal: "green",
    blue: "blue",
    purple: "purple",
    pink: "pink",
    red: "red",
    gray_background: "gray",
    brown_background: "brown",
    orange_background: "orange",
    yellow_background: "yellow",
    teal_background: "green",
    blue_background: "blue",
    purple_background: "purple",
    pink_background: "pink",
    red_background: "red",
};
function blockColorIsBackgroundColor(color) {
    return color.includes("_background");
}
exports.blockColorIsBackgroundColor = blockColorIsBackgroundColor;
function getBlockColorStyle(color, theme) {
    if (color === "default") {
        return { color: "inherit", fill: "inherit" };
    }
    const accentColor = blockColorToAccentColor[color];
    if (!accentColor) {
        return { color: "inherit", fill: "inherit" };
    }
    const accentColorSettings = theme.accentColors[accentColor];
    const blockBackgroundColor = {
        light: accentColorSettings[50],
        dark: accentColorSettings[300],
    };
    const blockTextColor = {
        light: accentColorSettings[500],
        dark: color === "gray" ? accentColorSettings[700] : accentColorSettings[900],
    };
    if (blockColorIsBackgroundColor(color)) {
        return {
            background: theme.mode === "dark"
                ? blockBackgroundColor.dark
                : blockBackgroundColor.light,
        };
    }
    else {
        return {
            color: theme.mode === "dark" ? blockTextColor.dark : blockTextColor.light,
            fill: theme.mode === "dark" ? blockTextColor.dark : blockTextColor.light,
        };
    }
}
exports.getBlockColorStyle = getBlockColorStyle;
function getBlockColorFromUserId(userId, theme) {
    let hashedUserId = 0;
    for (let i = 0; i < userId.length; i++) {
        hashedUserId += userId.charCodeAt(i);
    }
    hashedUserId = hashedUserId % exports.blockTextColors.length;
    const initialStyle = getBlockColorStyle(exports.blockTextColors[hashedUserId], theme);
    return initialStyle.color || theme.regularTextColor;
}
exports.getBlockColorFromUserId = getBlockColorFromUserId;
function getCalloutBlockColorStyle(color, theme) {
    if (color === "default") {
        return { color: theme.regularTextColor };
    }
    const accentColor = blockColorToAccentColor[color];
    if (!accentColor) {
        return { color: theme.regularTextColor };
    }
    const accentColorSettings = theme.accentColors[accentColor];
    const calloutBlockBackgroundColor = {
        light: accentColorSettings[50],
        dark: color === "gray_background"
            ? accentColorSettings[200]
            : accentColorSettings[100],
    };
    const calloutBlockTextColor = {
        light: accentColorSettings[500],
        dark: color === "gray" ? accentColorSettings[800] : accentColorSettings[900],
    };
    if (blockColorIsBackgroundColor(color)) {
        return {
            background: theme.mode === "dark"
                ? calloutBlockBackgroundColor.dark
                : calloutBlockBackgroundColor.light,
        };
    }
    else {
        return {
            color: theme.mode === "dark"
                ? calloutBlockTextColor.dark
                : calloutBlockTextColor.light,
            fill: theme.mode === "dark"
                ? calloutBlockTextColor.dark
                : calloutBlockTextColor.light,
        };
    }
}
exports.getCalloutBlockColorStyle = getCalloutBlockColorStyle;
function getHighlightColorStyle(color, theme) {
    if (color === "default") {
        return { color: theme.regularTextColor };
    }
    else {
        return getBlockColorStyle(color, theme);
    }
}
exports.getHighlightColorStyle = getHighlightColorStyle;
exports.default = exports.colors;
