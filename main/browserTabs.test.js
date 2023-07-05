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
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const jest_mock_1 = require("jest-mock");
const browserTabs = __importStar(require("./browserTabs"));
const execPromise_1 = require("../helpers/execPromise");
const state_1 = require("./state");
(0, globals_1.describe)("browserTabs", () => {
    (0, globals_1.describe)("closeLastBrowserTab()", () => {
        const originalPlatform = process.platform;
        const defaultOptions = {
            urlContaining: "notion.so",
        };
        (0, globals_1.beforeEach)(() => {
            Object.defineProperty(process, "platform", { value: "darwin" });
            state_1.Store.dispatch((0, state_1.updatePreferences)({
                isClosingBrowserTabs: true,
            }));
            (0, jest_mock_1.mocked)(execPromise_1.exec).mockResolvedValueOnce({
                stderr: "",
                stdout: "com.google.chrome",
            });
            (0, jest_mock_1.mocked)(execPromise_1.exec).mockResolvedValueOnce({ stderr: "", stdout: "Hello" });
        });
        (0, globals_1.afterEach)(() => {
            Object.defineProperty(process, "platform", { value: originalPlatform });
        });
        (0, globals_1.it)("does not throw on Windows", async () => {
            Object.defineProperty(process, "platform", { value: "win32" });
            (0, globals_1.expect)(await browserTabs.closeLastBrowserTab(defaultOptions)).toBe(false);
        });
        (0, globals_1.it)("returns false if AppleScript is blocked", async () => {
            (0, jest_mock_1.mocked)(execPromise_1.exec).mockReset();
            (0, jest_mock_1.mocked)(execPromise_1.exec).mockRejectedValue(new Error("execution error: Not authorized to send Apple events to Google Chrome. (-1743)"));
            (0, globals_1.expect)(await browserTabs.closeLastBrowserTab(defaultOptions)).toBe(false);
        });
        (0, globals_1.it)("runs AppleScript on macOS", async () => {
            (0, globals_1.expect)(await browserTabs.closeLastBrowserTab(defaultOptions)).toBe(true);
            (0, globals_1.expect)((0, jest_mock_1.mocked)(execPromise_1.exec).mock.calls[0][0]).toMatch(/defaults read com.apple.LaunchService/);
            (0, globals_1.expect)((0, jest_mock_1.mocked)(execPromise_1.exec).mock.calls[1][0]).toMatch(/osascript/);
        });
        (0, globals_1.it)("passes the url down to osascript", async () => {
            (0, globals_1.expect)(await browserTabs.closeLastBrowserTab({
                urlContaining: "hi-hello",
                dryRun: true,
            })).toBe(true);
            (0, globals_1.expect)((0, jest_mock_1.mocked)(execPromise_1.exec).mock.calls[0][0]).toMatch(/defaults read com.apple.LaunchService/);
            (0, globals_1.expect)((0, jest_mock_1.mocked)(execPromise_1.exec).mock.calls[1][0]).toMatch(/osascript/);
            (0, globals_1.expect)((0, jest_mock_1.mocked)(execPromise_1.exec).mock.calls[1][0]).toContain("hi-hello");
        });
        (0, globals_1.it)("does not actually close tabs with dryRun: true", async () => {
            (0, globals_1.expect)(await browserTabs.closeLastBrowserTab(Object.assign(Object.assign({}, defaultOptions), { dryRun: true }))).toBe(true);
            (0, globals_1.expect)((0, jest_mock_1.mocked)(execPromise_1.exec).mock.calls[0][0]).toMatch(/defaults read com.apple.LaunchService/);
            (0, globals_1.expect)((0, jest_mock_1.mocked)(execPromise_1.exec).mock.calls[1][0]).toMatch(/osascript/);
            (0, globals_1.expect)((0, jest_mock_1.mocked)(execPromise_1.exec).mock.calls[1][0]).not.toContain("close");
        });
    });
});
