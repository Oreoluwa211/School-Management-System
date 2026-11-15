"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentAttendance = exports.recordAttendance = exports.getAttendance = void 0;
const prisma_1 = require("../lib/prisma");
const getAttendance = async (req, res) => {
    const { classId, termId, date, studentId } = req.query;
    const where = {};
    if (classId)
        where.class_id = classId;
    if (termId)
        where.term_id = termId;
    if (studentId)
        where.student_id = studentId;
    if (date)
        where.date = new Date(date);
    const records = await prisma_1.prisma.attendance.findMany({
        where,
        include: {
            student: {
                select: { id: true, first_name: true, last_name: true, student_id: true },
            },
        },
        orderBy: [{ date: "desc" }, { student: { last_name: "asc" } }],
    });
    res.json({ data: records });
};
exports.getAttendance = getAttendance;
const recordAttendance = async (req, res) => {
    const { classId, termId, date, records } = req.body;
    if (!classId || !termId || !date || !Array.isArray(records)) {
        return res.status(400).json({ message: "classId, termId, date, and records[] are required" });
    }
    const staff = await prisma_1.prisma.staff.findUnique({ where: { user_id: req.user.id } });
    if (!staff)
        return res.status(404).json({ message: "Staff not found" });
    const attendanceDate = new Date(date);
    // Upsert each attendance record
    const results = await Promise.all(records.map(({ studentId, status, notes }) => prisma_1.prisma.attendance.upsert({
        where: { student_id_date: { student_id: studentId, date: attendanceDate } },
        update: { status, notes: notes || null, recorded_by: staff.id },
        create: {
            student_id: studentId,
            class_id: classId,
            term_id: termId,
            date: attendanceDate,
            status,
            notes: notes || null,
            recorded_by: staff.id,
        },
    })));
    res.json({ message: `Attendance recorded for ${results.length} students`, count: results.length });
};
exports.recordAttendance = recordAttendance;
const getStudentAttendance = async (req, res) => {
    const studentId = req.params.studentId;
    const { termId } = req.query;
    const where = { student_id: studentId };
    if (termId)
        where.term_id = termId;
    const records = await prisma_1.prisma.attendance.findMany({
        where,
        include: { term: { select: { name: true } } },
        orderBy: { date: "asc" },
    });
    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    const excused = records.filter((r) => r.status === "excused").length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    res.json({
        records,
        summary: { total, present, absent, late, excused, percentage },
    });
};
exports.getStudentAttendance = getStudentAttendance;
