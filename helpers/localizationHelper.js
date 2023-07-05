"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIntlShape = exports.getMessages = void 0;
const notion_intl_1 = require("notion-intl");
const messages_json_1 = __importDefault(require("../i18n/ko_KR/messages.json"));
const messages_json_2 = __importDefault(require("../i18n/es_ES/messages.json"));
const messages_json_3 = __importDefault(require("../i18n/es_419/messages.json"));
const messages_json_4 = __importDefault(require("../i18n/fr_FR/messages.json"));
const messages_json_5 = __importDefault(require("../i18n/ja_JP/messages.json"));
const messages_json_6 = __importDefault(require("../i18n/pt_BR/messages.json"));
const messages_json_7 = __importDefault(require("../i18n/zh_CN/messages.json"));
const messages_json_8 = __importDefault(require("../i18n/zh_TW/messages.json"));
const messages_json_9 = __importDefault(require("../i18n/de_DE/messages.json"));
const messages_json_10 = __importDefault(require("../i18n/da_DK/messages.json"));
const messages_json_11 = __importDefault(require("../i18n/fi_FI/messages.json"));
const messages_json_12 = __importDefault(require("../i18n/nb_NO/messages.json"));
const messages_json_13 = __importDefault(require("../i18n/nl_NL/messages.json"));
const messages_json_14 = __importDefault(require("../i18n/sv_SE/messages.json"));
function getMessages(locale) {
    const localeToMessages = {
        "ko-KR": messages_json_1.default,
        "es-ES": messages_json_2.default,
        "es-LA": messages_json_3.default,
        "fr-FR": messages_json_4.default,
        "ja-JP": messages_json_5.default,
        "pt-BR": messages_json_6.default,
        "zh-CN": messages_json_7.default,
        "zh-TW": messages_json_8.default,
        "de-DE": messages_json_9.default,
        "da-DK": messages_json_10.default,
        "fi-FI": messages_json_11.default,
        "nb-NO": messages_json_12.default,
        "nl-NL": messages_json_13.default,
        "sv-SE": messages_json_14.default,
    };
    return localeToMessages[locale];
}
exports.getMessages = getMessages;
function createIntlShape(locale) {
    const messages = getMessages(locale);
    const cache = (0, notion_intl_1.createIntlCache)();
    const intl = (0, notion_intl_1.createIntl)({ locale: locale, defaultLocale: "en-US", messages }, cache);
    return intl;
}
exports.createIntlShape = createIntlShape;
