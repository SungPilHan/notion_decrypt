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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutatePromiseIntoAsyncQueuePromise = exports.AsyncQueue = void 0;
const PromiseUtils = __importStar(require("./PromiseUtils"));
class AsyncQueue {
    static async map(parallel, array, fn) {
        const queue = new AsyncQueue(parallel);
        return await Promise.all(array.map((value, index, array) => queue.enqueue(() => fn(value, index, array))));
    }
    constructor(parallel) {
        this.parallel = parallel;
        this.queue = [];
        this.running = [];
        this.afterFlushes = [];
        this.afterClogs = [];
    }
    getStats() {
        return {
            running: this.running.length,
            queue: this.queue.length,
        };
    }
    enqueue(thunk) {
        const deferred = PromiseUtils.deferred();
        const wrapped = () => thunk().then(deferred.resolve).catch(deferred.reject);
        this.queue.push({
            deferred: deferred,
            action: wrapped,
        });
        this.flush();
        const queuePromise = mutatePromiseIntoAsyncQueuePromise({
            promise: deferred.promise,
            canCancel: () => {
                return this.queue.some(task => task.deferred === deferred);
            },
            cancel: rejection => {
                const index = this.queue.findIndex(task => task.deferred === deferred);
                if (index >= 0) {
                    this.queue.splice(index, 1);
                    deferred.reject(rejection);
                }
            },
        });
        return queuePromise;
    }
    mapAsyncIterable(inputs, transform) {
        return __asyncGenerator(this, arguments, function* mapAsyncIterable_1() {
            const cancelables = new Set();
            const waitables = new Set();
            inputs.map(input => {
                const cancelable = this.enqueue(() => transform(input));
                cancelables.add(cancelable);
                const waitable = cancelable.finally(() => {
                    cancelables.delete(cancelable);
                    waitables.delete(waitable);
                });
                waitables.add(waitable);
                return waitable;
            });
            try {
                while (waitables.size > 0) {
                    yield yield __await(yield __await(Promise.race(waitables)));
                }
            }
            catch (error) {
                cancelables.forEach(promise => promise.cancel(error));
                throw error;
            }
            finally {
                cancelables.forEach(promise => promise.cancel(new Error("CanceledTask.")));
            }
        });
    }
    wrap(fn) {
        return (...args) => this.enqueue(() => fn(...args));
    }
    enqueueImmediate(thunk) {
        const promise = thunk();
        const deferred = PromiseUtils.deferred();
        promise.then(deferred.resolve).catch(deferred.reject);
        this.queue.push({
            action: () => promise,
            deferred: deferred,
        });
        this.flush();
        return promise;
    }
    flush() {
        if (this.queue.length === 0) {
            if (this.running.length === 0) {
                for (const deferred of this.afterFlushes) {
                    deferred.resolve(null);
                }
                this.afterFlushes = [];
            }
            if (this.running.length < this.parallel) {
                for (const deferred of this.afterClogs) {
                    deferred.resolve(null);
                }
                this.afterClogs = [];
            }
            return;
        }
        if (this.running.length >= this.parallel) {
            return;
        }
        const thunks = this.queue.splice(0, this.parallel - this.running.length);
        for (const thunk of thunks) {
            this.running.push(thunk);
        }
        for (const thunk of thunks) {
            void thunk.action().then(() => {
                this.running.splice(this.running.indexOf(thunk), 1);
                this.flush();
            });
        }
    }
    afterFlush() {
        const deferred = PromiseUtils.deferred();
        this.afterFlushes.push(deferred);
        this.flush();
        return deferred.promise;
    }
    afterClog() {
        const deferred = PromiseUtils.deferred();
        this.afterClogs.push(deferred);
        this.flush();
        return deferred.promise;
    }
    cancel() {
        const running = this.running;
        const queue = this.queue;
        this.running = [];
        this.queue = [];
        for (const task of running) {
            task.deferred.reject(new Error("CanceledTask."));
        }
        for (const task of queue) {
            task.deferred.reject(new Error("CanceledTask."));
        }
    }
}
exports.AsyncQueue = AsyncQueue;
function mutatePromiseIntoAsyncQueuePromise(args) {
    const { promise, canCancel, cancel } = args;
    const queuePromise = promise;
    queuePromise.canCancel = canCancel;
    queuePromise.cancel = cancel;
    return queuePromise;
}
exports.mutatePromiseIntoAsyncQueuePromise = mutatePromiseIntoAsyncQueuePromise;
