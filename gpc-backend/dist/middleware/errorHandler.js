"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.errorHandler = errorHandler;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
function notFound(req, res) {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}
function errorHandler(err, req, res, next) {
    console.error(err);
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            message: "Validation failed",
            errors: err.issues.map((e) => ({ path: e.path.join("."), message: e.message })),
        });
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            const target = err.meta?.target?.join(", ") || "field";
            return res.status(409).json({ message: `A record with this ${target} already exists.` });
        }
        if (err.code === "P2025") {
            return res.status(404).json({ message: "Record not found." });
        }
        return res.status(400).json({ message: "Database error.", code: err.code });
    }
    if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
        return res.status(401).json({ message: "Token has expired." });
    }
    if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
        return res.status(401).json({ message: "Invalid token." });
    }
    const status = err.statusCode || err.status || 500;
    res.status(status).json({ message: err.message || "Internal server error" });
}
