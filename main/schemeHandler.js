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
exports.registerUrlSchemeProxy = exports.wipeTransientCsrfCookie = void 0;
const electron_1 = require("electron");
const electron_log_1 = __importDefault(require("electron-log"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const stream_1 = require("stream");
const config_1 = __importDefault(require("../config"));
const schemeHelpers_1 = require("../shared/schemeHelpers");
const assetCache_1 = require("./assetCache");
const serverLogger_1 = require("../helpers/serverLogger");
const mainIpc = __importStar(require("./mainIpc"));
const constants_1 = require("../shared/constants");
const logglyHelpers_1 = require("../shared/logglyHelpers");
const lodash_1 = __importDefault(require("lodash"));
const debugMenu_1 = require("./debugMenu");
const cspMangle_1 = require("./cspMangle");
const url_1 = __importDefault(require("url"));
const log = electron_log_1.default.scope("schemeHandler");
async function wipeTransientCsrfCookie() {
    const cookies = electron_1.session.fromPartition(constants_1.electronSessionPartition).cookies;
    const [csrfCookie] = await cookies.get({ name: "csrf" });
    if (csrfCookie && csrfCookie.domain) {
        const url = csrfCookie.domain === "localhost"
            ? "https://localhost:3000/"
            : config_1.default.domainBaseUrl;
        await cookies.remove(url, csrfCookie.name);
    }
}
exports.wipeTransientCsrfCookie = wipeTransientCsrfCookie;
mainIpc.handleEventFromRenderer.addListener("notion:clear-cookies", () => {
    void electron_1.session.fromPartition(constants_1.electronSessionPartition).clearStorageData({
        origin: config_1.default.domainBaseUrl,
        storages: ["cookies"],
    });
});
mainIpc.handleEventFromRenderer.addListener("notion:clear-all-cookies", () => {
    void electron_1.session.fromPartition(constants_1.electronSessionPartition).clearStorageData();
    if (electron_1.session.defaultSession) {
        void electron_1.session.defaultSession.clearStorageData();
    }
});
mainIpc.handleRequestFromRenderer.addListener("notion:get-cookie", async (_event, cookieName) => {
    const { cookies } = electron_1.session.fromPartition(constants_1.electronSessionPartition);
    const [cookie] = await cookies.get({
        url: config_1.default.domainBaseUrl,
        name: cookieName,
    });
    const value = cookie && !cookie.httpOnly ? cookie.value : undefined;
    return { value };
});
mainIpc.handleEventFromRenderer.addListener("notion:set-cookie", (_event, args) => {
    const { cookies } = electron_1.session.fromPartition(constants_1.electronSessionPartition);
    void cookies.set(Object.assign(Object.assign({}, args), { url: config_1.default.domainBaseUrl, expirationDate: args.expires }));
});
electron_1.protocol.registerSchemesAsPrivileged([
    {
        scheme: config_1.default.protocol,
        privileges: {
            standard: true,
            secure: true,
            allowServiceWorkers: true,
            supportFetchAPI: true,
            corsEnabled: true,
        },
    },
]);
function supportEmbedsInUrlScheme(webRequest) {
    webRequest.onHeadersReceived((details, callback) => {
        if (details.responseHeaders && details.resourceType === "subFrame") {
            const csp = details.responseHeaders["content-security-policy"];
            if (csp) {
                return callback({
                    responseHeaders: Object.assign(Object.assign({}, details.responseHeaders), { "content-security-policy": csp.map(cspHeader => (0, cspMangle_1.ensureCspFrameAncestorsParityWithNotionWebsite)({
                            cspHeader,
                            customProtocol: config_1.default.protocol,
                        })) }),
                });
            }
        }
        callback({});
    });
}
function supportFileTokenInHttpUrls(webRequest) {
    const filter = {
        urls: [
            "https://file.notion.so/*",
            "https://file-dev.notion.so/*",
            "https://file-stg.notion.so/*",
            "http://file-local.notion.so:3000/*",
        ],
    };
    webRequest.onBeforeSendHeaders(filter, (details, callback) => {
        void electron_1.session
            .fromPartition(constants_1.electronSessionPartition)
            .cookies.get({
            domain: ".notion.so",
            name: "file_token",
        })
            .then(cookies => {
            if (cookies.length !== 0) {
                if (!details.requestHeaders["Cookie"]) {
                    details.requestHeaders["Cookie"] = "file_token=${cookies[0].value}";
                }
                else if (!details.requestHeaders["Cookie"].includes("file_token")) {
                    details.requestHeaders["Cookie"] = `${details.requestHeaders["Cookie"]}; file_token=${cookies[0].value}`;
                }
            }
            callback({
                requestHeaders: details.requestHeaders,
            });
        });
    });
}
function registerUrlSchemeProxy() {
    const { protocol, webRequest } = electron_1.session.fromPartition(constants_1.electronSessionPartition);
    supportFileTokenInHttpUrls(webRequest);
    supportEmbedsInUrlScheme(webRequest);
    const success = protocol.registerStreamProtocol(config_1.default.protocol, async (req, callback) => {
        if (config_1.default.isLocalhost && !config_1.default.offline) {
            proxyRequest(req, callback);
            return;
        }
        try {
            const cachedFile = await assetCache_1.assetCache.handleRequest(req);
            if (cachedFile) {
                const fileStream = fs_extra_1.default.createReadStream(cachedFile.absolutePath);
                const headers = coerceHeaders(cachedFile.headers, cachedFile.absolutePath);
                callback({
                    statusCode: 200,
                    headers: headers,
                    data: fileStream,
                });
            }
            else {
                proxyRequest(req, callback);
            }
        }
        catch (error) {
            void serverLogger_1.serverLogger.log({
                level: "error",
                from: "schemeHandler",
                type: "requestHandlerError",
                error: (0, logglyHelpers_1.convertErrorToLog)(error),
            });
            callback({
                statusCode: 500,
                headers: {},
                data: createStream("Something went wrong."),
            });
        }
    });
    if (!success) {
        const error = new Error("Could not register url scheme handler.");
        void serverLogger_1.serverLogger.log({
            level: "error",
            from: "schemeHandler",
            type: "registerSchemeHandlerError",
            error: (0, logglyHelpers_1.convertErrorToLog)(error),
        });
        throw error;
    }
}
exports.registerUrlSchemeProxy = registerUrlSchemeProxy;
function proxyRequest(req, callback) {
    if ((0, debugMenu_1.shouldSimulateAirplaneMode)()) {
        process.nextTick(() => {
            callback({
                statusCode: 0,
                headers: {},
                data: createErrorStream(new Error("app is simulating airplane mode")),
            });
        });
        return;
    }
    const parsedRequestUrl = url_1.default.parse(req.url);
    if (!isValidProxyUrl(parsedRequestUrl)) {
        process.nextTick(() => {
            callback({
                statusCode: 0,
                headers: {},
                data: createErrorStream(new Error("invalid proxy URL")),
            });
        });
    }
    const parsedBaseUrl = url_1.default.parse(config_1.default.domainBaseUrl);
    const parsedHttpUrl = Object.assign(Object.assign({}, parsedRequestUrl), { protocol: parsedBaseUrl.protocol, port: parsedBaseUrl.port, host: undefined });
    const httpUrl = (0, schemeHelpers_1.forceConsistentEndingSlash)({
        src: req.url,
        dest: url_1.default.format(parsedHttpUrl),
    });
    const options = {
        method: req.method,
        url: httpUrl,
        session: electron_1.session.fromPartition(constants_1.electronSessionPartition),
        useSessionCookies: true,
    };
    if (req.url.endsWith("/icons/all")) {
        options["origin"] = config_1.default.domainBaseUrl;
    }
    const request = electron_1.net.request(options);
    for (const [name, value] of Object.entries(req.headers)) {
        request.setHeader(name, value);
    }
    let callbackCalled = false;
    request
        .once("response", response => {
        response.once("error", lodash_1.default.identity);
        const headers = coerceHeaders(response.headers, httpUrl);
        const stream = response;
        if (!callbackCalled) {
            callback({
                statusCode: response.statusCode || 0,
                headers: headers,
                data: stream,
            });
            callbackCalled = true;
        }
    })
        .once("error", error => {
        if (!callbackCalled) {
            callback({
                statusCode: 0,
                headers: {},
                data: createErrorStream(error),
            });
            callbackCalled = true;
        }
        else {
            log.info("Error called after response", { error });
        }
    });
    if (req.uploadData) {
        for (const { bytes } of req.uploadData) {
            request.write(bytes);
        }
    }
    request.end();
}
function isValidProxyUrl(url) {
    var _a, _b, _c, _d;
    if (config_1.default.env === "local") {
        return (((_a = url.hostname) === null || _a === void 0 ? void 0 : _a.endsWith("local.notion.so")) ||
            ((_b = url.host) === null || _b === void 0 ? void 0 : _b.endsWith(config_1.default.domainName)) ||
            ((_c = url.host) === null || _c === void 0 ? void 0 : _c.endsWith(config_1.default.domainName.split(":")[0])));
    }
    return Boolean((_d = url.host) === null || _d === void 0 ? void 0 : _d.endsWith(config_1.default.domainName));
}
function createStream(str) {
    const stream = new stream_1.PassThrough();
    stream.push(str);
    stream.push(null);
    return stream;
}
function createErrorStream(error) {
    const stream = new stream_1.PassThrough();
    stream.destroy(error);
    return stream;
}
function coerceHeaders(uncoercedHeaders, url) {
    const headers = Object.assign({}, uncoercedHeaders);
    const path = url.split("?")[0];
    if (!headers["content-type"]) {
        if (path.endsWith(".css")) {
            headers["content-type"] = "text/css; charset=UTF-8";
        }
        else if (path.endsWith(".html")) {
            headers["content-type"] = "text/html; charset=UTF-8";
        }
        else if (path.endsWith(".js")) {
            headers["content-type"] = "text/javascript; charset=UTF-8";
        }
        else if (path.endsWith(".svg")) {
            headers["content-type"] = "image/svg+xml";
        }
    }
    return headers;
}
