"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomlySucceedWithPercentage = void 0;
function randomlySucceedWithPercentage(percentage) {
    if (percentage <= 0) {
        return false;
    }
    if (percentage >= 100) {
        return true;
    }
    return Math.random() * 100 < percentage;
}
exports.randomlySucceedWithPercentage = randomlySucceedWithPercentage;
