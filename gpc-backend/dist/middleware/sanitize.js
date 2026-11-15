"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = sanitizeInput;
const xss_1 = __importDefault(require("xss"));
function sanitizeValue(value) {
    if (typeof value === "string")
        return (0, xss_1.default)(value.trim());
    if (Array.isArray(value))
        return value.map(sanitizeValue);
    if (value !== null && typeof value === "object") {
        const sanitized = {};
        for (const key of Object.keys(value)) {
            sanitized[key] = sanitizeValue(value[key]);
        }
        return sanitized;
    }
    return value;
}
function sanitizeInput(req, res, next) {
    if (req.body)
        req.body = sanitizeValue(req.body);
    // req.query is read-only in newer Node — sanitize values in place instead
    if (req.query) {
        Object.keys(req.query).forEach((key) => {
            const val = req.query[key];
            if (typeof val === "string") {
                req.query[key] = (0, xss_1.default)(val.trim());
            }
        });
    }
    if (req.params)
        req.params = sanitizeValue(req.params);
    next();
}
