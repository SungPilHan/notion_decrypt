"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEPRECATED_receiveSyncMainFromRenderer = exports.handleEventFromRenderer = exports.handleRequestFromRenderer = void 0;
const electron_1 = __importDefault(require("electron"));
exports.handleRequestFromRenderer = {
    addListener(eventName, fn) {
        electron_1.default.ipcMain.handle(eventName, fn);
    },
    removeAllListener(eventName) {
        electron_1.default.ipcMain.removeHandler(eventName);
    },
};
exports.handleEventFromRenderer = {
    addListener(eventName, fn) {
        electron_1.default.ipcMain.addListener(eventName, fn);
    },
    removeListener(eventName, fn) {
        electron_1.default.ipcMain.removeListener(eventName, fn);
    },
};
exports.DEPRECATED_receiveSyncMainFromRenderer = {
    addListener(eventName, fn) {
        const wrapperFunction = (event, ...args) => {
            event.returnValue = fn(event, ...args);
        };
        electron_1.default.ipcMain.on(eventName, wrapperFunction);
    },
    removeAllListener(eventName) {
        electron_1.default.ipcMain.removeHandler(eventName);
    },
};
