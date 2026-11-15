"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.changePassword = exports.me = exports.logout = exports.refresh = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const jwt_1 = require("../utils/jwt");
const email_1 = require("../utils/email");
const env_1 = require("../config/env");
const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
function getRedirectPath(role) {
    if (role === "super_admin" || role === "admin")
        return "/admin/dashboard";
    if (role === "staff")
        return "/staff/dashboard";
    return "/student/dashboard";
}
async function getProfile(userId, role) {
    if (role === "staff")
        return prisma_1.prisma.staff.findUnique({ where: { user_id: userId } });
    if (role === "student")
        return prisma_1.prisma.student.findUnique({ where: { user_id: userId } });
    return null;
}
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    if (!user || !user.is_active) {
        return res.status(401).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.password_hash);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }
    const accessToken = (0, jwt_1.signAccessToken)({ userId: user.id, role: user.role });
    const refreshToken = (0, jwt_1.signRefreshToken)({ userId: user.id });
    await prisma_1.prisma.refreshToken.create({
        data: {
            user_id: user.id,
            token: refreshToken,
            expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
        },
    });
    await prisma_1.prisma.user.update({ where: { id: user.id }, data: { last_login: new Date() } });
    const profile = await getProfile(user.id, user.role);
    res.json({
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, role: user.role, profile },
        redirectTo: getRedirectPath(user.role),
    });
};
exports.login = login;
const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken)
        return res.status(400).json({ message: "Refresh token is required" });
    const stored = await prisma_1.prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expires_at < new Date()) {
        if (stored)
            await prisma_1.prisma.refreshToken.delete({ where: { id: stored.id } });
        return res.status(401).json({ message: "Refresh token invalid or expired" });
    }
    let decoded;
    try {
        decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
    }
    catch {
        await prisma_1.prisma.refreshToken.delete({ where: { id: stored.id } });
        return res.status(401).json({ message: "Refresh token invalid or expired" });
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.is_active) {
        return res.status(401).json({ message: "User not found or inactive" });
    }
    // Rotate tokens
    const newAccessToken = (0, jwt_1.signAccessToken)({ userId: user.id, role: user.role });
    const newRefreshToken = (0, jwt_1.signRefreshToken)({ userId: user.id });
    await prisma_1.prisma.refreshToken.delete({ where: { id: stored.id } });
    await prisma_1.prisma.refreshToken.create({
        data: {
            user_id: user.id,
            token: newRefreshToken,
            expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
        },
    });
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
};
exports.refresh = refresh;
const logout = async (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
        await prisma_1.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.json({ message: "Logged out successfully" });
};
exports.logout = logout;
const me = async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user)
        return res.status(404).json({ message: "User not found" });
    const profile = await getProfile(user.id, user.role);
    res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        last_login: user.last_login,
        profile,
    });
};
exports.me = me;
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user)
        return res.status(404).json({ message: "User not found" });
    const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
    if (!isMatch)
        return res.status(401).json({ message: "Current password is incorrect" });
    const password_hash = await bcryptjs_1.default.hash(newPassword, 10);
    await prisma_1.prisma.user.update({ where: { id: user.id }, data: { password_hash } });
    // Invalidate all existing sessions
    await prisma_1.prisma.refreshToken.deleteMany({ where: { user_id: user.id } });
    res.json({ message: "Password changed successfully. Please log in again." });
};
exports.changePassword = changePassword;
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email)
        return res.status(400).json({ message: "Email is required" });
    const user = await prisma_1.prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    // Always respond the same way to avoid leaking which emails exist
    const genericResponse = { message: "If an account with that email exists, a reset link has been sent." };
    if (!user)
        return res.json(genericResponse);
    const resetToken = jsonwebtoken_1.default.sign({ userId: user.id, type: "password_reset" }, env_1.env.JWT_ACCESS_SECRET, {
        expiresIn: "15m",
    });
    await (0, email_1.sendPasswordResetEmail)(user.email, resetToken);
    res.json(genericResponse);
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
    }
    catch {
        return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }
    if (decoded.type !== "password_reset") {
        return res.status(400).json({ message: "Invalid reset token" });
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user)
        return res.status(404).json({ message: "User not found" });
    const password_hash = await bcryptjs_1.default.hash(newPassword, 10);
    await prisma_1.prisma.user.update({ where: { id: user.id }, data: { password_hash } });
    await prisma_1.prisma.refreshToken.deleteMany({ where: { user_id: user.id } });
    res.json({ message: "Password reset successfully. You can now log in with your new password." });
};
exports.resetPassword = resetPassword;
