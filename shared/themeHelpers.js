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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElectronTheme = exports.localThemeKey = void 0;
const colors_1 = __importStar(require("./colors"));
exports.localThemeKey = "theme";
function getElectronTheme(mode) {
    const theme = (0, colors_1.getTheme)({ theme: mode });
    return {
        mode,
        colors: {
            white: colors_1.default.white,
            blue: colors_1.default.blue,
        },
        borderRadius: 3,
        textColor: theme.regularTextColor,
        popoverBackgroundColor: theme.popoverBackground,
        popoverBoxShadow: theme.mediumBoxShadow,
        inputBoxShadow: theme.inputBoxShadow,
        inputBackgroundColor: theme.inputBackground,
        dividerColor: theme.darkDividerColor,
        shadowOpacity: theme.shadowOpacity,
    };
}
exports.getElectronTheme = getElectronTheme;
