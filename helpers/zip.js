"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fflate_1 = require("fflate");
const util_1 = require("util");
const zip = (0, util_1.promisify)(fflate_1.zip);
exports.default = zip;
