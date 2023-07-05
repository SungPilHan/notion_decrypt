"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElectronAppFeatures = exports.DEFAULT_PERSISTED_PREFERENCES = void 0;
const state_1 = require("./state");
const ALWAYS_SET = {
    isTabsFeatureEnabled: true,
    isElectronUsingCommandNumber: true,
    isNotionProtocolBugFixed: false,
};
exports.DEFAULT_PERSISTED_PREFERENCES = {
    isClosingBrowserTabs: false,
};
function getElectronAppFeatures(mixin = {}) {
    const preferences = Object.assign(Object.assign(Object.assign({}, exports.DEFAULT_PERSISTED_PREFERENCES), (state_1.Store.getState().app.preferences || {})), mixin.preferences);
    return Object.assign(Object.assign(Object.assign({}, ALWAYS_SET), mixin), { preferences });
}
exports.getElectronAppFeatures = getElectronAppFeatures;
