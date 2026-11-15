"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const auth_1 = require("./middleware/auth");
const asyncHandler_1 = require("./middleware/asyncHandler");
const sanitize_1 = require("./middleware/sanitize");
const errorHandler_1 = require("./middleware/errorHandler");
const prisma_1 = require("./lib/prisma");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admission_routes_1 = __importDefault(require("./routes/admission.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const staff_routes_1 = __importDefault(require("./routes/staff.routes"));
const notice_routes_1 = __importDefault(require("./routes/notice.routes"));
const result_routes_1 = __importDefault(require("./routes/result.routes"));
const attendance_routes_1 = __importDefault(require("./routes/attendance.routes"));
const staff_portal_routes_1 = __importDefault(require("./routes/staff.portal.routes"));
const student_portal_routes_1 = __importDefault(require("./routes/student.portal.routes"));
const export_routes_1 = __importDefault(require("./routes/export.routes"));
const app = (0, express_1.default)();
// ── Security headers ──────────────────────────────────────
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://js.paystack.co"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
            connectSrc: ["'self'", "https://api.paystack.co"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
// ── CORS ──────────────────────────────────────────────────
app.use((0, cors_1.default)({
    origin: env_1.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// ── Body parsing ──────────────────────────────────────────
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// ── Logging ───────────────────────────────────────────────
app.use((0, morgan_1.default)(env_1.env.NODE_ENV === "development" ? "dev" : "combined"));
// ── Input sanitization ────────────────────────────────────
app.use(sanitize_1.sanitizeInput);
// ── Static uploads ────────────────────────────────────────
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// ── Rate limiting ─────────────────────────────────────────
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
});
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts. Please try again later." },
});
app.use("/api", generalLimiter);
// ── Health check ──────────────────────────────────────────
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "GPC API is running", timestamp: new Date() });
});
// ── In-memory cache for slow-changing data ────────────────
const cache = new Map();
function withCache(key, ttlSeconds, fetcher) {
    return async (req, res) => {
        const cached = cache.get(key);
        if (cached && cached.expires > Date.now()) {
            return res.json(cached.data);
        }
        const data = await fetcher();
        cache.set(key, { data, expires: Date.now() + ttlSeconds * 1000 });
        res.json(data);
    };
}
// Cached reference data endpoints
app.get("/api/classes", auth_1.protect, (0, asyncHandler_1.asyncHandler)(withCache("classes", 3600, () => prisma_1.prisma.class.findMany({ orderBy: [{ name: "asc" }, { arm: "asc" }] }))));
app.get("/api/sessions", auth_1.protect, (0, asyncHandler_1.asyncHandler)(withCache("sessions", 3600, () => prisma_1.prisma.academicSession.findMany({ orderBy: { start_date: "desc" } }))));
app.get("/api/terms", auth_1.protect, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { sessionId } = req.query;
    const cacheKey = `terms_${sessionId || "all"}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now())
        return res.json(cached.data);
    const where = sessionId ? { session_id: sessionId } : {};
    const data = await prisma_1.prisma.term.findMany({ where, orderBy: { start_date: "asc" } });
    cache.set(cacheKey, { data, expires: Date.now() + 3600 * 1000 });
    res.json(data);
}));
// Timetables
app.get("/api/timetables", auth_1.protect, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { classId, termId } = req.query;
    const where = {};
    if (classId)
        where.class_id = classId;
    if (termId)
        where.term_id = termId;
    const data = await prisma_1.prisma.timetable.findMany({
        where,
        include: { class: true, term: true },
        orderBy: { created_at: "desc" },
    });
    res.json({ data });
}));
// ── Dashboard stats ───────────────────────────────────────
app.get("/api/stats/dashboard", auth_1.protect, (0, auth_1.authorize)("super_admin", "admin"), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const [totalStudents, totalStaff, pendingApplications, feesCollected, currentSession, currentTerm,] = await Promise.all([
        prisma_1.prisma.student.count({ where: { status: "active" } }),
        prisma_1.prisma.staff.count(),
        prisma_1.prisma.admission.count({ where: { status: { in: ["pending", "review"] } } }),
        prisma_1.prisma.payment.aggregate({ where: { status: "success" }, _sum: { amount: true } }),
        prisma_1.prisma.academicSession.findFirst({ where: { is_current: true } }),
        prisma_1.prisma.term.findFirst({ where: { is_current: true }, include: { session: true } }),
    ]);
    res.json({
        totalStudents,
        totalStaff,
        pendingApplications,
        feesCollected: Number(feesCollected._sum.amount || 0),
        currentSession: currentSession?.name || "—",
        currentTerm: currentTerm?.name || "—",
        resultDeadline: currentTerm?.result_deadline || null,
    });
}));
// ── Report cards ──────────────────────────────────────────
app.post("/api/report-cards/compile", auth_1.protect, (0, auth_1.authorize)("super_admin", "admin"), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { studentId, termId, sessionId, classId, teacherRemark, principalRemark } = req.body;
    if (!studentId || !termId || !sessionId || !classId) {
        return res.status(400).json({ message: "studentId, termId, sessionId, classId are required" });
    }
    const results = await prisma_1.prisma.result.findMany({
        where: { student_id: studentId, term_id: termId },
    });
    if (results.length === 0) {
        return res.status(400).json({ message: "No results found for this student this term" });
    }
    const totalScore = results.reduce((sum, r) => sum + Number(r.total_score), 0);
    const average = totalScore / results.length;
    const classResults = await prisma_1.prisma.result.groupBy({
        by: ["student_id"],
        where: { term_id: termId, class_id: classId },
        _sum: { total_score: true },
    });
    const sortedTotals = classResults
        .map((r) => Number(r._sum.total_score || 0))
        .sort((a, b) => b - a);
    const position = sortedTotals.indexOf(totalScore) + 1;
    const classSize = classResults.length;
    const reportCard = await prisma_1.prisma.reportCard.upsert({
        where: { student_id_term_id: { student_id: studentId, term_id: termId } },
        update: {
            total_score: totalScore, average, position, class_size: classSize,
            teacher_remark: teacherRemark || null, principal_remark: principalRemark || null,
            is_published: true, published_at: new Date(),
            session_id: sessionId, class_id: classId,
        },
        create: {
            student_id: studentId, term_id: termId, session_id: sessionId, class_id: classId,
            total_score: totalScore, average, position, class_size: classSize,
            teacher_remark: teacherRemark || null, principal_remark: principalRemark || null,
            is_published: true, published_at: new Date(),
        },
    });
    await prisma_1.prisma.auditLog.create({
        data: {
            user_id: req.user.id,
            action: "report_card_published",
            entity: "ReportCard",
            entity_id: reportCard.id,
            details: { studentId, termId, position, average },
        },
    });
    res.json({ message: "Report card compiled and published", reportCard });
}));
app.get("/api/report-cards", auth_1.protect, (0, auth_1.authorize)("super_admin", "admin"), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { classId, termId } = req.query;
    const where = {};
    if (classId)
        where.class_id = classId;
    if (termId)
        where.term_id = termId;
    const reportCards = await prisma_1.prisma.reportCard.findMany({
        where,
        include: {
            student: { select: { id: true, first_name: true, last_name: true, student_id: true } },
            term: { select: { name: true } },
        },
        orderBy: { position: "asc" },
    });
    res.json({ data: reportCards });
}));
// ── Paystack webhook ──────────────────────────────────────
// Payments list + summary
app.get("/api/payments", auth_1.protect, (0, auth_1.authorize)("super_admin", "admin"), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { status, type, page = "1", limit = "20" } = req.query;
    const where = {};
    if (status)
        where.status = status;
    if (type)
        where.payment_type = type;
    const take = Math.min(Number(limit) || 20, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
    const [total, data, successSum, pendingSum] = await Promise.all([
        prisma_1.prisma.payment.count({ where }),
        prisma_1.prisma.payment.findMany({
            where,
            include: {
                student: { select: { id: true, first_name: true, last_name: true, student_id: true } },
                admission: { select: { id: true, first_name: true, last_name: true } },
            },
            orderBy: { created_at: "desc" },
            skip,
            take,
        }),
        prisma_1.prisma.payment.aggregate({ where: { status: "success" }, _sum: { amount: true } }),
        prisma_1.prisma.payment.aggregate({ where: { status: "pending" }, _sum: { amount: true } }),
    ]);
    res.json({
        data,
        pagination: { total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) },
        summary: {
            totalSuccess: Number(successSum._sum.amount || 0),
            totalPending: Number(pendingSum._sum.amount || 0),
            totalCount: total,
        },
    });
}));
// Payments CSV export
app.get("/api/payments/export", auth_1.protect, (0, auth_1.authorize)("super_admin", "admin"), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const payments = await prisma_1.prisma.payment.findMany({
        include: {
            student: { select: { first_name: true, last_name: true, student_id: true } },
        },
        orderBy: { created_at: "desc" },
    });
    const headers = ["Student Name", "Student ID", "Reference", "Type", "Amount", "Status", "Date"];
    const rows = payments.map((p) => [
        p.student ? `${p.student.first_name} ${p.student.last_name}` : "—",
        p.student?.student_id || "—",
        p.paystack_ref || "—",
        p.payment_type,
        Number(p.amount),
        p.status,
        (p.paid_at || p.created_at).toISOString().split("T")[0],
    ]);
    const escape = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="payments-${Date.now()}.csv"`);
    res.send(csv);
}));
// ── API routes ────────────────────────────────────────────
app.use("/api/auth", auth_routes_1.default);
app.use("/api/admissions", admission_routes_1.default);
app.use("/api/students", student_routes_1.default);
app.use("/api/staff", staff_routes_1.default);
app.use("/api/notices", notice_routes_1.default);
app.use("/api/results", result_routes_1.default);
app.use("/api/attendance", attendance_routes_1.default);
app.use("/api/staff-portal", staff_portal_routes_1.default);
app.use("/api/student-portal", student_portal_routes_1.default);
app.use("/api/export", export_routes_1.default);
// ── Error handling ────────────────────────────────────────
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
exports.default = app;
