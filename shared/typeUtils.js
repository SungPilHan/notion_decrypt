"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapObject = exports.upcast = exports.stringStartsWith = exports.traverse = exports.Info = exports.DeprecatedAPI = exports.Opaque = exports.propertyOf = exports.oneOf = exports.isObject = exports.makeTypeGuard = exports.unreachable = exports.nullableToUndefinable = exports.isDefined = exports.isNotNull = exports.arrayIncludes = exports.objectAssign = exports.isKeyInObject = exports.objectEntries = exports.objectKeys = exports.isNonEmptyArray = void 0;
function isNonEmptyArray(array) {
    return array.length > 0;
}
exports.isNonEmptyArray = isNonEmptyArray;
exports.objectKeys = Object.keys;
exports.objectEntries = Object.entries;
const isKeyInObject = (object, key) => key in object;
exports.isKeyInObject = isKeyInObject;
exports.objectAssign = Object.assign;
const arrayIncludes = (array, item) => array.includes(item);
exports.arrayIncludes = arrayIncludes;
function isNotNull(value) {
    return value !== null;
}
exports.isNotNull = isNotNull;
function isDefined(value) {
    if (value !== undefined) {
        return true;
    }
    return false;
}
exports.isDefined = isDefined;
function nullableToUndefinable(value) {
    return isNotNull(value) ? value : undefined;
}
exports.nullableToUndefinable = nullableToUndefinable;
function unreachable(never) {
    throw new Error(`Expected value to never occur: ${JSON.stringify(never)}`);
}
exports.unreachable = unreachable;
const makeTypeGuard = (typeGuard) => (value) => "true" in typeGuard(value);
exports.makeTypeGuard = makeTypeGuard;
function isObject(value) {
    return typeof value === "object" && value !== null;
}
exports.isObject = isObject;
function oneOf(predicates) {
    function isOneOf(value, predicates) {
        return predicates.some(predicate => predicate(value));
    }
    return (value) => isOneOf(value, predicates);
}
exports.oneOf = oneOf;
function propertyOf(name) {
    return name.toString();
}
exports.propertyOf = propertyOf;
function Opaque(value, symbol) {
    return value;
}
exports.Opaque = Opaque;
exports.DeprecatedAPI = Symbol("deprecated api name");
const UnsafeAPI = Symbol("abstracted api name");
exports.Info = Symbol("info message");
const Warning = Symbol("warning message");
function traverse(map) {
    return node => {
        const result = map(node);
        return result !== null && result !== void 0 ? result : [];
    };
}
exports.traverse = traverse;
function stringStartsWith(string, startsWith) {
    return string.startsWith(startsWith);
}
exports.stringStartsWith = stringStartsWith;
function upcast(value) {
    return value;
}
exports.upcast = upcast;
const mapObject = (obj, mappingFn) => {
    const newObj = {};
    for (const [key, value] of (0, exports.objectEntries)(obj)) {
        newObj[key] = mappingFn(value, key);
    }
    return newObj;
};
exports.mapObject = mapObject;
