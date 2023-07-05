"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormattedDate = exports.RawIntlProvider = exports.IntlProvider = exports.FormattedNumber = exports.FormattedMessage = exports.FormattedList = exports.useIntl = exports.createIntlCache = exports.createIntl = exports.injectIntl = exports.defineMessages = void 0;
const react_intl_1 = require("react-intl");
const defined = Symbol("defined message descriptor");
function defineMessages(messages) {
    return messages;
}
exports.defineMessages = defineMessages;
function injectIntl(Comp) {
    return (0, react_intl_1.injectIntl)(Comp);
}
exports.injectIntl = injectIntl;
var react_intl_2 = require("react-intl");
Object.defineProperty(exports, "createIntl", { enumerable: true, get: function () { return react_intl_2.createIntl; } });
Object.defineProperty(exports, "createIntlCache", { enumerable: true, get: function () { return react_intl_2.createIntlCache; } });
Object.defineProperty(exports, "useIntl", { enumerable: true, get: function () { return react_intl_2.useIntl; } });
Object.defineProperty(exports, "FormattedList", { enumerable: true, get: function () { return react_intl_2.FormattedList; } });
Object.defineProperty(exports, "FormattedMessage", { enumerable: true, get: function () { return react_intl_2.FormattedMessage; } });
Object.defineProperty(exports, "FormattedNumber", { enumerable: true, get: function () { return react_intl_2.FormattedNumber; } });
Object.defineProperty(exports, "IntlProvider", { enumerable: true, get: function () { return react_intl_2.IntlProvider; } });
Object.defineProperty(exports, "RawIntlProvider", { enumerable: true, get: function () { return react_intl_2.RawIntlProvider; } });
Object.defineProperty(exports, "FormattedDate", { enumerable: true, get: function () { return react_intl_2.FormattedDate; } });
