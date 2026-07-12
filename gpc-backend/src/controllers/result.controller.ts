import { Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

function computeGrade(total: number): { grade: string; remark: string } {
  if (total >= 75) return { grade: "A", remark: "Excellent" };
  if (total >= 65) return { grade: "B", remark: "Very Good" };
  if (total >= 55) return { grade: "C", remark: "Good" };
  if (total >= 45) return { grade: "D", remark: "Pass" };
  if (total >= 40) return { grade: "E", remark: "Fairly Pass" };
  return { grade: "F", remark: "Fail" };
}

// GET /api/results — list results for a class/subject/term
export const listResults = async (req: AuthRequest, res: Response) => {
  const { classId, subjectId, termId, sessionId, studentId } = req.query as Record<string, string>;

  const where: Prisma.ResultWhereInput = {};
  if (classId) where.class_id = classId;
  if (subjectId) where.subject_id = subjectId;
  if (termId) where.term_id = termId;
  if (sessionId) where.session_id = sessionId;
  if (studentId) where.student_id = studentId;

  const results = await prisma.result.findMany({
    where,
    include: {
      student: { select: { id: true, first_name: true, last_name: true, student_id: true } },
      subject: { select: { id: true, name: true } },
      class: { select: { id: true, name: true, arm: true } },
    },
    orderBy: [{ student: { last_name: "asc" } }],
  });

  res.json({ data: results });
};

// POST /api/results/bulk — save/update multiple results at once
export const bulkSaveResults = async (req: AuthRequest, res: Response) => {
  const { classId, subjectId, termId, sessionId, results } = req.body;

  if (!classId || !subjectId || !termId || !sessionId || !Array.isArray(results)) {
    return res.status(400).json({ message: "classId, subjectId, termId, sessionId, and results[] are required" });
  }

  const staff = await prisma.staff.findUnique({ where: { user_id: req.user!.id } });

  const saved = await Promise.all(
    results.map(async ({ studentId, caScore, examScore }: any) => {
      const ca = Math.min(Math.max(Number(caScore) || 0, 0), 40);
      const exam = Math.min(Math.max(Number(examScore) || 0, 0), 60);
      const total = ca + exam;
      const { grade, remark } = computeGrade(total);

      return prisma.result.upsert({
        where: {
          student_id_subject_id_term_id: {
            student_id: studentId,
            subject_id: subjectId,
            term_id: termId,
          },
        },
        update: {
          ca_score: ca,
          exam_score: exam,
          total_score: total,
          grade,
          remark,
          staff_id: staff?.id || null,
        },
        create: {
          student_id: studentId,
          subject_id: subjectId,
          class_id: classId,
          term_id: termId,
          session_id: sessionId,
          ca_score: ca,
          exam_score: exam,
          total_score: total,
          grade,
          remark,
          staff_id: staff?.id || null,
          is_submitted: false,
        },
      });
    })
  );

  res.json({ message: `${saved.length} results saved`, count: saved.length });
};

// PATCH /api/results/:id/submit — submit results for admin review
export const submitResults = async (req: AuthRequest, res: Response) => {
  const { classId, subjectId, termId } = req.body;

  if (!classId || !subjectId || !termId) {
    return res.status(400).json({ message: "classId, subjectId, and termId are required" });
  }

  await prisma.result.updateMany({
    where: { class_id: classId, subject_id: subjectId, term_id: termId, is_submitted: false },
    data: { is_submitted: true, submitted_at: new Date() },
  });

  res.json({ message: "Results submitted successfully" });
};

// GET /api/results/broadsheet — admin broadsheet view
export const getBroadsheet = async (req: AuthRequest, res: Response) => {
  const { classId, termId } = req.query as Record<string, string>;

  if (!classId || !termId) {
    return res.status(400).json({ message: "classId and termId are required" });
  }

  const students = await prisma.student.findMany({
    where: { class_id: classId, status: "active" },
    orderBy: { last_name: "asc" },
  });

  const results = await prisma.result.findMany({
    where: { class_id: classId, term_id: termId },
    include: { subject: { select: { id: true, name: true } } },
  });

  const subjects = [...new Map(results.map((r) => [r.subject_id, r.subject])).values()];

  const broadsheet = students.map((student) => {
    const studentResults = results.filter((r) => r.student_id === student.id);
    const subjectScores: Record<string, any> = {};
    let totalScore = 0;

    subjects.forEach((subject) => {
      const result = studentResults.find((r) => r.subject_id === subject.id);
      subjectScores[subject.name] = result
        ? { ca: Number(result.ca_score), exam: Number(result.exam_score), total: Number(result.total_score), grade: result.grade }
        : { ca: null, exam: null, total: null, grade: null };
      if (result) totalScore += Number(result.total_score);
    });

    return {
      student: { id: student.id, name: `${student.first_name} ${student.last_name}`, student_id: student.student_id },
      scores: subjectScores,
      totalScore,
      average: subjects.length > 0 ? Number((totalScore / subjects.length).toFixed(2)) : 0,
    };
  });

  // Sort by total score descending and add position
  broadsheet.sort((a, b) => b.totalScore - a.totalScore);
  broadsheet.forEach((row, i) => { (row as any).position = i + 1; });

  res.json({ subjects: subjects.map((s) => s.name), broadsheet });
};

// GET /api/results/student/:studentId — full result history for a student
export const getStudentResults = async (req: AuthRequest, res: Response) => {
  const studentId = req.params.studentId as string;
  const { termId } = req.query as Record<string, string>;

  const where: Prisma.ResultWhereInput = { student_id: studentId };
  if (termId) where.term_id = termId;

  const results = await prisma.result.findMany({
    where,
    include: {
      subject: { select: { name: true } },
      term: { select: { name: true } },
    },
    orderBy: { subject: { name: "asc" } },
  });

  const reportCard = await prisma.reportCard.findFirst({
    where: { student_id: studentId, ...(termId ? { term_id: termId } : {}) },
  });

  res.json({ results, reportCard });
};