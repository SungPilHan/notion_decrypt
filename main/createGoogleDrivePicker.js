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
exports.createGoogleDrivePicker = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
const mainIpc = __importStar(require("./mainIpc"));
const urlHelpers = __importStar(require("../shared/urlHelpers"));
const constants_1 = require("../shared/constants");
const AppController_1 = require("./AppController");
function createGoogleDrivePicker(args) {
    const { url } = args;
    const rect = {
        x: undefined,
        y: undefined,
        width: 566,
        height: 350,
    };
    const PICKER_MAX_WIDTH = 1051;
    const PICKER_MAX_HEIGHT = 650;
    const focusedWindow = electron_1.BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
        const [winX, winY] = focusedWindow.getPosition();
        const [winWidth, winHeight] = focusedWindow.getSize();
        rect.width = Math.min(Math.max(rect.width, winWidth * 0.8), PICKER_MAX_WIDTH);
        rect.height = Math.min(Math.max(rect.height, winHeight * 0.8), PICKER_MAX_HEIGHT);
        rect.x = Math.round(winX + winWidth / 2 - rect.width / 2);
        rect.y = Math.round(winY + winHeight / 2 - rect.height / 2);
    }
    const baseURLDomain = urlHelpers.parse(config_1.default.domainBaseUrl).hostname;
    if (!baseURLDomain) {
        throw new Error("No base URL dmain.");
    }
    const window = new electron_1.BrowserWindow(Object.assign(Object.assign({}, rect), { title: "", webPreferences: {
            preload: path_1.default.join(__dirname, "../renderer/popupPreload.js"),
            nodeIntegration: false,
            session: electron_1.session.fromPartition(constants_1.electronSessionPartition),
            sandbox: false,
        } }));
    const handlePostMessage = (event, data) => {
        if (data && data.type === "google-drive-picker-callback") {
            mainIpc.handleEventFromRenderer.removeListener("notion:post-message", handlePostMessage);
            window.removeListener("close", handleClose);
            window.close();
            AppController_1.appController.sendMainToAllNotionInstances("notion:google-drive-picker-callback", data.file);
        }
    };
    const handleClose = () => {
        mainIpc.handleEventFromRenderer.removeListener("notion:post-message", handlePostMessage);
        window.removeListener("close", handleClose);
        AppController_1.appController.sendMainToAllNotionInstances("notion:google-drive-picker-callback", undefined);
    };
    mainIpc.handleEventFromRenderer.addListener("notion:post-message", handlePostMessage);
    window.addListener("close", handleClose);
    void window.loadURL(url);
}
exports.createGoogleDrivePicker = createGoogleDrivePicker;
