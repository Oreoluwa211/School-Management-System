import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

export const listStaff = async (req: AuthRequest, res: Response) => {
  const { search, department, page = "1", limit = "20" } = req.query as Record<string, string>;

  const where: Prisma.StaffWhereInput = {};
  if (department) where.department = { contains: department, mode: "insensitive" };
  if (search) {
    where.OR = [
      { first_name:  { contains: search, mode: "insensitive" } },
      { last_name:   { contains: search, mode: "insensitive" } },
      { staff_id:    { contains: search, mode: "insensitive" } },
      { email:       { contains: search, mode: "insensitive" } },
      { designation: { contains: search, mode: "insensitive" } },
    ];
  }

  const take = Math.min(Number(limit) || 20, 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [total, data] = await Promise.all([
    prisma.staff.count({ where }),
    prisma.staff.findMany({
      where,
      include: { class: true },
      orderBy: { last_name: "asc" },
      skip,
      take,
    }),
  ]);

  res.json({
    data,
    pagination: { total, page: Number(page) || 1, limit: take, totalPages: Math.ceil(total / take) },
  });
};

export const getStaff = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const staff = await prisma.staff.findUnique({ where: { id },

    include: {
      class: true,
      user: { select: { email: true, is_active: true, last_login: true } },
      subject_assignments: { include: { subject: true, class: true } },
    },
  });
  if (!staff) return res.status(404).json({ message: "Staff not found" });
  res.json(staff);
};

export const createStaff = async (req: AuthRequest, res: Response) => {
  const {
    firstName, lastName, middleName, email, phone,
    gender, dateOfBirth, stateOfOrigin, address,
    qualification, designation, department, dateEmployed,
    isClassTeacher, classId,
  } = req.body;

  if (!firstName || !lastName || !email || !designation) {
    return res.status(400).json({ message: "firstName, lastName, email, and designation are required" });
  }

  const count = await prisma.staff.count();
  const staffId = `GPC/STF/${String(count + 1).padStart(4, "0")}`;

  const tempPassword = `Staff@GPC${new Date().getFullYear()}`;
  const password_hash = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: { email: email.toLowerCase().trim(), password_hash, role: "staff" },
  });

  const staff = await prisma.staff.create({
    data: {
      user_id: user.id,
      staff_id: staffId,
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName || null,
      email: email.toLowerCase().trim(),
      phone: phone || null,
      gender: gender || null,
      date_of_birth: dateOfBirth ? new Date(dateOfBirth) : null,
      state_of_origin: stateOfOrigin || null,
      address: address || null,
      qualification: qualification || null,
      designation,
      department: department || null,
      date_employed: dateEmployed ? new Date(dateEmployed) : new Date(),
      is_class_teacher: isClassTeacher || false,
      class_id: classId || null,
    },
    include: { class: true },
  });

  await prisma.auditLog.create({
    data: {
      user_id: req.user!.id,
      action: "staff_created",
      entity: "Staff",
      entity_id: staff.id,
      details: { staff_id: staffId, email, temp_password: tempPassword },
    },
  });

  res.status(201).json({ message: "Staff created", staff, tempPassword, staffId });
};

export const updateStaff = async (req: AuthRequest, res: Response) => {
  const {
    firstName, lastName, middleName, phone, gender,
    qualification, designation, department,
    isClassTeacher, classId,
  } = req.body;

    const id = req.params.id as string;
    const staff = await prisma.staff.findUnique({ where: { id } });
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    const updated = await prisma.staff.update({ where: { id },

    data: {
      first_name: firstName || staff.first_name,
      last_name: lastName || staff.last_name,
      middle_name: middleName ?? staff.middle_name,
      phone: phone ?? staff.phone,
      gender: gender ?? staff.gender,
      qualification: qualification ?? staff.qualification,
      designation: designation || staff.designation,
      department: department ?? staff.department,
      is_class_teacher: isClassTeacher ?? staff.is_class_teacher,
      class_id: classId ?? staff.class_id,
    },
    include: { class: true },
  });

  res.json({ message: "Staff updated", staff: updated });
};

export const toggleStaffActive = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const staff = await prisma.staff.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!staff) return res.status(404).json({ message: "Staff not found" });

  const newStatus = !staff.user.is_active;
  await prisma.user.update({ where: { id: staff.user_id }, data: { is_active: newStatus } });

  res.json({ message: `Staff account ${newStatus ? "activated" : "deactivated"}`, is_active: newStatus });
};

export const exportStaffCsv = async (req: AuthRequest, res: Response) => {
  const staffList = await prisma.staff.findMany({
    include: { class: true },
    orderBy: { last_name: "asc" },
  });

  const headers = [
    "Staff ID", "First Name", "Last Name", "Email", "Phone",
    "Designation", "Department", "Class Teacher", "Class", "Date Employed",
  ];

  const rows = staffList.map((s) => [
    s.staff_id, s.first_name, s.last_name, s.email, s.phone || "",
    s.designation || "", s.department || "",
    s.is_class_teacher ? "Yes" : "No",
    s.class ? `${s.class.name} ${s.class.arm}` : "",
    s.date_employed ? s.date_employed.toISOString().split("T")[0] : "",
  ]);

  const escape = (val: any) => `"${String(val).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="staff-${Date.now()}.csv"`);
  res.send(csv);
};