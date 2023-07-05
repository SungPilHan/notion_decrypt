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
const electron_1 = require("electron");
const jest_mock_1 = require("jest-mock");
const fs_extra_1 = __importDefault(require("fs-extra"));
const electron_log_1 = __importDefault(require("electron-log"));
const tracing = __importStar(require("./tracing"));
(0, globals_1.describe)("tracing", () => {
    (0, globals_1.describe)("recordTraceAndPackage()", () => {
        (0, globals_1.it)("does not crash if app is not ready, does not try to trace", async () => {
            (0, jest_mock_1.mocked)(electron_1.app.isReady).mockReturnValueOnce(false);
            await tracing.recordTraceAndPackage(undefined, {
                seconds: 0,
            });
            (0, globals_1.expect)((0, jest_mock_1.mocked)(electron_log_1.default.error)).toHaveBeenCalled();
            (0, globals_1.expect)((0, jest_mock_1.mocked)(electron_1.contentTracing.startRecording)).toHaveBeenCalledTimes(0);
        });
        (0, globals_1.it)("does does try to trace otherwise", async () => {
            await tracing.recordTraceAndPackage(undefined, {
                seconds: 0,
            });
            (0, globals_1.expect)((0, jest_mock_1.mocked)(electron_log_1.default.error)).toHaveBeenCalledTimes(0);
            (0, globals_1.expect)((0, jest_mock_1.mocked)(electron_1.contentTracing.startRecording)).toHaveBeenCalledTimes(1);
            (0, globals_1.expect)((0, jest_mock_1.mocked)(electron_1.contentTracing.stopRecording)).toHaveBeenCalledTimes(1);
        });
        (0, globals_1.it)("attempts to write a zip file", async () => {
            (0, jest_mock_1.mocked)(electron_1.contentTracing.stopRecording).mockResolvedValue("/fake/path/to/trace.json");
            (0, jest_mock_1.mocked)(fs_extra_1.default.readFile).mockResolvedValue("[{}]");
            await tracing.recordTraceAndPackage(undefined, {
                seconds: 0,
            });
            (0, globals_1.expect)((0, jest_mock_1.mocked)(fs_extra_1.default.writeFile)).toHaveBeenCalledTimes(1);
            (0, globals_1.expect)((0, jest_mock_1.mocked)(fs_extra_1.default.writeFile).mock.calls[0][0]).toMatch(/\.zip$/);
        });
    });
});
