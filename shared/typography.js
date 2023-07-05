"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function css(styles) {
    return styles;
}
const fontFamily = {
    sans: `ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"`,
    serif: `Lyon-Text, Georgia, ui-serif, serif`,
    mono: `iawriter-mono, Nitti, Menlo, Courier, monospace`,
    githubMono: `"SFMono-Regular", Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace`,
    emailMono: "monospace",
};
const CJKfontFamily = {
    "ja-JP": {
        sans: `ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Hiragino Sans GB", "メイリオ", Meiryo, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"`,
        serif: `Lyon-Text, Georgia, YuMincho, "Yu Mincho", "Hiragino Mincho ProN", "Hiragino Mincho Pro", serif`,
    },
    "ko-KR": {
        serif: `Lyon-Text, Georgia,"Nanum Myeongjo", NanumMyeongjo, Batang, "Hiragino Mincho ProN", "Hiragino Mincho Pro", serif`,
    },
    "zh-CN": {
        sans: `ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "PingFang SC", "Microsoft YaHei", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"`,
        serif: `Lyon-Text, Georgia, "Songti SC", "SimSun", serif`,
    },
    "zh-TW": {
        sans: `ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "PingFang TC", "Microsoft Jhenghei", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"`,
        serif: `Lyon-Text, Georgia, "Songti TC", PMingLiU, serif`,
    },
};
const typography = {
    fontWeight: {
        light: 200,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
    baseFontFamily: fontFamily,
    getCompositeFontFamily: getCompositeFontFamily,
    fontSize: {
        UISmall: { desktop: 12, mobile: 14 },
        UIRegular: { desktop: 14, mobile: 16 },
    },
    lineHeight: {
        UISmall: { desktop: "16px", mobile: "20px" },
        UIRegular: { desktop: "20px", mobile: "22px" },
    },
    textOverflowStyle: css({
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    }),
    getHeaderFontFamily: (args) => {
        const { pageFont, locale } = args;
        if (pageFont && pageFont === "mono") {
            return getCompositeFontFamily(locale).mono;
        }
        else if (pageFont && pageFont === "serif") {
            return getCompositeFontFamily(locale).serif;
        }
        else {
            return getCompositeFontFamily(locale).sans;
        }
    },
};
function getCompositeFontFamily(locale) {
    const CJKOverride = CJKfontFamily[locale];
    if (CJKOverride) {
        return Object.assign(Object.assign({}, fontFamily), CJKOverride);
    }
    return fontFamily;
}
exports.default = typography;
