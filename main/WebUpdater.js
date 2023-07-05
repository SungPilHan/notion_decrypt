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
exports.WebUpdater = void 0;
const electron_log_1 = __importDefault(require("electron-log"));
const AppController_1 = require("./AppController");
const config_1 = __importDefault(require("../config"));
const state_1 = require("./state");
const mainIpc = __importStar(require("./mainIpc"));
const schemeHelpers = __importStar(require("../shared/schemeHelpers"));
class WebUpdater {
    constructor(app, assetCache) {
        this.pendingUpdate = undefined;
        this.backgroundInterval = undefined;
        this.app = app;
        this.assetCache = assetCache;
        this.isAppVisible = true;
        (0, state_1.subscribeToSelector)(state_1.selectAppVisibilityBaseOnRenderers, (isVisible) => {
            this.isAppVisible = isVisible;
            electron_log_1.default.info(`App is visible: ${isVisible}`);
            this.onAppVisibilityChange(isVisible);
        });
        this.assetCache.events.addListener("update-finished", () => this.updateFinished());
        this.assetCache.events.addListener("update-applied", () => this.updateApplied());
        mainIpc.handleEventFromRenderer.addListener("notion:install-appjs-update", (event, url) => {
            if (!this.pendingUpdate) {
                return;
            }
            void this.assetCache.syncVersions().then(() => {
                var _a;
                const schemeUrl = schemeHelpers.normalizeToSchemeUrl({
                    url: url,
                    protocol: config_1.default.protocol,
                    domainBaseUrl: config_1.default.domainBaseUrl,
                });
                if (schemeUrl) {
                    void ((_a = AppController_1.appController
                        .getTabControllerForWebContents(event.sender)) === null || _a === void 0 ? void 0 : _a.loadUrl(schemeUrl));
                    AppController_1.appController.refreshAll(false);
                }
                else {
                    AppController_1.appController.refreshAll(true);
                }
            });
        });
    }
    updateFinished() {
        if (this.pendingUpdate) {
            return;
        }
        const now = Date.now();
        const updateJitter = config_1.default.env === "production" ? 24 * 60 * 60 * 1000 * Math.random() : 0;
        this.pendingUpdate = {
            updateAvailableAt: now,
            applyUpdateAfter: now + updateJitter,
        };
    }
    updateApplied() {
        this.pendingUpdate = undefined;
    }
    onAppVisibilityChange(isVisible) {
        if (isVisible) {
            if (this.backgroundInterval) {
                return;
            }
            this.backgroundInterval = setInterval(async () => {
                if (!this.pendingUpdate) {
                    return;
                }
                if (this.isAppVisible) {
                    return;
                }
                if (Date.now() < this.pendingUpdate.applyUpdateAfter) {
                    return;
                }
                electron_log_1.default.info("Sending update install notification to all windows");
                await this.assetCache.syncVersions();
                AppController_1.appController.refreshAll(true);
            }, 60 * 1000);
        }
        else {
            if (this.backgroundInterval) {
                clearInterval(this.backgroundInterval);
                this.backgroundInterval = undefined;
            }
        }
    }
}
exports.WebUpdater = WebUpdater;
