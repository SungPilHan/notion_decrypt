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
exports.AssetCache = void 0;
const urlHelpers = __importStar(require("./urlHelpers"));
const path_1 = __importDefault(require("path"));
const EventEmitterMap_1 = __importDefault(require("./EventEmitterMap"));
const AsyncQueue_1 = require("./AsyncQueue");
const mathUtils_1 = require("../helpers/mathUtils");
const logglyHelpers_1 = require("./logglyHelpers");
const electron_1 = require("electron");
const constants_1 = require("./constants");
const localeHelpers_1 = require("./localeHelpers");
const config_1 = __importDefault(require("../config"));
const PromiseUtils_1 = require("./PromiseUtils");
class AssetCache {
    constructor(args) {
        this.args = args;
        this.queue = new AsyncQueue_1.AsyncQueue(1);
        this.events = new EventEmitterMap_1.default();
        this.appActive = true;
        this.lastAppStateChangeTime = 0;
        this.latestVersionFileName = "latestVersion.json";
        this.assetsJsonFileName = "assets.json";
        this.assetHeadersFileName = "headers.json";
        this.assetsDirName = "assets";
        this.assetCacheDirName = "notionAssetCache-v2";
        this.cacheDir = path_1.default.join(this.args.baseDir, this.assetCacheDirName);
        this.latestVersionPath = path_1.default.join(this.cacheDir, this.latestVersionFileName);
    }
    async handleRequest(req) {
        const parsedUrl = urlHelpers.parse(req.url);
        const host = parsedUrl.host;
        const urlPath = parsedUrl.pathname || "/";
        const { localLogger } = this.args;
        if (host !== config_1.default.domainName) {
            return;
        }
        if (!this.assetCacheState) {
            return;
        }
        const assetCacheState = this.assetCacheState;
        if (assetCacheState.assetsJson.proxyServerPathPrefixes.some(prefix => urlPath.startsWith(prefix))) {
            return;
        }
        const assetFile = assetCacheState.assetsJson.files.find(file => file.path === urlPath);
        if (assetFile) {
            const currentAssetsDir = this.getAssetsDir(assetCacheState.assetsJson.version);
            const absolutePath = path_1.default.join(currentAssetsDir, assetFile.path);
            localLogger.info("performingFileRequest", {
                absolutePath,
                url: urlPath,
            });
            return {
                absolutePath: absolutePath,
                headers: this.getHeaders(assetFile.path),
            };
        }
        const currentAssetsDir = this.getAssetsDir(assetCacheState.assetsJson.version);
        let indexPath = assetCacheState.assetsJson.entry;
        if (assetCacheState.assetsJson.localeHtml) {
            const cookies = electron_1.session.fromPartition(constants_1.electronSessionPartition).cookies;
            const [localeCookie] = await cookies.get({ name: "notion_locale" });
            let locale = "en-US";
            if (localeCookie) {
                locale = (0, localeHelpers_1.getLocaleFromCookie)(localeCookie.value);
            }
            const localeIndexPath = assetCacheState.assetsJson.localeHtml[locale];
            if (localeIndexPath) {
                indexPath = localeIndexPath;
            }
        }
        const indexAssetFile = assetCacheState.assetsJson.files.find(file => file.path === indexPath);
        if (indexAssetFile) {
            if (urlPath.includes(".")) {
                this.args.serverLogger.rateLimitedLog({
                    level: "error",
                    from: "AssetCache",
                    type: "requestReturnedAsIndexV2",
                    data: {
                        url: urlPath,
                    },
                });
            }
            const absolutePath = path_1.default.join(currentAssetsDir, indexAssetFile.path);
            localLogger.info("performingFileRequest2", {
                urlPath,
                absolutePath,
            });
            return {
                absolutePath: absolutePath,
                headers: this.getHeaders(indexAssetFile.path),
            };
        }
        this.args.serverLogger.rateLimitedLog({
            level: "error",
            from: "AssetCache",
            type: "cannotFindIndex",
            data: {
                url: urlPath,
            },
        });
        return;
    }
    initialize() {
        if (this.ready) {
            return this.ready;
        }
        this.ready = (async () => {
            const { localLogger } = this.args;
            localLogger.info(`latestVersionPath`, {
                latestVersionPath: this.latestVersionPath,
            });
            this.latestVersion = await this.loadJson(this.latestVersionPath);
            localLogger.info(`currentVersionLoaded`, {
                version: this.latestVersion && this.latestVersion.version,
                hash: this.latestVersion && this.latestVersion.hash,
            });
            await this.syncVersions();
            localLogger.info(`currentSyncedAssetsJson`, {
                version: this.assetCacheState && this.assetCacheState.assetsJson.version,
            });
            await this.cleanOldVersions();
        })();
        return this.ready;
    }
    async reset() {
        return this.queue.enqueue(async () => {
            this.assetCacheState = undefined;
            this.latestVersion = undefined;
            await this.cleanOldVersions();
        });
    }
    get version() {
        return this.latestVersion && this.latestVersion.version;
    }
    async checkForUpdates() {
        if (this.queue.getStats().queue === 0) {
            this.args.localLogger.info(`enqueueUpdate`);
            return this.queue.enqueue(() => this.checkForUpdatesNow());
        }
        this.args.localLogger.info(`updateAlreadyQueued`);
    }
    async checkForUpdatesNow() {
        const { localLogger, fs } = this.args;
        const checkForUpdatesNowStart = Date.now();
        localLogger.info(`checkingForAppUpdate`);
        this.events.emit("checking-for-update");
        const updateAssetsFetchStart = Date.now();
        const assetCacheState = this.assetCacheState;
        const hash = (this.latestVersion && this.latestVersion.hash) ||
            (assetCacheState && assetCacheState.assetsJson.hash) ||
            "";
        let response;
        try {
            const abortController = new AbortController();
            const timeoutResponse = await (0, PromiseUtils_1.raceWithTimeout)(30 * 1000, [
                fetch(urlHelpers.resolve(this.args.baseUrl, "/api/v3/getAssetsJsonV2"), {
                    method: "post",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ hash: hash }),
                    signal: abortController.signal,
                }),
            ]);
            if (timeoutResponse.timeout) {
                localLogger.error(`Timeout: Fetch request`);
                abortController.abort();
                return;
            }
            response = timeoutResponse.result;
        }
        catch (error) {
            localLogger.info(`no app update available (because offline)`, {
                error,
            });
            this.events.emit("update-not-available");
            return;
        }
        if (response.status !== 200) {
            const error = new Error(`${response.status}: ${response.statusText}`);
            localLogger.error(`no app update available (${response.status}: ${response.statusText})`, {
                data: this.createErrorDataMetrics(updateAssetsFetchStart),
            });
            this.events.emit("error", error);
            return;
        }
        this.logPerformance("updateAssetsFetch", updateAssetsFetchStart);
        const updateAssetsResponseParseStart = Date.now();
        let newAssetsJson;
        try {
            const timeoutAssetsJson = await (0, PromiseUtils_1.raceWithTimeout)(30 * 1000, [
                response.json(),
            ]);
            if (timeoutAssetsJson.timeout) {
                localLogger.error(`Timeout: JSON.parse`);
                return;
            }
            newAssetsJson = timeoutAssetsJson.result;
        }
        catch (error) {
            localLogger.error(`Failed to parse assets JSON`, {
                error,
                data: this.createErrorDataMetrics(updateAssetsResponseParseStart),
            });
            this.events.emit("error", error);
            return;
        }
        this.logPerformance("updateAssetsResponseParse", updateAssetsResponseParseStart);
        const assetJsonStart = Date.now();
        if (!("version" in newAssetsJson) ||
            (this.latestVersion &&
                this.latestVersion.version === newAssetsJson.version)) {
            localLogger.info("No app update available (noAppUpdateAvailable2)");
            this.events.emit("update-not-available");
            return;
        }
        localLogger.info("App update available", { version: newAssetsJson.version });
        this.events.emit("update-available", newAssetsJson);
        const newAssetHeaders = {};
        const newCacheDir = this.getCacheDir(newAssetsJson.version);
        const newAssetsDir = this.getAssetsDir(newAssetsJson.version);
        const newAssetsJsonPath = this.getAssetsJsonPath(newAssetsJson.version);
        const newAssetHeadersPath = this.getAssetHeadersPath(newAssetsJson.version);
        const newCacheDirExists = await this.directoryExists(newCacheDir);
        const copiedFilePaths = new Set();
        if (!newCacheDirExists) {
            try {
                await fs.mkdirp(newCacheDir);
            }
            catch (error) {
                localLogger.error(`Failed to run fs.mkdirp`, {
                    error,
                    data: this.createErrorDataMetrics(assetJsonStart),
                });
                this.events.emit("error", error);
                return;
            }
            if (assetCacheState) {
                const currentAssetsJson = assetCacheState.assetsJson;
                const currentAssetHeaders = assetCacheState.assetHeaders;
                const currentAssetsSet = new Set(currentAssetsJson.files.map(assetFile => assetFile.path));
                const filesWithSameFilePaths = newAssetsJson.files.filter(file => currentAssetsSet.has(file.path));
                const currentCacheDir = this.getCacheDir(currentAssetsJson.version);
                const currentAssetsDir = path_1.default.join(currentCacheDir, this.assetsDirName);
                for (const file of filesWithSameFilePaths) {
                    const matchedPath = file.path;
                    const currentAssetPath = path_1.default.join(currentAssetsDir, matchedPath);
                    const newAssetPath = path_1.default.join(newAssetsDir, matchedPath);
                    newAssetHeaders[matchedPath] = currentAssetHeaders[matchedPath];
                    try {
                        await fs.copy({ src: currentAssetPath, dest: newAssetPath });
                        copiedFilePaths.add(matchedPath);
                    }
                    catch (error) {
                        localLogger.error(`Failed to run fs.copy`, {
                            error,
                            src: currentAssetPath,
                            dest: newAssetPath,
                            data: this.createErrorDataMetrics(assetJsonStart),
                        });
                    }
                }
            }
        }
        let lastEmitTime = 0;
        let downloaded = 0;
        const total = newAssetsJson.files.length;
        const emit = () => {
            const emitTime = Date.now();
            if (downloaded === 0 ||
                downloaded === total ||
                emitTime >= lastEmitTime + 5000) {
                lastEmitTime = emitTime;
                this.events.emit("download-progress", {
                    downloaded: downloaded,
                    total: total,
                });
            }
        };
        emit();
        this.logPerformance("assetJson", assetJsonStart);
        const prepareStart = Date.now();
        const queue = new AsyncQueue_1.AsyncQueue(8);
        const errors = [];
        await Promise.all(newAssetsJson.files.map(file => {
            return queue.enqueue(async () => {
                if (copiedFilePaths.has(file.path) &&
                    (await this.verifyAsset(newAssetsDir, file))) {
                    downloaded++;
                    emit();
                    return;
                }
                const newAssetPath = path_1.default.join(newAssetsDir, file.path);
                try {
                    const headers = await this.args.fs.downloadFile({
                        url: urlHelpers.resolve(this.args.baseUrl, file.path),
                        dest: newAssetPath,
                    });
                    newAssetHeaders[file.path] = headers;
                    const newAssetIsValid = await this.verifyAsset(newAssetsDir, file);
                    if (newAssetIsValid) {
                        downloaded++;
                        emit();
                    }
                    else {
                        const error = new Error("Invalid asset hash");
                        error["data"] = { filePath: file.path };
                        errors.push(error);
                    }
                }
                catch (error) {
                    error["data"] = { filePath: file.path };
                    errors.push(error);
                }
            });
        }));
        this.logPerformance("prepare", prepareStart);
        const downloadStart = Date.now();
        if (errors.length > 0) {
            localLogger.error(`Found errors (downloadError)`, {
                miscErrorString: (0, logglyHelpers_1.safelyConvertAnyToString)({
                    errors: errors.slice(0, 100),
                }),
                data: this.createErrorDataMetrics(assetJsonStart),
            });
            this.events.emit("error", errors[0]);
            return;
        }
        const headersWriteSuccessful = await this.writeJson(newAssetHeadersPath, newAssetHeaders);
        if (!headersWriteSuccessful) {
            this.events.emit("error", new Error("Cannot write headers.json"));
            return;
        }
        const assetsJsonWriteSuccessful = await this.writeJson(newAssetsJsonPath, newAssetsJson);
        if (!assetsJsonWriteSuccessful) {
            this.events.emit("error", new Error("Cannot write assets.json"));
            return;
        }
        const newLatestVersion = {
            version: newAssetsJson.version,
            hash: newAssetsJson.hash,
        };
        const latestVersionWriteSuccessful = await this.writeJson(this.latestVersionPath, newLatestVersion);
        if (!latestVersionWriteSuccessful) {
            this.events.emit("error", new Error("Cannot write latestVersion.json"));
            return;
        }
        this.latestVersion = newLatestVersion;
        this.args.localLogger.info("checkingForAppUpdate2");
        this.args.localLogger.info("appUpdateDownloadComplete", {
            version: newAssetsJson.version,
        });
        this.events.emit("update-downloaded", newAssetsJson);
        this.args.localLogger.info("installingAppUpdate", {
            version: newAssetsJson.version,
        });
        this.events.emit("update-finished", newAssetsJson);
        this.logPerformance("download", downloadStart);
        this.logPerformance("checkForUpdatesNow", checkForUpdatesNowStart);
    }
    updateAppState(appActive, lastAppStateChangeTime) {
        this.appActive = appActive;
        this.lastAppStateChangeTime = lastAppStateChangeTime;
    }
    logPerformance(type, start) {
        const end = Date.now();
        if (!this.appActive || start < this.lastAppStateChangeTime) {
            return;
        }
        if (config_1.default.env !== "production" || (0, mathUtils_1.randomlySucceedWithPercentage)(1)) {
            this.args.localLogger.log(`performance.${type}`, {
                duration: end - start,
            });
        }
    }
    createErrorDataMetrics(start) {
        const end = Date.now();
        if (!this.appActive || start < this.lastAppStateChangeTime) {
            return {};
        }
        return {
            duration: end - start,
        };
    }
    async syncVersions() {
        const { localLogger } = this.args;
        if (!this.latestVersion) {
            localLogger.info(`syncVersionEmptyLatestVersion`);
            this.events.emit("update-applied");
            return;
        }
        if (this.assetCacheState &&
            this.latestVersion.version === this.assetCacheState.assetsJson.version) {
            localLogger.info(`syncVersionSameSkippingSync`);
            this.events.emit("update-applied");
            return;
        }
        const assetsJsonPath = this.getAssetsJsonPath(this.latestVersion.version);
        const headersJsonPath = this.getAssetHeadersPath(this.latestVersion.version);
        localLogger.info(`syncVersionSyncing`, {
            assetsJsonPath,
            headersJsonPath,
        });
        const assetsJson = await this.loadJson(assetsJsonPath);
        const assetHeaders = await this.loadJson(headersJsonPath);
        if (assetsJson && assetHeaders) {
            this.assetCacheState = { assetsJson, assetHeaders };
        }
        this.events.emit("update-applied");
    }
    isUpdateAvailable() {
        var _a;
        if (!this.latestVersion) {
            return false;
        }
        const currentVersion = (_a = this.assetCacheState) === null || _a === void 0 ? void 0 : _a.assetsJson;
        if (!currentVersion) {
            return false;
        }
        return this.latestVersion.version !== currentVersion.version;
    }
    async cleanOldVersions() {
        let subpathsToDelete = await this.readDir(this.cacheDir);
        if (this.assetCacheState && this.latestVersion) {
            const assetCacheState = this.assetCacheState;
            const latestVersion = this.latestVersion.version;
            subpathsToDelete = subpathsToDelete.filter(subpath => subpath !== this.latestVersionFileName &&
                subpath !== assetCacheState.assetsJson.version &&
                subpath !== latestVersion);
        }
        await Promise.all(subpathsToDelete.map(async (subpath) => this.remove(this.getCacheDir(subpath))));
    }
    async verifyAsset(assetDir, file) {
        const filePath = path_1.default.join(assetDir, file.path);
        const hash = await this.getFileHash(filePath);
        if (hash !== file.hash) {
            return false;
        }
        return true;
    }
    getHeaders(assetSubpath) {
        const assetCacheState = this.assetCacheState;
        if (!assetCacheState) {
            return {};
        }
        const headers = assetCacheState.assetHeaders[assetSubpath];
        if (!headers) {
            return {};
        }
        const lowerCaseHeaders = {};
        for (const key in headers) {
            lowerCaseHeaders[key.toLowerCase()] = headers[key];
        }
        const filteredHeaders = {};
        const headersWhitelist = assetCacheState.assetsJson.headersWhitelist;
        for (const key of headersWhitelist) {
            const lowerCaseKey = key.toLowerCase();
            if (lowerCaseHeaders[lowerCaseKey]) {
                filteredHeaders[lowerCaseKey] = lowerCaseHeaders[lowerCaseKey];
            }
        }
        return filteredHeaders;
    }
    async loadJson(absolutePath) {
        try {
            const contents = await this.args.fs.readFile(absolutePath);
            return JSON.parse(contents);
        }
        catch (error) {
            this.args.localLogger.error(`Error reading and parsing JSON`, {
                error,
                absolutePath,
            });
        }
    }
    async writeJson(absolutePath, contents) {
        try {
            if (contents === undefined) {
                await this.args.fs.remove(absolutePath);
            }
            else {
                await this.args.fs.writeFile(absolutePath, JSON.stringify(contents));
            }
            return true;
        }
        catch (error) {
            const sanitizedError = (0, logglyHelpers_1.convertErrorToLog)(error);
            sanitizedError.miscDataString = (0, logglyHelpers_1.safelyConvertAnyToString)({
                absolutePath,
            });
            this.args.serverLogger.log({
                level: "error",
                from: "AssetCache",
                type: "failedToWriteFile",
                error: sanitizedError,
            });
            return false;
        }
    }
    getCacheDir(subpath) {
        return path_1.default.join(this.cacheDir, subpath);
    }
    getAssetsDir(version) {
        return path_1.default.join(this.getCacheDir(version), this.assetsDirName);
    }
    getAssetsJsonPath(version) {
        return path_1.default.join(this.getCacheDir(version), this.assetsJsonFileName);
    }
    getAssetHeadersPath(version) {
        return path_1.default.join(this.getCacheDir(version), this.assetHeadersFileName);
    }
    async directoryExists(dir) {
        try {
            return await this.args.fs.isDirectory(dir);
        }
        catch (error) {
            return false;
        }
    }
    async readDir(dirPath) {
        try {
            return await this.args.fs.readdir(dirPath);
        }
        catch (error) {
            const sanitizedError = (0, logglyHelpers_1.convertErrorToLog)(error);
            sanitizedError.miscDataString = (0, logglyHelpers_1.safelyConvertAnyToString)({
                dirPath,
            });
            this.args.serverLogger.log({
                level: "error",
                from: "AssetCache",
                type: "failedToReadDir",
                error: sanitizedError,
            });
            return [];
        }
    }
    async remove(dirOrFilePath) {
        try {
            await this.args.fs.remove(dirOrFilePath);
        }
        catch (error) {
            const sanitizedError = (0, logglyHelpers_1.convertErrorToLog)(error);
            sanitizedError.miscDataString = (0, logglyHelpers_1.safelyConvertAnyToString)({
                dirOrFilePath,
            });
            this.args.serverLogger.log({
                level: "error",
                from: "AssetCache",
                type: "failedToRemoveDir",
                error: sanitizedError,
            });
        }
    }
    async getFileHash(filePath) {
        try {
            return await this.args.fs.getFileHash(filePath);
        }
        catch (error) {
            const sanitizedError = (0, logglyHelpers_1.convertErrorToLog)(error);
            sanitizedError.miscDataString = (0, logglyHelpers_1.safelyConvertAnyToString)({
                filePath,
            });
            this.args.serverLogger.log({
                level: "error",
                from: "AssetCache",
                type: "failedToGetFileHash",
                error: sanitizedError,
            });
        }
    }
}
exports.AssetCache = AssetCache;
