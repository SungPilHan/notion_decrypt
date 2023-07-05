"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_CODE_PREFIX = exports.PUBLIC_API_DOMAINS = exports.isEnvironmentName = exports.ENVIRONMENT_NAMES = exports.ENVIRONMENT_SHORT_NAMES_TO_NAMES = exports.ENVIRONMENT_NAMES_TO_SHORT_NAMES = void 0;
const lodash_1 = __importDefault(require("lodash"));
const typeUtils_1 = require("./typeUtils");
exports.ENVIRONMENT_NAMES_TO_SHORT_NAMES = {
    local: "local",
    staging: "stg",
    development: "dev",
    production: "prod",
};
exports.ENVIRONMENT_SHORT_NAMES_TO_NAMES = lodash_1.default.invert(exports.ENVIRONMENT_NAMES_TO_SHORT_NAMES);
exports.ENVIRONMENT_NAMES = (0, typeUtils_1.objectKeys)(exports.ENVIRONMENT_NAMES_TO_SHORT_NAMES);
function isEnvironmentName(s) {
    return typeof s === "string" && exports.ENVIRONMENT_NAMES.includes(s);
}
exports.isEnvironmentName = isEnvironmentName;
exports.PUBLIC_API_DOMAINS = {
    local: "localhost:3000",
    staging: "api-stg.notion.com",
    development: "api-dev.notion.com",
    production: "api.notion.com",
};
exports.AUTH_CODE_PREFIX = {
    local: 0,
    staging: 1,
    development: 2,
    production: 3,
};
