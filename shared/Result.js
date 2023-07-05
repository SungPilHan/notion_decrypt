"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchErrors = exports.Result = void 0;
exports.Result = {
    isSuccess(result) {
        return !("error" in result);
    },
    isFail(result) {
        return "error" in result;
    },
    unwrap(result) {
        if (exports.Result.isFail(result)) {
            throw result.error;
        }
        else {
            return result.value;
        }
    },
    unwrapOr(result, defaultValue) {
        if (exports.Result.isFail(result)) {
            return defaultValue;
        }
        else {
            return result.value;
        }
    },
    reduce(array, fn) {
        let acc = { value: array[0] };
        for (let index = 1; index < array.length; index++) {
            const current = array[index];
            if (exports.Result.isFail(acc)) {
                return acc;
            }
            else {
                acc = fn(acc.value, current);
            }
        }
        return acc;
    },
};
function isPromiseLike(value) {
    switch (typeof value) {
        case "undefined":
        case "string":
        case "bigint":
        case "symbol":
        case "boolean":
            return false;
        case "function":
        case "object":
            return Boolean(value && "then" in value && typeof value["then"] === "function");
    }
    return false;
}
function catchErrors(block) {
    try {
        const result = block();
        if (isPromiseLike(result)) {
            return Promise.resolve(result.then(value => ({ value }), error => ({ error })));
        }
        return { value: result };
    }
    catch (unknownError) {
        const error = unknownError;
        return { error };
    }
}
exports.catchErrors = catchErrors;
