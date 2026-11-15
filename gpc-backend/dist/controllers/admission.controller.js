"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAdmissionsCsv = exports.updateAdmissionStatus = exports.getAdmission = exports.listAdmissions = exports.trackAdmission = exports.createAdmission = void 0;
const prisma_1 = require("../lib/prisma");
const reference_1 = require("../utils/reference");
const email_1 = require("../utils/email");
function fileUrl(req, file) {
    if (!file)
        return null;
    return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
}
const createAdmission = async (req, res) => {
    const body = req.body;
    const files = req.files;
    const requiredFields = [
        "firstName", "lastName", "dob", "gender", "address",
        "classApplying", "boardingType",
        "fatherName", "fatherPhone", "fatherEmail",
        "emergencyName", "emergencyPhone",
    ];
    for (const field of requiredFields) {
        if (!body[field])
            return res.status(400).json({ message: `${field} is required` });
    }
    const requiredDocs = ["passport", "birthCert", "medicalReport", "academicReport"];
    for (const doc of requiredDocs) {
        if (!files?.[doc]?.[0])
            return res.status(400).json({ message: `${doc} document is required` });
    }
    const session = await prisma_1.prisma.academicSession.findFirst({ where: { is_current: true } });
    if (!session)
        return res.status(500).json({ message: "No active academic session configured" });
    const reference_number = await (0, reference_1.generateReferenceNumber)();
    const admission = await prisma_1.prisma.admission.create({
        data: {
            reference_number,
            first_name: body.firstName,
            middle_name: body.middleName || null,
            last_name: body.lastName,
            date_of_birth: new Date(body.dob),
            gender: body.gender,
            religion: body.religion || null,
            state_of_origin: body.state || null,
            lga: body.lga || null,
            address: body.address,
            medical_notes: body.medicalNotes || null,
            class_applying_for: body.classApplying,
            boarding_type: body.boardingType,
            father_name: body.fatherName,
            father_phone: body.fatherPhone,
            father_email: body.fatherEmail,
            father_occupation: body.fatherOccupation || null,
            mother_name: body.motherName || null,
            mother_phone: body.motherPhone || null,
            mother_email: body.motherEmail || null,
            mother_occupation: body.motherOccupation || null,
            emergency_name: body.emergencyName,
            emergency_phone: body.emergencyPhone,
            emergency_relation: body.emergencyRelation || null,
            preferred_comm: body.preferredComm || null,
            passport_url: fileUrl(req, files?.passport?.[0]),
            birth_cert_url: fileUrl(req, files?.birthCert?.[0]),
            medical_report_url: fileUrl(req, files?.medicalReport?.[0]),
            academic_report_url: fileUrl(req, files?.academicReport?.[0]),
            extra_doc_url: fileUrl(req, files?.extraDoc?.[0]),
            session_id: session.id,
        },
    });
    res.status(201).json({
        message: "Application submitted successfully",
        reference_number: admission.reference_number,
    });
};
exports.createAdmission = createAdmission;
const trackAdmission = async (req, res) => {
    const ref = req.params.ref;
    const admission = await prisma_1.prisma.admission.findUnique({
        where: { reference_number: ref.toUpperCase() },
        select: {
            reference_number: true,
            first_name: true,
            last_name: true,
            class_applying_for: true,
            status: true,
            created_at: true,
            reviewed_at: true,
        },
    });
    if (!admission) {
        return res.status(404).json({ message: "No application found with that reference number" });
    }
    res.json({
        name: `${admission.first_name} ${admission.last_name}`,
        classApplying: admission.class_applying_for,
        status: admission.status,
        appliedDate: admission.created_at,
        reviewedDate: admission.reviewed_at,
    });
};
exports.trackAdmission = trackAdmission;
const listAdmissions = async (req, res) => {
    const { search, status, classApplying, page = "1", limit = "20" } = req.query;
    const where = {};
    if (status)
        where.status = status;
    if (classApplying)
        where.class_applying_for = classApplying;
    if (search) {
        where.OR = [
            { first_name: { contains: search, mode: "insensitive" } },
            { last_name: { contains: search, mode: "insensitive" } },
            { reference_number: { contains: search, mode: "insensitive" } },
            { father_email: { contains: search, mode: "insensitive" } },
        ];
    }
    const take = Math.min(Number(limit) || 20, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
    const [total, data] = await Promise.all([
        prisma_1.prisma.admission.count({ where }),
        prisma_1.prisma.admission.findMany({ where, orderBy: { created_at: "desc" }, skip, take }),
    ]);
    res.json({
        data,
        pagination: { total, page: Number(page) || 1, limit: take, totalPages: Math.ceil(total / take) },
    });
};
exports.listAdmissions = listAdmissions;
const getAdmission = async (req, res) => {
    const id = req.params.id;
    const admission = await prisma_1.prisma.admission.findUnique({ where: { id } });
    if (!admission)
        return res.status(404).json({ message: "Application not found" });
    res.json(admission);
};
exports.getAdmission = getAdmission;
const ALLOWED_TRANSITIONS = {
    pending: ["review", "approved", "rejected"],
    review: ["approved", "rejected"],
    approved: ["fee_paid", "rejected"],
    fee_paid: ["enrolled"],
    rejected: [],
    enrolled: [],
};
const updateAdmissionStatus = async (req, res) => {
    const { status, rejection_reason } = req.body;
    const id = req.params.id;
    const admission = await prisma_1.prisma.admission.findUnique({ where: { id } });
    if (!admission)
        return res.status(404).json({ message: "Application not found" });
    const allowed = ALLOWED_TRANSITIONS[admission.status] || [];
    if (!allowed.includes(status)) {
        return res.status(400).json({ message: `Cannot change status from '${admission.status}' to '${status}'` });
    }
    if (status === "rejected" && !rejection_reason) {
        return res.status(400).json({ message: "Rejection reason is required" });
    }
    const updated = await prisma_1.prisma.admission.update({
        where: { id: admission.id },
        data: {
            status: status,
            reviewed_by: req.user.id,
            reviewed_at: new Date(),
            rejection_reason: status === "rejected" ? rejection_reason : null,
        },
    });
    await prisma_1.prisma.auditLog.create({
        data: {
            user_id: req.user.id,
            action: `admission_${status}`,
            entity: "Admission",
            entity_id: admission.id,
            details: {
                reference_number: admission.reference_number,
                previous_status: admission.status,
                new_status: status,
            },
        },
    });
    await (0, email_1.sendApplicationStatusEmail)(updated);
    // NOTE: Converting an approved/fee_paid admission into an actual Student
    // record (with student_id, class assignment, and login credentials) will
    // be implemented in the Students management phase.
    res.json({ message: `Application ${status.replace("_", " ")}`, admission: updated });
};
exports.updateAdmissionStatus = updateAdmissionStatus;
const exportAdmissionsCsv = async (req, res) => {
    const admissions = await prisma_1.prisma.admission.findMany({ orderBy: { created_at: "desc" } });
    const headers = [
        "Reference Number", "First Name", "Last Name", "Date of Birth", "Gender",
        "Class Applying For", "Boarding Type", "Father Name", "Father Phone", "Father Email",
        "Status", "Applied Date",
    ];
    const rows = admissions.map((a) => [
        a.reference_number,
        a.first_name,
        a.last_name,
        a.date_of_birth.toISOString().split("T")[0],
        a.gender,
        a.class_applying_for,
        a.boarding_type,
        a.father_name,
        a.father_phone,
        a.father_email,
        a.status,
        a.created_at.toISOString().split("T")[0],
    ]);
    const escape = (val) => `"${String(val).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="admissions-${Date.now()}.csv"`);
    res.send(csv);
};
exports.exportAdmissionsCsv = exportAdmissionsCsv;
