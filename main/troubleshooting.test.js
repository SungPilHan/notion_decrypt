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
const globals_1 = require("@jest/globals");
const jest_mock_1 = require("jest-mock");
const fs_extra_1 = __importDefault(require("fs-extra"));
const electron_log_1 = __importDefault(require("electron-log"));
const troubleshooting = __importStar(require("./troubleshooting"));
const zip_1 = __importDefault(require("../helpers/zip"));
(0, globals_1.describe)("troubleshooting", () => {
    (0, globals_1.describe)("showLogsInShell()", () => {
        (0, globals_1.it)("reads logs, writes to the downloads folder", async () => {
            (0, jest_mock_1.mocked)(electron_log_1.default.transports.file.getFile).mockReturnValue({
                path: "/fake/path/file.log",
            });
            (0, jest_mock_1.mocked)(fs_extra_1.default.readdir).mockReturnValue(Promise.resolve(["file.log"]));
            (0, jest_mock_1.mocked)(fs_extra_1.default.readFile).mockReturnValue(Promise.resolve("hi"));
            await troubleshooting.showLogsInShell();
            (0, globals_1.expect)(fs_extra_1.default.readdir).toHaveBeenCalledTimes(1);
            (0, globals_1.expect)(fs_extra_1.default.readFile).toHaveBeenCalledTimes(1);
            (0, globals_1.expect)(fs_extra_1.default.writeFile).toHaveBeenCalledTimes(1);
        });
    });
    (0, globals_1.describe)("getAuxiliaryInfo()", () => {
        (0, globals_1.it)("returns zippable content", async () => {
            const data = await troubleshooting.getAuxiliaryInfo();
            const zipped = await (0, zip_1.default)(data);
            (0, globals_1.expect)(zipped).toBeTruthy();
        });
    });
});
