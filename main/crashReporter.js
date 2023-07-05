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
const electron_1 = require("electron");
const config_1 = __importDefault(require("../config"));
const mainIpc = __importStar(require("./mainIpc"));
electron_1.crashReporter.start({
    productName: "Notion",
    companyName: "Notion",
    submitURL: `${config_1.default.domainBaseUrl}/server/crash-report`,
    uploadToServer: true,
    extra: {
        desktopEnvironment: config_1.default.env,
        desktopVersion: electron_1.app.getVersion(),
    },
});
mainIpc.handleEventFromRenderer.addListener("notion:set-logger-data", (event, data) => {
    for (const key in data) {
        const value = data[key];
        if (typeof value === "string") {
            electron_1.crashReporter.addExtraParameter(key, value);
        }
    }
});
