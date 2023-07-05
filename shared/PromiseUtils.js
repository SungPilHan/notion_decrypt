"use strict";
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseWithState = exports.concurrentAsyncIterable = exports.batchAsyncIterable = exports.Waitable = exports.timeAll = exports.retryTimeout = exports.raceWithTimeout = exports.requestTimeout = exports.deferred = exports.raceSettled = exports.race = exports.timeoutResolve = exports.timeout = exports.allBatched = exports.batch = exports.iterableAll = exports.isPromise = exports.eventLoopNextTick = exports.awaitAtMost = void 0;
const lodash_1 = __importDefault(require("lodash"));
const TimeSource_1 = require("./TimeSource");
function awaitAtMost(promise, timeout) {
    let timeoutId = null;
    let didTimeout = false;
    return new Promise(async (resolve, reject) => {
        await Promise.race([
            promise,
            new Promise(innerResolve => {
                timeoutId = setTimeout(() => {
                    didTimeout = true;
                    innerResolve();
                }, timeout);
            }),
        ]);
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        if (didTimeout) {
            reject(`Promise failed to resolve after ${timeout}ms.`);
        }
        resolve(promise);
    });
}
exports.awaitAtMost = awaitAtMost;
function eventLoopNextTick() {
    return new Promise(resolve => setImmediate(resolve));
}
exports.eventLoopNextTick = eventLoopNextTick;
function isPromise(obj) {
    return obj && "then" in obj && typeof obj.then === "function";
}
exports.isPromise = isPromise;
async function iterableAll(iterable, fn) {
    const results = [];
    for (const item of iterable) {
        results.push(fn(item));
    }
    return await Promise.all(results);
}
exports.iterableAll = iterableAll;
function batch(tasks, batchSize, processTasks) {
    return new Promise((resolve, reject) => {
        let currentIndex = 0;
        const results = [];
        const evalNext = () => {
            const currentTasks = lodash_1.default.slice(tasks, currentIndex, currentIndex + batchSize);
            currentIndex += batchSize;
            if (currentTasks.length > 0) {
                processTasks(currentTasks)
                    .then(result => {
                    results.push(result);
                    setImmediate(evalNext);
                })
                    .catch(reject);
            }
            else {
                resolve(results);
            }
        };
        evalNext();
    });
}
exports.batch = batch;
async function allBatched(tasks, batchSize, createPromise) {
    const results = [];
    if (batchSize <= 0) {
        throw new Error(`Invalid batch size: ${batchSize}`);
    }
    let currentIndex = 0;
    while (currentIndex < tasks.length) {
        const currentTasks = tasks.slice(currentIndex, currentIndex + batchSize);
        const values = await Promise.all(currentTasks.map((task, index) => createPromise(task, currentIndex + index)));
        currentIndex += batchSize;
        for (const value of values) {
            results.push(value);
        }
    }
    return results;
}
exports.allBatched = allBatched;
function timeout(time, timeSource = TimeSource_1.SYSTEM_TIME_SOURCE) {
    return new Promise(resolve => {
        timeSource.setTimeout(() => {
            resolve();
        }, time);
    });
}
exports.timeout = timeout;
function timeoutResolve(time, value) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(value);
        }, time);
    });
}
exports.timeoutResolve = timeoutResolve;
async function race(promises) {
    const defer = deferred();
    const rest = Promise.all(promises.map(async (promise, index) => {
        await promise;
        defer.resolve(index);
    }));
    const winner = await defer.promise;
    return { winner, rest };
}
exports.race = race;
function raceSettled(values) {
    return Promise.race(values).then(value => ({ status: "fulfilled", value }), error => ({ status: "rejected", reason: error }));
}
exports.raceSettled = raceSettled;
function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {
        resolve: resolve,
        reject: reject,
        promise,
    };
}
exports.deferred = deferred;
function requestTimeout(arg, time) {
    return new Promise((resolve, reject) => {
        void timeout(time).then(() => resolve({ result: undefined, timeout: true }));
        arg.then(result => resolve({ result, timeout: false })).catch(reject);
    });
}
exports.requestTimeout = requestTimeout;
async function raceWithTimeout(maxTimeoutMs, promises) {
    const promiseTimeout = deferred();
    const timerId = setTimeout(() => {
        promiseTimeout.resolve({ result: undefined, timeout: true });
    }, maxTimeoutMs);
    const firstResponse = await Promise.race([
        promiseTimeout.promise,
        Promise.race(promises).then(result => ({
            result,
            timeout: false,
        })),
    ]);
    clearTimeout(timerId);
    return firstResponse;
}
exports.raceWithTimeout = raceWithTimeout;
async function retryTimeout(tries, time, fn) {
    const result = await requestTimeout(fn(), time);
    if (tries <= 1 || !result.timeout) {
        return result;
    }
    return retryTimeout(tries - 1, time, fn);
}
exports.retryTimeout = retryTimeout;
const timeAll = async function (promises) {
    const start = Date.now();
    const mapped = promises.map(async (promise) => {
        if (promise) {
            await promise;
            return Date.now() - start;
        }
        else {
            return 0;
        }
    });
    return Promise.all(mapped);
};
exports.timeAll = timeAll;
class Waitable {
    constructor(timeSource = TimeSource_1.SYSTEM_TIME_SOURCE) {
        this.timeSource = timeSource;
        this.deferredPromise = deferred();
        this.isCompleted = false;
    }
    async wait(minDelay, maxDelay) {
        if (minDelay > 0) {
            await timeout(minDelay, this.timeSource);
        }
        const remainingDelay = maxDelay - minDelay;
        if (remainingDelay > 0) {
            await Promise.race([
                this.deferredPromise.promise,
                timeout(remainingDelay, this.timeSource),
            ]);
        }
        if (!this.isCompleted) {
            this.isCompleted = true;
            this.deferredPromise.resolve(undefined);
        }
    }
    trigger() {
        if (!this.isCompleted) {
            this.deferredPromise.resolve(undefined);
        }
        this.isCompleted = true;
    }
}
exports.Waitable = Waitable;
function batchAsyncIterable(maxConcurrency, input, transform) {
    return __asyncGenerator(this, arguments, function* batchAsyncIterable_1() {
        let batch = [];
        let inputIteratorDone = false;
        while (!inputIteratorDone) {
            while (batch.length < maxConcurrency) {
                const next = yield __await(input.next());
                const { value, done } = next;
                if (done === true) {
                    inputIteratorDone = true;
                    break;
                }
                batch.push(transform(value));
            }
            const completedTransforms = yield __await(Promise.all(batch));
            batch = [];
            for (const out of completedTransforms) {
                yield yield __await(out);
            }
        }
    });
}
exports.batchAsyncIterable = batchAsyncIterable;
function concurrentAsyncIterable(asyncIterators, maxConcurrency = Infinity) {
    return __asyncGenerator(this, arguments, function* concurrentAsyncIterable_1() {
        let asyncIteratorIndex = 0;
        const asyncIteratorToNextResult = new Map();
        do {
            while (asyncIteratorIndex < asyncIterators.length &&
                asyncIteratorToNextResult.size < maxConcurrency) {
                const asyncIterator = asyncIterators[asyncIteratorIndex];
                asyncIteratorToNextResult.set(asyncIterator, asyncIterator.next());
                asyncIteratorIndex++;
            }
            const [asyncIterator, iteratorResult] = yield __await(Promise.race([...asyncIteratorToNextResult].map(async ([asyncIterator, asyncIteratorNextResult]) => [asyncIterator, await asyncIteratorNextResult])));
            if (!iteratorResult.done) {
                asyncIteratorToNextResult.set(asyncIterator, asyncIterator.next());
            }
            else {
                asyncIteratorToNextResult.delete(asyncIterator);
            }
            yield yield __await(iteratorResult);
        } while (asyncIteratorToNextResult.size > 0);
    });
}
exports.concurrentAsyncIterable = concurrentAsyncIterable;
class PromiseWithState {
    constructor(promise) {
        this.wrappedPromise = promise;
        this._state = { status: "pending" };
        promise.then(value => {
            this._state = {
                status: "resolved",
                value,
            };
        }, error => {
            this._state = {
                status: "rejected",
                error,
            };
        });
    }
    get state() {
        return this._state;
    }
}
exports.PromiseWithState = PromiseWithState;
