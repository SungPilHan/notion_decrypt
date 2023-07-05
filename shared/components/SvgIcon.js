"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
class SvgIcon extends react_1.default.Component {
    render() {
        const { svg, viewBox, style, className } = this.props;
        return (react_1.default.createElement("svg", { viewBox: viewBox, style: Object.assign({ width: "100%", height: "100%", display: "block", fill: "inherit", flexShrink: 0, WebkitBackfaceVisibility: "hidden" }, style), className: className }, svg));
    }
}
exports.default = SvgIcon;
