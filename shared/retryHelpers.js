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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomNumberBetweenMinMax = exports.getExponentialBackoffWithJitterSeconds = exports.simpleRetry = exports.retry = void 0;
const PromiseUtils = __importStar(require("./PromiseUtils"));
async function retry(args) {
    const { fn, handleError, retryAttemptsMS, retryAttemptRandomOffsetMS } = args;
    let fnError;
    let fnInput = args.initialInput;
    for (let retryCount = 0; retryCount <= retryAttemptsMS.length; retryCount += 1) {
        try {
            return await fn(fnInput);
        }
        catch (error) {
            const isLastAttempt = retryCount >= retryAttemptsMS.length;
            const processedError = handleError(error, isLastAttempt, retryCount, fnInput);
            if (processedError.status === "throw") {
                fnError = processedError.error;
                break;
            }
            if (isLastAttempt) {
                fnError = error;
                break;
            }
            const attemptMS = retryAttemptsMS[retryCount] + Math.random() * retryAttemptRandomOffsetMS;
            await PromiseUtils.timeout(attemptMS);
            if (processedError.input) {
                fnInput = processedError.input;
            }
        }
    }
    throw fnError;
}
exports.retry = retry;
function simpleRetry(fn, retryAttemptsMS = [1000, 2000, 5000, 10000], retryAttemptRandomOffsetMS = 200) {
    return retry({
        fn: fn,
        handleError: () => ({ status: "retry" }),
        retryAttemptsMS,
        retryAttemptRandomOffsetMS,
        initialInput: undefined,
    });
}
exports.simpleRetry = simpleRetry;
function getExponentialBackoffWithJitterSeconds(args) {
    const { config, attempt } = args;
    return (config.base * Math.pow(2, attempt) +
        getRandomNumberBetweenMinMax(config.minJitter, config.maxJitter));
}
exports.getExponentialBackoffWithJitterSeconds = getExponentialBackoffWithJitterSeconds;
function getRandomNumberBetweenMinMax(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
exports.getRandomNumberBetweenMinMax = getRandomNumberBetweenMinMax;
