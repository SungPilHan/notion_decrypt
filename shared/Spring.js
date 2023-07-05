"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Spring {
    constructor() {
        this.stiffness = 50;
        this.damping = 10;
        this.precision = 0.001;
        this.currentValue = 0;
        this.endValue = 0;
        this.velocity = 0;
    }
    isAtRest() {
        return Math.abs(this.endValue - this.currentValue) <= this.precision;
    }
    setEndValue(value) {
        this.endValue = value;
        const isAtRest = this.isAtRest();
        if (isAtRest) {
            this.setAtRest();
        }
        return isAtRest;
    }
    jumpToEnd() {
        this.currentValue = this.endValue;
    }
    step(dt) {
        let dtCounter = dt;
        do {
            let stepDt;
            if (dtCounter > Spring.timestep) {
                dtCounter -= Spring.timestep;
                stepDt = Spring.timestep;
            }
            else {
                stepDt = dtCounter;
                dtCounter = 0;
            }
            const [xf, vf] = this.rk4(this.currentValue, this.velocity, stepDt);
            this.velocity = vf;
            this.currentValue = xf;
        } while (dtCounter > 0);
        const isAtRest = this.isAtRest();
        if (isAtRest) {
            this.setAtRest();
        }
        return isAtRest;
    }
    setAtRest() {
        this.currentValue = this.endValue;
        this.velocity = 0;
    }
    rk4(x, v, dt) {
        var x1 = x;
        var v1 = v;
        var a1 = this.computeAccel(x1, v1, 0);
        var x2 = x + 0.5 * v1 * dt;
        var v2 = v + 0.5 * a1 * dt;
        var a2 = this.computeAccel(x2, v2, dt / 2);
        var x3 = x + 0.5 * v2 * dt;
        var v3 = v + 0.5 * a2 * dt;
        var a3 = this.computeAccel(x3, v3, dt / 2);
        var x4 = x + v3 * dt;
        var v4 = v + a3 * dt;
        var a4 = this.computeAccel(x4, v4, dt);
        var xf = x + (dt / 6) * (v1 + 2 * v2 + 2 * v3 + v4);
        var vf = v + (dt / 6) * (a1 + 2 * a2 + 2 * a3 + a4);
        return [xf, vf];
    }
    computeAccel(x, v, dt) {
        return (this.stiffness * Spring.stiffnessMultiplier * (this.endValue - x) -
            this.damping * Spring.dampingMultiplier * v);
    }
}
Spring.stiffnessMultiplier = 0.00001;
Spring.dampingMultiplier = 0.005;
Spring.timestep = 1000 / 60;
exports.default = Spring;
