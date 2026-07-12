import path from "path";
import crypto from "crypto";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { protect, authorize } from "./middleware/auth";
import { asyncHandler } from "./middleware/asyncHandler";
import { sanitizeInput } from "./middleware/sanitize";
import { notFound, errorHandler } from "./middleware/errorHandler";
import { prisma } from "./lib/prisma";

import authRoutes from "./routes/auth.routes";
import admissionRoutes from "./routes/admission.routes";
import studentRoutes from "./routes/student.routes";
import staffRoutes from "./routes/staff.routes";
import noticeRoutes from "./routes/notice.routes";
import resultRoutes from "./routes/result.routes";
import attendanceRoutes from "./routes/attendance.routes";
import staffPortalRoutes from "./routes/staff.portal.routes";
import studentPortalRoutes from "./routes/student.portal.routes";
import exportRoutes from "./routes/export.routes";

const app = express();

// ── Security headers ──────────────────────────────────────
app.use(helmet({
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
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Body parsing ──────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Logging ───────────────────────────────────────────────
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

// ── Input sanitization ────────────────────────────────────
app.use(sanitizeInput);

// ── Static uploads ────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── Rate limiting ─────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const loginLimiter = rateLimit({
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
const cache = new Map<string, { data: any; expires: number }>();

function withCache(key: string, ttlSeconds: number, fetcher: () => Promise<any>) {
  return async (req: Request, res: Response) => {
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
app.get(
  "/api/classes",
  protect,
  asyncHandler(
    withCache("classes", 3600, () =>
      prisma.class.findMany({ orderBy: [{ name: "asc" }, { arm: "asc" }] })
    )
  )
);

app.get(
  "/api/sessions",
  protect,
  asyncHandler(
    withCache("sessions", 3600, () =>
      prisma.academicSession.findMany({ orderBy: { start_date: "desc" } })
    )
  )
);

app.get(
  "/api/terms",
  protect,
  asyncHandler(async (req, res) => {
    const { sessionId } = req.query as { sessionId?: string };
    const cacheKey = `terms_${sessionId || "all"}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) return res.json(cached.data);
    const where = sessionId ? { session_id: sessionId } : {};
    const data = await prisma.term.findMany({ where, orderBy: { start_date: "asc" } });
    cache.set(cacheKey, { data, expires: Date.now() + 3600 * 1000 });
    res.json(data);
  })
);

// Timetables
app.get(
  "/api/timetables",
  protect,
  asyncHandler(async (req, res) => {
    const { classId, termId } = req.query as Record<string, string>;
    const where: any = {};
    if (classId) where.class_id = classId;
    if (termId) where.term_id = termId;
    const data = await prisma.timetable.findMany({
      where,
      include: { class: true, term: true },
      orderBy: { created_at: "desc" },
    });
    res.json({ data });
  })
);

// ── Dashboard stats ───────────────────────────────────────
app.get(
  "/api/stats/dashboard",
  protect,
  authorize("super_admin", "admin"),
  asyncHandler(async (req, res) => {
    const [
      totalStudents,
      totalStaff,
      pendingApplications,
      feesCollected,
      currentSession,
      currentTerm,
    ] = await Promise.all([
      prisma.student.count({ where: { status: "active" } }),
      prisma.staff.count(),
      prisma.admission.count({ where: { status: { in: ["pending", "review"] } } }),
      prisma.payment.aggregate({ where: { status: "success" }, _sum: { amount: true } }),
      prisma.academicSession.findFirst({ where: { is_current: true } }),
      prisma.term.findFirst({ where: { is_current: true }, include: { session: true } }),
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
  })
);

// ── Report cards ──────────────────────────────────────────
app.post(
  "/api/report-cards/compile",
  protect,
  authorize("super_admin", "admin"),
  asyncHandler(async (req, res) => {
    const { studentId, termId, sessionId, classId, teacherRemark, principalRemark } = req.body;

    if (!studentId || !termId || !sessionId || !classId) {
      return res.status(400).json({ message: "studentId, termId, sessionId, classId are required" });
    }

    const results = await prisma.result.findMany({
      where: { student_id: studentId, term_id: termId },
    });
    if (results.length === 0) {
      return res.status(400).json({ message: "No results found for this student this term" });
    }

    const totalScore = results.reduce((sum, r) => sum + Number(r.total_score), 0);
    const average = totalScore / results.length;

    const classResults = await prisma.result.groupBy({
      by: ["student_id"],
      where: { term_id: termId, class_id: classId },
      _sum: { total_score: true },
    });

    const sortedTotals = classResults
      .map((r) => Number(r._sum.total_score || 0))
      .sort((a, b) => b - a);

    const position = sortedTotals.indexOf(totalScore) + 1;
    const classSize = classResults.length;

    const reportCard = await prisma.reportCard.upsert({
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

    await prisma.auditLog.create({
      data: {
        user_id: (req as any).user!.id,
        action: "report_card_published",
        entity: "ReportCard",
        entity_id: reportCard.id,
        details: { studentId, termId, position, average },
      },
    });

    res.json({ message: "Report card compiled and published", reportCard });
  })
);

app.get(
  "/api/report-cards",
  protect,
  authorize("super_admin", "admin"),
  asyncHandler(async (req, res) => {
    const { classId, termId } = req.query as Record<string, string>;
    const where: any = {};
    if (classId) where.class_id = classId;
    if (termId) where.term_id = termId;
    const reportCards = await prisma.reportCard.findMany({
      where,
      include: {
        student: { select: { id: true, first_name: true, last_name: true, student_id: true } },
        term: { select: { name: true } },
      },
      orderBy: { position: "asc" },
    });
    res.json({ data: reportCards });
  })
);

// ── Paystack webhook ──────────────────────────────────────
app.post("/api/payments/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    const signature = req.headers["x-paystack-signature"] as string;
    if (!signature || !env.PAYSTACK_SECRET_KEY) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const hash = crypto
      .createHmac("sha512", env.PAYSTACK_SECRET_KEY)
      .update(req.body)
      .digest("hex");

    if (hash !== signature) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "charge.success") {
      const { reference, amount, customer } = event.data;
      await prisma.payment.updateMany({
        where: { paystack_ref: reference },
        data: {
          status: "success",
          paystack_status: "success",
          paid_at: new Date(),
          amount: amount / 100,
        },
      });
    }

    res.json({ received: true });
  })
);

// ── API routes ────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/staff-portal", staffPortalRoutes);
app.use("/api/student-portal", studentPortalRoutes);
app.use("/api/export", exportRoutes);

// ── Error handling ────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;