"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = protect;
exports.authorize = authorize;
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../lib/prisma");
async function protect(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized, no token provided" });
    }
    const token = header.split(" ")[1];
    try {
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || !user.is_active) {
            return res.status(401).json({ message: "Not authorized, user not found or inactive" });
        }
        req.user = { id: user.id, role: user.role, email: user.email };
        next();
    }
    catch {
        return res.status(401).json({ message: "Not authorized, invalid or expired token" });
    }
}
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: insufficient permissions" });
        }
        next();
    };
}
