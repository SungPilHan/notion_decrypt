"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeToHttpUrl = exports.normalizeToSchemeUrl = exports.makeRelativeUrl = exports.fixSchemeUrl = exports.getHttpUrl = exports.getSchemeUrl = exports.forceConsistentEndingSlash = void 0;
const url_1 = __importDefault(require("url"));
const urlHelpers_1 = require("./urlHelpers");
function forceConsistentEndingSlash(args) {
    if (args.src.endsWith("/")) {
        if (args.dest.endsWith("/")) {
            return args.dest;
        }
        else {
            return `${args.dest}/`;
        }
    }
    else {
        if (args.dest.endsWith("/")) {
            return args.dest.slice(0, args.dest.length - 1);
        }
        else {
            return args.dest;
        }
    }
}
exports.forceConsistentEndingSlash = forceConsistentEndingSlash;
function getSchemeUrl(args) {
    const parsed = url_1.default.parse(args.httpUrl, true);
    parsed.protocol = `${args.protocol}:`;
    parsed.port = args.includePort ? parsed.port : null;
    parsed.host = null;
    const schemeUrl = url_1.default.format(parsed);
    return forceConsistentEndingSlash({
        src: args.httpUrl,
        dest: schemeUrl,
    });
}
exports.getSchemeUrl = getSchemeUrl;
function getHttpUrl(args) {
    const parsedBaseURL = url_1.default.parse(args.baseUrl);
    const parsed = url_1.default.parse(args.schemeUrl, true);
    parsed.protocol = parsedBaseURL.protocol;
    parsed.port = parsedBaseURL.port;
    parsed.host = parsedBaseURL.host;
    const httpUrl = url_1.default.format(parsed);
    return forceConsistentEndingSlash({
        src: args.schemeUrl,
        dest: httpUrl,
    });
}
exports.getHttpUrl = getHttpUrl;
function fixSchemeUrl(args) {
    if (!args.url.startsWith(`${args.protocol}:`)) {
        return args.url;
    }
    const parsedBaseUrl = url_1.default.parse(args.baseUrl, true);
    const parsed = url_1.default.parse(args.url, true);
    if (parsed.hostname === parsedBaseUrl.hostname) {
        return args.url;
    }
    return args.url.replace(`${args.protocol}://*`, `${args.protocol}:/`);
}
exports.fixSchemeUrl = fixSchemeUrl;
function makeRelativeUrl(args) {
    const { url, protocol, domainBaseUrl } = args;
    try {
        new URL(url);
    }
    catch (error) {
        return;
    }
    const fixedUrl = fixSchemeUrl({
        url: url,
        protocol: protocol,
        baseUrl: domainBaseUrl,
    });
    const httpUrl = getHttpUrl({
        schemeUrl: fixedUrl,
        baseUrl: domainBaseUrl,
    });
    return (0, urlHelpers_1.removeBaseUrl)(httpUrl);
}
exports.makeRelativeUrl = makeRelativeUrl;
function normalizeToSchemeUrl(args) {
    const { url, domainBaseUrl, protocol } = args;
    if (!url) {
        return;
    }
    const schemeUrl = getSchemeUrl({
        httpUrl: domainBaseUrl,
        protocol: protocol,
    });
    const relativeUrl = (0, urlHelpers_1.isStrictRelativeUrl)(url)
        ? url
        : makeRelativeUrl({
            url,
            protocol,
            domainBaseUrl,
        });
    if (relativeUrl) {
        if (relativeUrl.startsWith("/")) {
            return `${schemeUrl}${relativeUrl}`;
        }
        else {
            return `${schemeUrl}/${relativeUrl}`;
        }
    }
}
exports.normalizeToSchemeUrl = normalizeToSchemeUrl;
function normalizeToHttpUrl(args) {
    if (args.url.startsWith(args.protocol)) {
        return getHttpUrl({ schemeUrl: args.url, baseUrl: args.domainBaseUrl });
    }
    return args.url;
}
exports.normalizeToHttpUrl = normalizeToHttpUrl;
