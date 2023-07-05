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
exports.assetCache = void 0;
const electron_1 = __importDefault(require("electron"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const electron_log_1 = __importDefault(require("electron-log"));
const AssetCache_1 = require("../shared/AssetCache");
const config_1 = __importDefault(require("../config"));
const serverLogger_1 = require("../helpers/serverLogger");
const mainIpc = __importStar(require("./mainIpc"));
const cleanObjectForSerialization_1 = require("../shared/cleanObjectForSerialization");
const constants_1 = require("../shared/constants");
const lodash_1 = __importDefault(require("lodash"));
const AppController_1 = require("./AppController");
exports.assetCache = new AssetCache_1.AssetCache({
    baseUrl: config_1.default.domainBaseUrl,
    baseDir: electron_1.default.app.getPath("userData"),
    tempDir: electron_1.default.app.getPath("temp"),
    localLogger: electron_log_1.default.scope("assetCache"),
    serverLogger: serverLogger_1.serverLogger,
    fs: {
        async mkdirp(dirPath) {
            await fs_extra_1.default.mkdirp(dirPath);
        },
        async readdir(dirPath) {
            return fs_extra_1.default.readdir(dirPath);
        },
        async isDirectory(str) {
            const stat = await fs_extra_1.default.stat(str);
            return stat.isDirectory();
        },
        async isFile(str) {
            const stat = await fs_extra_1.default.stat(str);
            return stat.isFile();
        },
        async remove(str) {
            await fs_extra_1.default.remove(str);
        },
        async getFileHash(filePath) {
            const fileStream = fs_extra_1.default.createReadStream(filePath);
            const hash = crypto_1.default.createHash("md5");
            fileStream.on("data", data => hash.update(data));
            return new Promise((resolve, reject) => {
                fileStream.on("error", function (error) {
                    reject(error);
                });
                fileStream.on("end", function () {
                    resolve(hash.digest("hex"));
                });
            });
        },
        async downloadFile(args) {
            await fs_extra_1.default.mkdirp(path_1.default.parse(args.dest).dir);
            const req = electron_1.default.net.request({
                url: args.url,
                session: electron_1.default.session.fromPartition(constants_1.electronSessionPartition),
            });
            const write = fs_extra_1.default.createWriteStream(args.dest);
            const headers = {};
            req.on("response", function (response) {
                const { statusCode, statusMessage } = response;
                response.once("error", lodash_1.default.identity);
                if ((statusCode < 200 || statusCode > 299) && statusCode !== 304) {
                    const error = new Error(`Response code ${statusCode} (${statusMessage})`);
                    req.emit("error", error);
                    return;
                }
                for (const [key, value] of Object.entries(response.headers)) {
                    if (typeof value === "string") {
                        headers[key] = value;
                    }
                    else if (Array.isArray(value) && value.length > 0) {
                        headers[key] = value.join(", ");
                    }
                }
                const stream = response;
                stream.pipe(write);
            });
            return new Promise((resolve, reject) => {
                req.on("error", reject);
                write.on("error", reject);
                write.on("finish", () => resolve(headers));
                req.end();
            });
        },
        async copy(args) {
            await fs_extra_1.default.copy(args.src, args.dest);
        },
        async move(args) {
            await fs_extra_1.default.move(args.src, args.dest);
        },
        async readFile(filePath) {
            return fs_extra_1.default.readFile(filePath, "utf8");
        },
        async writeFile(filePath, contents) {
            await fs_extra_1.default.writeFile(filePath, contents, "utf8");
        },
    },
});
exports.assetCache.events.addListener("error", error => {
    AppController_1.appController.sendMainToAllNotionInstances("notion:app-update-error", (0, cleanObjectForSerialization_1.cleanObjectForSerialization)(error));
});
exports.assetCache.events.addListener("checking-for-update", () => {
    AppController_1.appController.sendMainToAllNotionInstances("notion:checking-for-app-update");
});
exports.assetCache.events.addListener("update-available", info => {
    AppController_1.appController.sendMainToAllNotionInstances("notion:app-update-available", info);
});
exports.assetCache.events.addListener("update-not-available", () => {
    AppController_1.appController.sendMainToAllNotionInstances("notion:app-update-not-available");
});
exports.assetCache.events.addListener("download-progress", progress => {
    AppController_1.appController.sendMainToAllNotionInstances("notion:app-update-progress", progress);
});
exports.assetCache.events.addListener("update-downloaded", info => {
    AppController_1.appController.sendMainToAllNotionInstances("notion:app-update-ready", info);
});
exports.assetCache.events.addListener("update-finished", assets => {
    AppController_1.appController.sendMainToAllNotionInstances("notion:app-update-finished", assets);
});
mainIpc.handleEventFromRenderer.addListener("notion:check-for-app-updates", () => {
    void exports.assetCache.checkForUpdates();
});
