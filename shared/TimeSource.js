"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM_TIME_SOURCE = void 0;
class SystemTimeSource {
    setTimeout(callback, ms, ...args) {
        setTimeout(callback, ms, ...args);
    }
}
exports.SYSTEM_TIME_SOURCE = new SystemTimeSource();
