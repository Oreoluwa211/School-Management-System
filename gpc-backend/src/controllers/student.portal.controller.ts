import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

export const getStudentDashboard = async (req: AuthRequest, res: Response) => {
  const student = await prisma.student.findUnique({
    where: { user_id: req.user!.id },
    include: {
      class: true,
      session: true,
    },
  });

  if (!student) return res.status(404).json({ message: "Student profile not found" });

  const currentTerm = await prisma.term.findFirst({
    where: { is_current: true },
    include: { session: true },
  });

  // Attendance summary for current term
  const attendance = currentTerm
    ? await prisma.attendance.findMany({
        where: { student_id: student.id, term_id: currentTerm.id },
      })
    : [];

  const totalDays = attendance.length;
  const presentDays = attendance.filter((a) => a.status === "present" || a.status === "late").length;
  const attendancePercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // Latest results
  const results = currentTerm
    ? await prisma.result.findMany({
        where: { student_id: student.id, term_id: currentTerm.id },
        include: { subject: { select: { name: true } } },
        orderBy: { total_score: "desc" },
        take: 5,
      })
    : [];

  // Notices for students
  const notices = await prisma.notice.findMany({
    where: {
      is_active: true,
      OR: [
        { audience: "all" },
        { audience: "students" },
        { audience: "class", class_id: student.class_id },
      ],
    },
    orderBy: [{ pin_until: "desc" }, { created_at: "desc" }],
    take: 5,
  });

  // Report card for current term
  const reportCard = currentTerm
    ? await prisma.reportCard.findFirst({
        where: { student_id: student.id, term_id: currentTerm.id },
      })
    : null;

  res.json({
    student,
    currentTerm: currentTerm?.name || "—",
    currentSession: currentTerm?.session?.name || "—",
    resultDeadline: currentTerm?.result_deadline || null,
    attendance: {
      total: totalDays,
      present: presentDays,
      percent: attendancePercent,
    },
    recentResults: results,
    notices,
    reportCard,
  });
};

export const getMyResults = async (req: AuthRequest, res: Response) => {
  const student = await prisma.student.findUnique({
    where: { user_id: req.user!.id },
  });
  if (!student) return res.status(404).json({ message: "Student not found" });

  const { termId } = req.query as Record<string, string>;

  const currentTerm = await prisma.term.findFirst({ where: { is_current: true } });
  const resolvedTermId = termId || currentTerm?.id;

  const results = resolvedTermId
    ? await prisma.result.findMany({
        where: { student_id: student.id, term_id: resolvedTermId },
        include: { subject: { select: { name: true } } },
        orderBy: { subject: { name: "asc" } },
      })
    : [];

  const reportCard = resolvedTermId
    ? await prisma.reportCard.findFirst({
        where: { student_id: student.id, term_id: resolvedTermId },
      })
    : null;

  const terms = await prisma.term.findMany({
    where: { session_id: student.session_id },
    orderBy: { start_date: "asc" },
  });

  res.json({ results, reportCard, terms, currentTermId: resolvedTermId });
};

export const getMyAttendance = async (req: AuthRequest, res: Response) => {
  const student = await prisma.student.findUnique({
    where: { user_id: req.user!.id },
  });
  if (!student) return res.status(404).json({ message: "Student not found" });

  const { termId } = req.query as Record<string, string>;
  const currentTerm = await prisma.term.findFirst({ where: { is_current: true } });
  const resolvedTermId = termId || currentTerm?.id;

  const records = resolvedTermId
    ? await prisma.attendance.findMany({
        where: { student_id: student.id, term_id: resolvedTermId },
        orderBy: { date: "asc" },
      })
    : [];

  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;
  const excused = records.filter((r) => r.status === "excused").length;
  const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  const terms = await prisma.term.findMany({
    where: { session_id: student.session_id },
    orderBy: { start_date: "asc" },
  });

  res.json({
    records,
    summary: { total, present, absent, late, excused, percentage },
    terms,
    currentTermId: resolvedTermId,
  });
};

export const getMyNotices = async (req: AuthRequest, res: Response) => {
  const student = await prisma.student.findUnique({
    where: { user_id: req.user!.id },
  });
  if (!student) return res.status(404).json({ message: "Student not found" });

  const notices = await prisma.notice.findMany({
    where: {
      is_active: true,
      OR: [
        { audience: "all" },
        { audience: "students" },
        { audience: "class", class_id: student.class_id },
      ],
    },
    orderBy: [{ pin_until: "desc" }, { created_at: "desc" }],
  });

  res.json({ data: notices });
};

export const getELibrary = async (req: AuthRequest, res: Response) => {
  const { type, subjectId } = req.query as Record<string, string>;

  const where: any = { is_active: true };
  if (type) where.resource_type = type;
  if (subjectId) where.subject_id = subjectId;

  const [resources, subjects] = await Promise.all([
    prisma.libraryResource.findMany({
      where,
      include: { subject: { select: { name: true } } },
      orderBy: { created_at: "desc" },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ]);

  res.json({ data: resources, subjects });
};

export const getMyFees = async (req: AuthRequest, res: Response) => {
  const student = await prisma.student.findUnique({
    where: { user_id: req.user!.id },
    include: { class: true, session: true },
  });
  if (!student) return res.status(404).json({ message: "Student not found" });

  const payments = await prisma.payment.findMany({
    where: { student_id: student.id },
    include: { term: { select: { name: true } } },
    orderBy: { created_at: "desc" },
  });

  const feeSchedule = await prisma.feeSchedule.findFirst({
    where: { class_level: student.class.level },
    include: { term: true },
  });

  const totalPaid = payments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const sessionFee = feeSchedule ? Number(feeSchedule.amount) * 3 : 0;
  const outstanding = Math.max(0, sessionFee - totalPaid);

  res.json({
    payments,
    totalPaid,
    sessionFee,
    outstanding,
    feeSchedule,
    student,
  });
};