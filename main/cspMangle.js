"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureCspFrameAncestorsParityWithNotionWebsite = void 0;
const parser_1 = require("csp_evaluator/dist/parser");
function ensureCspFrameAncestorsParityWithNotionWebsite(args) {
    const parsed = new parser_1.CspParser(args.cspHeader);
    const values = parsed.csp.directives["frame-ancestors"];
    if (values && (values.includes("https:") || values.includes("*"))) {
        values.push(`${args.customProtocol}:`);
        return parsed.csp.convertToString().trim();
    }
    return args.cspHeader;
}
exports.ensureCspFrameAncestorsParityWithNotionWebsite = ensureCspFrameAncestorsParityWithNotionWebsite;
