"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const cspMangle_1 = require("./cspMangle");
const assert_typed_1 = require("@notionhq/test-framework/assert-typed");
function assertCspIsUnmodified(cspHeader) {
    (0, assert_typed_1.assertDeepEqualTyped)((0, cspMangle_1.ensureCspFrameAncestorsParityWithNotionWebsite)({
        cspHeader,
        customProtocol: "dank",
    }), cspHeader);
}
(0, globals_1.describe)("ensureCspFrameAncestorsParityWithNotionWebsite", () => {
    (0, globals_1.it)("returns CSP headers unmodified if necessary", () => {
        assertCspIsUnmodified("frame-ancestors 'none'");
        assertCspIsUnmodified("script-src https:; default-src https: data:");
    });
    (0, globals_1.it)("does not explode on weird/invalid CSP values", () => {
        assertCspIsUnmodified("");
        assertCspIsUnmodified("zzz");
    });
    (0, globals_1.it)("adds our custom protocol if needed", () => {
        (0, assert_typed_1.assertDeepEqualTyped)((0, cspMangle_1.ensureCspFrameAncestorsParityWithNotionWebsite)({
            cspHeader: "report-uri https://blah/v1/http/ZaVnC4== ; default-src https: data: blob: 'unsafe-eval' 'unsafe-inline' ; frame-ancestors http://localhost:* capacitor: ionic: https:;",
            customProtocol: "dank",
        }), "report-uri https://blah/v1/http/ZaVnC4==; default-src https: data: blob: 'unsafe-eval' 'unsafe-inline'; frame-ancestors http://localhost:* capacitor: ionic: https: dank:;");
    });
});
