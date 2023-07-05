"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeLastBrowserTab = void 0;
const electron_log_1 = __importDefault(require("electron-log"));
const execPromise_1 = require("../helpers/execPromise");
const state_1 = require("./state");
async function closeLastBrowserTab(options) {
    const { isClosingBrowserTabs } = state_1.Store.getState().app.preferences;
    if (process.platform === "darwin" && isClosingBrowserTabs) {
        return closeLastBrowserTabDarwin(options);
    }
    return false;
}
exports.closeLastBrowserTab = closeLastBrowserTab;
async function getDefaultBrowser() {
    if (process.platform === "darwin") {
        const script = `defaults read com.apple.LaunchServices/com.apple.launchservices.secure LSHandlers | sed -n -e '/LSHandlerURLScheme = https;/{x;p;d;}' -e 's/.*=[^"]"\\(.*\\)";/\\1/g' -e x`;
        try {
            const { stdout } = await (0, execPromise_1.exec)(script);
            return stdout.trim();
        }
        catch (error) {
            electron_log_1.default.error(`Error getting default browser: ${error}`);
        }
    }
    return null;
}
function runAppleScript(script) {
    if (process.platform === "darwin") {
        return (0, execPromise_1.exec)(`osascript -e '${script}'`);
    }
    else {
        throw new Error("Not running on macOS");
    }
}
async function closeLastBrowserTabDarwin(options) {
    try {
        const browser = await getDefaultBrowser();
        if (!browser) {
            return false;
        }
        const script = `
      tell application id "${browser}"
        if URL of active tab of window 1 contains "${options.urlContaining}" then
            ${options.dryRun ? 'return "Hello"' : "close active tab of window 1"}
        end if
      end tell
    `;
        const { stderr } = await runAppleScript(script);
        return !stderr;
    }
    catch (error) {
        electron_log_1.default.error(`Error closing last browser tab: ${error}`);
        return false;
    }
}
