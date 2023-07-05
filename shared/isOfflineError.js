"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const offlineConnectionErrorSubstrings = [
    "ERR_CONNECTION_REFUSED",
    "ECONNREFUSED",
];
function isOfflineError(error) {
    return (error &&
        error.message &&
        offlineConnectionErrorSubstrings.some(str => error.message.indexOf(str) !== -1));
}
exports.default = isOfflineError;
