"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEPRECATED_sendSyncToMainAndReturnResult = exports.sendToMain = exports.invokeInMainAndReturnResult = exports.broadcast = exports.handleMainToTabsEvent = exports.handleMainToSearchEvent = exports.handleMainToNotionEvent = void 0;
const electron_1 = __importDefault(require("electron"));
exports.handleMainToNotionEvent = {
    addListener(eventName, fn) {
        electron_1.default.ipcRenderer.addListener(eventName, fn);
    },
    removeListener(eventName, fn) {
        electron_1.default.ipcRenderer.removeListener(eventName, fn);
    },
};
exports.handleMainToSearchEvent = {
    addListener(eventName, fn) {
        electron_1.default.ipcRenderer.addListener(eventName, fn);
    },
    removeListener(eventName, fn) {
        electron_1.default.ipcRenderer.removeListener(eventName, fn);
    },
};
exports.handleMainToTabsEvent = {
    addListener(eventName, fn) {
        electron_1.default.ipcRenderer.addListener(eventName, fn);
    },
    removeListener(eventName, fn) {
        electron_1.default.ipcRenderer.removeListener(eventName, fn);
    },
};
const broadcastListenerMap = new Map();
exports.broadcast = {
    emit(channel, ...args) {
        sendToMain("notion:broadcast", {
            channel: channel,
            args: args,
        });
    },
    addListener(channel, fn) {
        const callback = (sender, payload) => {
            if (payload.channel === channel) {
                fn(...payload.args);
            }
        };
        broadcastListenerMap.set(fn, callback);
        exports.handleMainToNotionEvent.addListener("notion:broadcast", callback);
    },
    removeListener(eventName, fn) {
        const callback = broadcastListenerMap.get(fn);
        if (callback) {
            exports.handleMainToNotionEvent.removeListener("notion:broadcast", callback);
            broadcastListenerMap.delete(fn);
        }
    },
};
function invokeInMainAndReturnResult(eventName, ...args) {
    return electron_1.default.ipcRenderer.invoke(eventName, ...args);
}
exports.invokeInMainAndReturnResult = invokeInMainAndReturnResult;
function sendToMain(eventName, ...args) {
    electron_1.default.ipcRenderer.send(eventName, ...args);
}
exports.sendToMain = sendToMain;
function DEPRECATED_sendSyncToMainAndReturnResult(eventName, ...args) {
    return electron_1.default.ipcRenderer.sendSync(eventName, ...args);
}
exports.DEPRECATED_sendSyncToMainAndReturnResult = DEPRECATED_sendSyncToMainAndReturnResult;
