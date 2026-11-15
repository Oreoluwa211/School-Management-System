"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadBroadsheet = exports.downloadAcceptanceLetter = exports.downloadReportCard = void 0;
const prisma_1 = require("../lib/prisma");
const pdf_1 = require("../utils/pdf");
// GET /api/export/report-card/:studentId/:termId
const downloadReportCard = async (req, res) => {
    const studentId = req.params.studentId;
    const termId = req.params.termId;
    const [student, term, results, reportCard] = await Promise.all([
        prisma_1.prisma.student.findUnique({
            where: { id: studentId },
            include: {
                class: true,
                session: true,
            },
        }),
        prisma_1.prisma.term.findUnique({
            where: { id: termId },
            include: { session: true },
        }),
        prisma_1.prisma.result.findMany({
            where: {
                student_id: studentId,
                term_id: termId,
            },
            include: { subject: { select: { name: true } } },
            orderBy: { subject: { name: "asc" } },
        }),
        prisma_1.prisma.reportCard.findFirst({
            where: {
                student_id: studentId,
                term_id: termId,
            },
        }),
    ]);
    if (!student)
        return res.status(404).json({ message: "Student not found" });
    if (!term)
        return res.status(404).json({ message: "Term not found" });
    const classTeacherStaff = student.class_id
        ? await prisma_1.prisma.staff.findFirst({
            where: { class_id: student.class_id, is_class_teacher: true },
        })
        : null;
    const classTeacher = classTeacherStaff
        ? `${classTeacherStaff.first_name} ${classTeacherStaff.last_name}`
        : undefined;
    const html = (0, pdf_1.reportCardHTML)({
        student,
        class: student.class,
        term,
        session: term.session,
        results,
        reportCard,
        classTeacher,
    });
    const pdf = await (0, pdf_1.generatePDF)(html);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="report-card-${student.student_id}-${term.name}.pdf"`);
    res.send(pdf);
};
exports.downloadReportCard = downloadReportCard;
// GET /api/export/acceptance-letter/:admissionId
const downloadAcceptanceLetter = async (req, res) => {
    const admissionId = req.params.admissionId;
    const { classAllocated, resumptionDate } = req.query;
    const admission = await prisma_1.prisma.admission.findUnique({
        where: { id: admissionId },
    });
    if (!admission)
        return res.status(404).json({ message: "Admission not found" });
    if (!["approved", "fee_paid", "enrolled"].includes(admission.status)) {
        return res.status(400).json({ message: "Letter only available for approved applications" });
    }
    const session = await prisma_1.prisma.academicSession.findUnique({
        where: { id: admission.session_id },
    });
    const html = (0, pdf_1.acceptanceLetterHTML)({
        admission,
        session,
        classAllocated,
        resumptionDate,
    });
    const pdf = await (0, pdf_1.generatePDF)(html);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="acceptance-letter-${admission.reference_number}.pdf"`);
    res.send(pdf);
};
exports.downloadAcceptanceLetter = downloadAcceptanceLetter;
// GET /api/export/broadsheet/:classId/:termId
const downloadBroadsheet = async (req, res) => {
    const classId = req.params.classId;
    const termId = req.params.termId;
    const [cls, term, students, results] = await Promise.all([
        prisma_1.prisma.class.findUnique({ where: { id: classId } }),
        prisma_1.prisma.term.findUnique({
            where: { id: termId },
            include: { session: true },
        }),
        prisma_1.prisma.student.findMany({
            where: { class_id: classId, status: "active" },
            orderBy: { last_name: "asc" },
        }),
        prisma_1.prisma.result.findMany({
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
    const subjectMap = new Map();
    results.forEach((r) => {
        subjectMap.set(r.subject_id, r.subject.name);
    });
    const subjects = [...subjectMap.entries()].sort((a, b) => a[1].localeCompare(b[1]));
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
            if (result)
                grandTotal += Number(result.total_score);
            return [ca, exam, total];
        })
            .flat();
        const average = subjects.length > 0
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
    const escape = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
        .map((row) => row.map(escape).join(","))
        .join("\n");
    const termSession = term.session;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="broadsheet-${cls.name}${cls.arm}-${term.name}-${termSession?.name || ""}.csv"`);
    res.send(csv);
};
exports.downloadBroadsheet = downloadBroadsheet;
