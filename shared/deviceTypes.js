"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HorizontalSizeClasses = exports.isAuditLogPlatform = exports.auditLogPlatforms = void 0;
exports.auditLogPlatforms = [
    "mac-desktop",
    "windows-desktop",
    "android",
    "ios",
    "web",
];
function isAuditLogPlatform(platform) {
    return exports.auditLogPlatforms.includes(platform);
}
exports.isAuditLogPlatform = isAuditLogPlatform;
exports.HorizontalSizeClasses = ["compact", "regular", "unknown"];
