import { Response } from "express";
import { prisma } from "../lib/prisma";
import { generatePDF, reportCardHTML, acceptanceLetterHTML } from "../utils/pdf";
import { AuthRequest } from "../middleware/auth";

// GET /api/export/report-card/:studentId/:termId
export const downloadReportCard = async (req: AuthRequest, res: Response) => {
  const studentId = req.params.studentId as string;
  const termId = req.params.termId as string;

  const [student, term, results, reportCard] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: true,
        session: true,
      },
    }),
    prisma.term.findUnique({
      where: { id: termId },
      include: { session: true },
    }),
    prisma.result.findMany({
      where: {
        student_id: studentId,
        term_id: termId,
      },
      include: { subject: { select: { name: true } } },
      orderBy: { subject: { name: "asc" } },
    }),
    prisma.reportCard.findFirst({
      where: {
        student_id: studentId,
        term_id: termId,
      },
    }),
  ]);

  if (!student) return res.status(404).json({ message: "Student not found" });
  if (!term) return res.status(404).json({ message: "Term not found" });

  const classTeacherStaff = student.class_id
    ? await prisma.staff.findFirst({
        where: { class_id: student.class_id, is_class_teacher: true },
      })
    : null;

  const classTeacher = classTeacherStaff
    ? `${classTeacherStaff.first_name} ${classTeacherStaff.last_name}`
    : undefined;

  const html = reportCardHTML({
    student,
    class: student.class,
    term,
    session: (term as any).session,
    results,
    reportCard,
    classTeacher,
  });

  const pdf = await generatePDF(html);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="report-card-${student.student_id}-${term.name}.pdf"`
  );
  res.send(pdf);
};

// GET /api/export/acceptance-letter/:admissionId
export const downloadAcceptanceLetter = async (req: AuthRequest, res: Response) => {
  const admissionId = req.params.admissionId as string;
  const { classAllocated, resumptionDate } = req.query as Record<string, string>;

  const admission = await prisma.admission.findUnique({
    where: { id: admissionId },
  });
  if (!admission) return res.status(404).json({ message: "Admission not found" });

  if (!["approved", "fee_paid", "enrolled"].includes(admission.status)) {
    return res.status(400).json({ message: "Letter only available for approved applications" });
  }

  const session = await prisma.academicSession.findUnique({
    where: { id: admission.session_id },
  });

  const html = acceptanceLetterHTML({
    admission,
    session,
    classAllocated,
    resumptionDate,
  });

  const pdf = await generatePDF(html);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="acceptance-letter-${admission.reference_number}.pdf"`
  );
  res.send(pdf);
};

// GET /api/export/broadsheet/:classId/:termId
export const downloadBroadsheet = async (req: AuthRequest, res: Response) => {
  const classId = req.params.classId as string;
  const termId = req.params.termId as string;

  const [cls, term, students, results] = await Promise.all([
    prisma.class.findUnique({ where: { id: classId } }),
    prisma.term.findUnique({
      where: { id: termId },
      include: { session: true },
    }),
    prisma.student.findMany({
      where: { class_id: classId, status: "active" },
      orderBy: { last_name: "asc" },
    }),
    prisma.result.findMany({
      where: { class_id: classId, term_id: termId },
      include: {
        subject: { select: { id: true, name: true } },
      },
    }),
  ]);

  if (!cls || !term) {
    return res.status(404).json({ message: "Class or term not found" });
  }

  // Get unique subjects from results
  const subjectMap = new Map<string, string>();
  results.forEach((r) => {
    subjectMap.set(r.subject_id, r.subject.name);
  });
  const subjects = [...subjectMap.entries()].sort((a, b) =>
    a[1].localeCompare(b[1])
  );

  // Build broadsheet rows
  const rows = students.map((student, index) => {
    const studentResults = results.filter((r) => r.student_id === student.id);
    let grandTotal = 0;

    const subjectCols = subjects
      .map(([subjectId]) => {
        const result = studentResults.find((r) => r.subject_id === subjectId);
        const ca = result ? Number(result.ca_score) : "";
        const exam = result ? Number(result.exam_score) : "";
        const total = result ? Number(result.total_score) : "";
        if (result) grandTotal += Number(result.total_score);
        return [ca, exam, total];
      })
      .flat();

    const average =
      subjects.length > 0
        ? (grandTotal / subjects.length).toFixed(1)
        : "";

    return [
      index + 1,
      `${student.first_name} ${student.last_name}`,
      student.student_id,
      ...subjectCols,
      grandTotal,
      average,
    ];
  });

  // Sort by grand total descending and add position
  rows.sort((a, b) => Number(b[b.length - 2]) - Number(a[a.length - 2]));
  rows.forEach((row, i) => row.push(i + 1));

  // Build CSV headers
  const subjectHeaders = subjects.flatMap(([, name]) => [
    `${name} CA`,
    `${name} Exam`,
    `${name} Total`,
  ]);
  const headers = [
    "S/N",
    "Student Name",
    "Student ID",
    ...subjectHeaders,
    "Grand Total",
    "Average",
    "Position",
  ];

  const escape = (val: any) =>
    `"${String(val ?? "").replace(/"/g, '""')}"`;
  const csv = [headers, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\n");

  const termSession = (term as any).session;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="broadsheet-${cls.name}${cls.arm}-${term.name}-${termSession?.name || ""}.csv"`
  );
  res.send(csv);
};