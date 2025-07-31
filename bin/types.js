"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERole = exports.examplesSchema = void 0;
exports.examplesSchema = {
    type: "array",
    items: {
        type: "object",
        required: ["fileName", "code", "tests"],
        properties: {
            fileName: {
                type: "string",
            },
            code: {
                type: "string",
            },
            tests: {
                type: "string",
            },
        },
    },
};
var ERole;
(function (ERole) {
    ERole["User"] = "user";
    ERole["System"] = "system";
    ERole["Assistant"] = "assistant";
})(ERole || (exports.ERole = ERole = {}));
//# sourceMappingURL=types.js.map