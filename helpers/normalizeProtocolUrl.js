"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findProtocolUrl = exports.normalizeProtocolUrl = void 0;
const config_1 = __importDefault(require("../config"));
const schemeHelpers_1 = require("../shared/schemeHelpers");
function normalizeProtocolUrl(url) {
    const normalizedUrl = (0, schemeHelpers_1.normalizeToSchemeUrl)({
        url,
        domainBaseUrl: config_1.default.domainBaseUrl,
        protocol: config_1.default.protocol,
    });
    return normalizedUrl;
}
exports.normalizeProtocolUrl = normalizeProtocolUrl;
function findProtocolUrl(argv) {
    return normalizeProtocolUrl(argv.find(arg => arg.startsWith(`${config_1.default.protocol}:`)));
}
exports.findProtocolUrl = findProtocolUrl;
