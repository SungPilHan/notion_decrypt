"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopbarHeight = exports.MAC_DESKTOP_TOPBAR_HEIGHT = exports.DEFAULT_TOPBAR_HEIGHT = void 0;
exports.DEFAULT_TOPBAR_HEIGHT = 45;
exports.MAC_DESKTOP_TOPBAR_HEIGHT = 37;
function getTopbarHeight(isElectronMac) {
    return isElectronMac ? exports.MAC_DESKTOP_TOPBAR_HEIGHT : exports.DEFAULT_TOPBAR_HEIGHT;
}
exports.getTopbarHeight = getTopbarHeight;
