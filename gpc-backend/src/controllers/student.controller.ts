import { Request, Response } from "express";
import { Prisma, StudentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

// ── List students ──────────────────────────────────────────
export const listStudents = async (req: AuthRequest, res: Response) => {
  const {
    search, status, classId,
    page = "1", limit = "20",
  } = req.query as Record<string, string>;

  const where: Prisma.StudentWhereInput = {};
  if (status) where.status = status as StudentStatus;
  if (classId) where.class_id = classId;
  if (search) {
    where.OR = [
      { first_name: { contains: search, mode: "insensitive" } },
      { last_name:  { contains: search, mode: "insensitive" } },
      { student_id: { contains: search, mode: "insensitive" } },
      { email:      { contains: search, mode: "insensitive" } },
    ];
  }

  const take = Math.min(Number(limit) || 20, 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [total, data] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.findMany({
      where,
      include: { class: true },
      orderBy: { created_at: "desc" },
      skip,
      take,
    }),
  ]);

  res.json({
    data,
    pagination: {
      total,
      page: Number(page) || 1,
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  });
};

// ── Get single student ─────────────────────────────────────
export const getStudent = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const student = await prisma.student.findUnique({
    where: { id },
    include: { class: true, user: { select: { email: true, is_active: true } } },
  });
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json(student);
};

// ── Enroll student from admission ──────────────────────────
export const enrollStudent = async (req: AuthRequest, res: Response) => {
  const { admissionId, classId, sessionId } = req.body;

  if (!admissionId || !classId || !sessionId) {
    return res.status(400).json({ message: "admissionId, classId, and sessionId are required" });
  }

  const admission = await prisma.admission.findUnique({ where: { id: admissionId } });
  if (!admission) return res.status(404).json({ message: "Admission not found" });
  if (!["approved", "fee_paid"].includes(admission.status)) {
    return res.status(400).json({ message: "Admission must be approved or fee_paid to enroll" });
  }

  // Generate student ID: GPC/YYYY/NNNNN
  const year = new Date().getFullYear();
  const count = await prisma.student.count();
  const studentId = `GPC/${year}/${String(count + 1).padStart(5, "0")}`;

  // Create portal user account
  const tempPassword = `GPC@${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const password_hash = await bcrypt.hash(tempPassword, 10);

  const portalEmail = `${admission.first_name.toLowerCase()}.${admission.last_name.toLowerCase()}@students.goodnewscollege.edu.ng`;

  const user = await prisma.user.create({
    data: { email: portalEmail, password_hash, role: "student" },
  });

  const student = await prisma.student.create({
    data: {
      user_id: user.id,
      admission_id: admission.id,
      student_id: studentId,
      first_name: admission.first_name,
      last_name: admission.last_name,
      middle_name: admission.middle_name,
      email: portalEmail,
      date_of_birth: admission.date_of_birth,
      gender: admission.gender,
      religion: admission.religion,
      state_of_origin: admission.state_of_origin,
      lga: admission.lga,
      address: admission.address,
      medical_notes: admission.medical_notes,
      boarding_type: admission.boarding_type,
      father_name: admission.father_name,
      father_phone: admission.father_phone,
      father_email: admission.father_email,
      mother_name: admission.mother_name,
      mother_phone: admission.mother_phone,
      emergency_name: admission.emergency_name,
      emergency_phone: admission.emergency_phone,
      class_id: classId,
      session_id: sessionId,
      status: "active",
    },
    include: { class: true },
  });

  // Mark admission as enrolled
  await prisma.admission.update({
    where: { id: admissionId },
    data: { status: "enrolled", reviewed_by: req.user!.id, reviewed_at: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      user_id: req.user!.id,
      action: "student_enrolled",
      entity: "Student",
      entity_id: student.id,
      details: { student_id: studentId, portal_email: portalEmail, temp_password: tempPassword },
    },
  });

  res.status(201).json({
    message: "Student enrolled successfully",
    student,
    portalEmail,
    tempPassword,
    studentId,
  });
};

// ── Create student directly (without admission) ────────────
export const createStudent = async (req: AuthRequest, res: Response) => {
  const {
    firstName, lastName, middleName, gender, dateOfBirth,
    classId, sessionId, boardingType, phone, religion,
    stateOfOrigin, address, fatherName, fatherPhone,
    motherName, motherPhone, emergencyName, emergencyPhone,
  } = req.body;

  if (!firstName || !lastName || !classId || !sessionId || !gender) {
    return res.status(400).json({ message: "firstName, lastName, classId, sessionId and gender are required" });
  }

  const year = new Date().getFullYear();
  const count = await prisma.student.count();
  const studentId = `GPC/${year}/${String(count + 1).padStart(5, "0")}`;

  const portalEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${count + 1}@students.goodnewscollege.edu.ng`;
  const tempPassword = `GPC@${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const password_hash = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: { email: portalEmail, password_hash, role: "student" },
  });

  const student = await prisma.student.create({
    data: {
      user_id: user.id,
      student_id: studentId,
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName || null,
      email: portalEmail,
      gender,
      date_of_birth: dateOfBirth ? new Date(dateOfBirth) : null,
      religion: religion || null,
      state_of_origin: stateOfOrigin || null,
      address: address || null,
      boarding_type: boardingType || null,
      father_name: fatherName || null,
      father_phone: fatherPhone || null,
      mother_name: motherName || null,
      mother_phone: motherPhone || null,
      emergency_name: emergencyName || null,
      emergency_phone: emergencyPhone || null,
      class_id: classId,
      session_id: sessionId,
      status: "active",
    },
    include: { class: true },
  });

  res.status(201).json({ message: "Student created", student, portalEmail, tempPassword, studentId });
};

// ── Update student status ──────────────────────────────────
export const updateStudentStatus = async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const validStatuses = ["active", "graduated", "transferred", "suspended", "withdrawn"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }

  const id = req.params.id as string;
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return res.status(404).json({ message: "Student not found" });

  const updated = await prisma.student.update({
    where: { id },
    data: { status: status as StudentStatus },
    include: { class: true },
  });

  await prisma.auditLog.create({
    data: {
      user_id: req.user!.id,
      action: "student_status_updated",
      entity: "Student",
      entity_id: student.id,
      details: { previous: student.status, new: status },
    },
  });

  res.json({ message: "Student status updated", student: updated });
};

// ── Export students CSV ────────────────────────────────────
export const exportStudentsCsv = async (req: AuthRequest, res: Response) => {
  const students = await prisma.student.findMany({
    include: { class: true },
    orderBy: [{ class: { name: "asc" } }, { last_name: "asc" }],
  });

  const headers = [
    "Student ID", "First Name", "Last Name", "Gender", "Class",
    "Boarding Type", "Father Name", "Father Phone", "Email", "Status",
  ];

  const rows = students.map((s) => [
    s.student_id, s.first_name, s.last_name, s.gender || "",
    `${s.class.name} ${s.class.arm}`, s.boarding_type || "",
    s.father_name || "", s.father_phone || "", s.email || "", s.status,
  ]);

  const escape = (val: any) => `"${String(val).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="students-${Date.now()}.csv"`);
  res.send(csv);
};