import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

export const getStaffDashboard = async (req: AuthRequest, res: Response) => {
  const staff = await prisma.staff.findUnique({
    where: { user_id: req.user!.id },
    include: {
      class: true,
      subject_assignments: {
        include: { subject: true, class: true },
      },
    },
  });

  if (!staff) return res.status(404).json({ message: "Staff profile not found" });

  const currentSession = await prisma.academicSession.findFirst({
    where: { is_current: true },
  });

  const currentTerm = await prisma.term.findFirst({
    where: { is_current: true },
    include: { session: true },
  });

  // Count students in class teacher's class
  const classStudentCount = staff.class_id
    ? await prisma.student.count({
        where: { class_id: staff.class_id, status: "active" },
      })
    : 0;

  // Pending lesson notes
  const pendingLessonNotes = await prisma.lessonNote.count({
    where: { staff_id: staff.id, status: "draft" },
  });

  // Recent notices for staff
  const notices = await prisma.notice.findMany({
    where: {
      is_active: true,
      OR: [{ audience: "all" }, { audience: "staff" }],
    },
    orderBy: { created_at: "desc" },
    take: 5,
  });

  res.json({
    staff,
    currentSession: currentSession?.name || "—",
    currentTerm: currentTerm?.name || "—",
    resultDeadline: currentTerm?.result_deadline || null,
    classStudentCount,
    pendingLessonNotes,
    notices,
  });
};

export const getMyStudents = async (req: AuthRequest, res: Response) => {
  const staff = await prisma.staff.findUnique({
    where: { user_id: req.user!.id },
  });

  if (!staff || !staff.class_id) {
    return res.json({ data: [], message: "Not assigned as class teacher" });
  }

  const students = await prisma.student.findMany({
    where: { class_id: staff.class_id, status: "active" },
    orderBy: { last_name: "asc" },
  });

  res.json({ data: students });
};

export const getLessonNotes = async (req: AuthRequest, res: Response) => {
  const staff = await prisma.staff.findUnique({
    where: { user_id: req.user!.id },
  });
  if (!staff) return res.status(404).json({ message: "Staff not found" });

  const notes = await prisma.lessonNote.findMany({
    where: { staff_id: staff.id },
    include: {
      subject: { select: { name: true } },
      class: { select: { name: true, arm: true } },
    },
    orderBy: { created_at: "desc" },
  });

  res.json({ data: notes });
};

export const createLessonNote = async (req: AuthRequest, res: Response) => {
  const { title, content, subjectId, classId, termId, weekNumber } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "title and content are required" });
  }

  const staff = await prisma.staff.findUnique({
    where: { user_id: req.user!.id },
  });
  if (!staff) return res.status(404).json({ message: "Staff not found" });

  const note = await prisma.lessonNote.create({
    data: {
      staff_id: staff.id,
      title,
      content,
      subject_id: subjectId || null,
      class_id: classId || null,
      term_id: termId || null,
      week_number: weekNumber ? Number(weekNumber) : null,
      status: "draft",
    },
    include: {
      subject: { select: { name: true } },
      class: { select: { name: true, arm: true } },
    },
  });

  res.status(201).json({ message: "Lesson note created", note });
};

export const updateLessonNote = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { title, content, status } = req.body;

  const staff = await prisma.staff.findUnique({ where: { user_id: req.user!.id } });
  if (!staff) return res.status(404).json({ message: "Staff not found" });

  const note = await prisma.lessonNote.findUnique({ where: { id } });
  if (!note || note.staff_id !== staff.id) {
    return res.status(404).json({ message: "Lesson note not found" });
  }

  const updated = await prisma.lessonNote.update({
    where: { id },
    data: {
      title: title ?? note.title,
      content: content ?? note.content,
      status: status ?? note.status,
    },
    include: {
      subject: { select: { name: true } },
      class: { select: { name: true, arm: true } },
    },
  });

  res.json({ message: "Lesson note updated", note: updated });
};

export const getClassStudents = async (req: AuthRequest, res: Response) => {
  const { classId } = req.query as Record<string, string>;

  if (!classId) {
    return res.status(400).json({ message: "classId is required" });
  }

  // Verify this staff member is assigned to teach this class
  const staff = await prisma.staff.findUnique({
    where: { user_id: req.user!.id },
    include: {
      subject_assignments: { select: { class_id: true } },
    },
  });

  if (!staff) return res.status(404).json({ message: "Staff not found" });

  const assignedClassIds = [
    ...staff.subject_assignments.map((a) => a.class_id),
    staff.class_id, // class teacher class
  ].filter(Boolean);

  if (!assignedClassIds.includes(classId)) {
    return res.status(403).json({ message: "You are not assigned to this class" });
  }

  const students = await prisma.student.findMany({
    where: { class_id: classId, status: "active" },
    orderBy: { last_name: "asc" },
  });

  res.json({ data: students, total: students.length });
};