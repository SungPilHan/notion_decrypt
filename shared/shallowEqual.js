"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
function shallowEqual(objA, objB) {
    if (equalOrEmpty(objA, objB)) {
        return true;
    }
    if (lodash_1.default.isPlainObject(objA) && lodash_1.default.isPlainObject(objB)) {
        for (const key in objA) {
            if (objA.hasOwnProperty(key)) {
                if (!objB.hasOwnProperty(key)) {
                    return false;
                }
                if (key.toLowerCase().endsWith("style") ||
                    key.toLowerCase().endsWith("props")) {
                    if (!shallowEqual(objA[key], objB[key])) {
                        return false;
                    }
                }
                else {
                    if (!equalOrEmpty(objA[key], objB[key])) {
                        return false;
                    }
                }
            }
        }
        for (const key in objB) {
            if (objB.hasOwnProperty(key) && !objA.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }
    if (lodash_1.default.isArray(objA) && lodash_1.default.isArray(objB)) {
        if (objA.length !== objB.length) {
            return false;
        }
        for (let i = 0; i < objA.length; i++) {
            if (!equalOrEmpty(objA[i], objB[i])) {
                return false;
            }
        }
        return true;
    }
    return false;
}
exports.default = shallowEqual;
function isEmptyObject(value) {
    return lodash_1.default.isPlainObject(value) && lodash_1.default.isEmpty(value);
}
function isEmptyArray(value) {
    return lodash_1.default.isArray(value) && lodash_1.default.isEmpty(value);
}
function equalOrEmpty(objA, objB) {
    if (objA === objB) {
        return true;
    }
    if (isEmptyArray(objA) && isEmptyArray(objB)) {
        return true;
    }
    if (isEmptyObject(objA) && isEmptyObject(objB)) {
        return true;
    }
    return false;
}
