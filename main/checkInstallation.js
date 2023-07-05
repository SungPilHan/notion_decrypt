"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkInstallation = void 0;
const electron_1 = require("electron");
const notion_intl_1 = require("notion-intl");
const electron_log_1 = __importDefault(require("electron-log"));
const localizationHelper_1 = require("../helpers/localizationHelper");
const config_1 = __importDefault(require("../config"));
const localeHelpers_1 = require("../shared/localeHelpers");
async function checkInstallation() {
    if (process.platform !== "darwin") {
        return;
    }
    if (electron_1.app.isInApplicationsFolder()) {
        return;
    }
    const locale = (0, localeHelpers_1.externalLocaleToNotionLocale)(electron_1.app.getLocale(), config_1.default.env === "production");
    const intl = (0, localizationHelper_1.createIntlShape)(locale);
    const messages = (0, notion_intl_1.defineMessages)({
        invalidInstallMessage: {
            id: "desktopInstaller.invalidInstallDialog.title",
            defaultMessage: "Invalid Install",
            description: "Title of the dialog shown when the app is not installed properly",
        },
        invalidInstallDetail: {
            id: "desktopInstaller.invalidInstallDialog.confirmMove",
            defaultMessage: "Your Notion application is not installed properly. Can we move your Notion app into your Applications folder?",
            description: "Text of the dialog shown when the app is not installed properly",
        },
        okButton: {
            id: "desktopInstaller.invalidInstallDialog.okButton.label",
            defaultMessage: "OK",
            description: "Label of the OK button in the dialog shown when the app is not installed properly",
        },
        cancelButton: {
            id: "desktopInstaller.invalidInstallDialog.cancelButton.label",
            defaultMessage: "Cancel",
            description: "Label of the Cancel button in the dialog shown when the app is not installed properly",
        },
        failedToMoveTitle: {
            id: "desktopInstaller.failedToMove.title",
            defaultMessage: "Failed to move app",
            description: "Title of the dialog shown when we failed to move the app to the Applications folder",
        },
        failedToMoveDetail: {
            id: "desktopInstaller.failedToMove.detail",
            defaultMessage: "We failed to move the app to your Applications folder. Please move it manually.",
            description: "Text of the dialog shown when we failed to move the app to the Applications folder",
        },
    });
    const { response } = await electron_1.dialog.showMessageBox({
        type: "error",
        buttons: [
            intl.formatMessage(messages.cancelButton),
            intl.formatMessage(messages.okButton),
        ],
        message: intl.formatMessage(messages.invalidInstallMessage),
        detail: [intl.formatMessage(messages.invalidInstallDetail)].join("\n"),
    });
    if (response === 0) {
        electron_1.app.quit();
    }
    try {
        electron_1.app.moveToApplicationsFolder();
    }
    catch (error) {
        electron_log_1.default.error(`Failed to move app to Applications folder`, { error });
        await electron_1.dialog.showMessageBox({
            type: "error",
            buttons: [intl.formatMessage(messages.okButton)],
            message: intl.formatMessage(messages.failedToMoveTitle),
            detail: [intl.formatMessage(messages.failedToMoveDetail)].join("\n"),
        });
        electron_1.app.quit();
    }
}
exports.checkInstallation = checkInstallation;
