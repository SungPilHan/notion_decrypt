"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContentfulLocale = exports.localeFormatter = exports.allLocales = exports.deprecatedLocales = exports.defaultLocale = exports.getMatchedLocaleFromSession = exports.getLocaleFromCookie = exports.externalLocaleToNotionLocale = exports.isSupportedLanguageCode = exports.isPreferredLocaleOrigin = exports.isPreferredLocaleExtended = exports.isPreferredLocale = exports.isBetaLocale = exports.isDevelopmentLocale = exports.languageCodeToPreferredLocaleExtended = exports.countryToPreferredLocale = exports.preferredContentfulLocales = exports.ALL_LOCALE_ROUTES = exports.VALID_PREFERRED_LOCALE_ROUTES_IN_DEVELOPMENT = exports.ALL_LOCALES = exports.VALID_PREFERRED_LOCALES_IN_DEVELOPMENT = exports.PSEUDOLOCALES = exports.VALID_PREFERRED_LOCALES_IN_BETA = exports.VALID_PREFERRED_LOCALES = void 0;
exports.VALID_PREFERRED_LOCALES = [
    "en-US",
    "ko-KR",
    "ja-JP",
    "fr-FR",
    "de-DE",
    "es-ES",
    "es-LA",
    "pt-BR",
];
exports.VALID_PREFERRED_LOCALES_IN_BETA = [
    "de-DE",
    "es-ES",
    "es-LA",
    "fr-FR",
    "ja-JP",
    "pt-BR",
    "zh-CN",
    "zh-TW",
    "da-DK",
    "nl-NL",
    "fi-FI",
    "nb-NO",
    "sv-SE",
];
exports.PSEUDOLOCALES = ["pseudo"];
exports.VALID_PREFERRED_LOCALES_IN_DEVELOPMENT = [
    "zh-CN",
    "zh-TW",
    "da-DK",
    "nl-NL",
    "fi-FI",
    "nb-NO",
    "sv-SE",
    ...exports.PSEUDOLOCALES,
];
exports.ALL_LOCALES = [
    ...exports.VALID_PREFERRED_LOCALES,
    ...exports.VALID_PREFERRED_LOCALES_IN_BETA,
    ...exports.VALID_PREFERRED_LOCALES_IN_DEVELOPMENT,
];
exports.VALID_PREFERRED_LOCALE_ROUTES_IN_DEVELOPMENT = exports.VALID_PREFERRED_LOCALES_IN_DEVELOPMENT.map((locale) => {
    const key = locale.split("-").join("");
    const value = locale.toLocaleLowerCase();
    return {
        [key]: `/${value}`,
    };
}).reduce((result, current) => Object.assign(result, current), {});
exports.ALL_LOCALE_ROUTES = exports.ALL_LOCALES.map((locale) => {
    const key = locale.split("-").join("");
    const value = locale.toLocaleLowerCase();
    return {
        [key]: `/${value}`,
    };
}).reduce((result, current) => Object.assign(result, current), {});
const VALID_PREFERRED_LOCALE_ORIGINS = [
    "autodetect",
    "user_choice",
    "legacy",
    "inferred_from_inviter",
];
exports.preferredContentfulLocales = {
    "es-LA": "es-419",
    "zh-TW": "zh-Hant-TW",
    pseudo: "yav",
};
exports.countryToPreferredLocale = {
    KR: "ko-KR",
    US: "en-US",
    JA: "ja-JP",
    FR: "fr-FR",
    DE: "de-DE",
    ES: "es-ES",
    BR: "pt-BR",
    AR: "es-LA",
    BO: "es-LA",
    CL: "es-LA",
    CO: "es-LA",
    CR: "es-LA",
    CU: "es-LA",
    DO: "es-LA",
    EC: "es-LA",
    SV: "es-LA",
    GT: "es-LA",
    HN: "es-LA",
    MX: "es-LA",
    NI: "es-LA",
    PA: "es-LA",
    PY: "es-LA",
    PE: "es-LA",
    PR: "es-LA",
    UY: "es-LA",
    VE: "es-LA",
};
const VALID_PREFERRED_LANGUAGE_CODES = [
    "en",
    "ko",
    "ja",
    "fr",
    "de",
    "es",
    "pt",
];
const VALID_PREFERRED_LANGUAGE_CODES_IN_DEVELOPMENT = [
    "es",
    "fr",
    "pt",
    "zh",
    "da",
    "nl",
    "fi",
    "nb",
    "sv",
];
exports.languageCodeToPreferredLocaleExtended = {
    de: "de-DE",
    ko: "ko-KR",
    en: "en-US",
    es: "es-LA",
    fr: "fr-FR",
    ja: "ja-JP",
    pt: "pt-BR",
    zh: "zh-CN",
    da: "da-DK",
    fi: "fi-FI",
    nl: "nl-NL",
    nb: "nb-NO",
    sv: "sv-SE",
};
function isDevelopmentLocale(locale) {
    return exports.VALID_PREFERRED_LOCALES_IN_DEVELOPMENT.includes(locale);
}
exports.isDevelopmentLocale = isDevelopmentLocale;
function isBetaLocale(locale) {
    return exports.VALID_PREFERRED_LOCALES_IN_BETA.includes(locale);
}
exports.isBetaLocale = isBetaLocale;
function isPreferredLocale(locale) {
    return exports.VALID_PREFERRED_LOCALES.includes(locale);
}
exports.isPreferredLocale = isPreferredLocale;
function isPreferredLocaleExtended(locale) {
    return isPreferredLocale(locale) || isDevelopmentLocale(locale);
}
exports.isPreferredLocaleExtended = isPreferredLocaleExtended;
function isPreferredLocaleOrigin(origin) {
    return VALID_PREFERRED_LOCALE_ORIGINS.includes(origin);
}
exports.isPreferredLocaleOrigin = isPreferredLocaleOrigin;
function isPreferredLanguageCode(languageCode) {
    return VALID_PREFERRED_LANGUAGE_CODES.includes(languageCode);
}
function isSupportedLanguageCode(languageCode) {
    return (isPreferredLanguageCode(languageCode) ||
        VALID_PREFERRED_LANGUAGE_CODES_IN_DEVELOPMENT.includes(languageCode));
}
exports.isSupportedLanguageCode = isSupportedLanguageCode;
function externalLocaleToNotionLocale(externalLocale, onlyProdLanguages) {
    const [languageCode, region] = externalLocale.split("-");
    if (languageCode && !region) {
        if ((Boolean(onlyProdLanguages) && isPreferredLanguageCode(languageCode)) ||
            isSupportedLanguageCode(languageCode)) {
            return exports.languageCodeToPreferredLocaleExtended[languageCode];
        }
    }
    if ((Boolean(onlyProdLanguages) && isPreferredLocale(externalLocale)) ||
        isPreferredLocaleExtended(externalLocale)) {
        return externalLocale;
    }
    return "en-US";
}
exports.externalLocaleToNotionLocale = externalLocaleToNotionLocale;
function getLocaleFromCookie(cookie) {
    if (cookie === "") {
        return "en-US";
    }
    const [localeCookie] = decodeURIComponent(cookie).split("/");
    if (localeCookie && isPreferredLocaleExtended(localeCookie)) {
        return localeCookie;
    }
    return "en-US";
}
exports.getLocaleFromCookie = getLocaleFromCookie;
function getMatchedLocaleFromSession(localeFromCookie, localeFromSession, localeList, languageCodeLookup) {
    const localeFromLanguageCode = languageCodeLookup[localeFromSession.substring(0, 2)];
    if ((localeFromCookie === null || localeFromCookie === void 0 ? void 0 : localeFromCookie.length) === 5) {
        return localeFromCookie;
    }
    else if (localeFromSession.length > 2 &&
        (localeList === null || localeList === void 0 ? void 0 : localeList.indexOf(localeFromSession.toLocaleLowerCase())) !== -1) {
        return localeFromSession;
    }
    else if (localeFromLanguageCode !== undefined) {
        return localeFromLanguageCode;
    }
    return undefined;
}
exports.getMatchedLocaleFromSession = getMatchedLocaleFromSession;
exports.defaultLocale = "en-US";
exports.deprecatedLocales = ["ko"];
exports.allLocales = "*";
function localeFormatter(locale) {
    var _a;
    if (locale && exports.deprecatedLocales.includes(locale)) {
        return exports.defaultLocale;
    }
    return (((_a = locale === null || locale === void 0 ? void 0 : locale.replace(/(\-[a-z])\w+/g, (match) => match.toUpperCase())) === null || _a === void 0 ? void 0 : _a.replace(/([A-Z]*[A-Z]\-)+/gm, (match) => match.toLocaleLowerCase())) || exports.defaultLocale);
}
exports.localeFormatter = localeFormatter;
function getContentfulLocale(locale) {
    const formattedLocale = localeFormatter(locale);
    return exports.preferredContentfulLocales[formattedLocale] || formattedLocale;
}
exports.getContentfulLocale = getContentfulLocale;
