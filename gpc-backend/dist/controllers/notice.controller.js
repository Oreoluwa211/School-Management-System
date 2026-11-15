"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotice = exports.updateNotice = exports.createNotice = exports.getNotice = exports.listNotices = void 0;
const prisma_1 = require("../lib/prisma");
const listNotices = async (req, res) => {
    const { audience, category, classId, page = "1", limit = "20", } = req.query;
    const where = { is_active: true };
    if (audience)
        where.audience = audience;
    if (category)
        where.category = category;
    if (classId)
        where.class_id = classId;
    const take = Math.min(Number(limit) || 20, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
    const [total, data] = await Promise.all([
        prisma_1.prisma.notice.count({ where }),
        prisma_1.prisma.notice.findMany({
            where,
            include: {
                creator: { select: { email: true } },
                class: { select: { name: true, arm: true } },
            },
            orderBy: [{ pin_until: "desc" }, { created_at: "desc" }],
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
exports.listNotices = listNotices;
const getNotice = async (req, res) => {
    const id = req.params.id;
    const notice = await prisma_1.prisma.notice.findUnique({
        where: { id },
        include: {
            creator: { select: { email: true } },
            class: { select: { name: true, arm: true } },
        },
    });
    if (!notice)
        return res.status(404).json({ message: "Notice not found" });
    res.json(notice);
};
exports.getNotice = getNotice;
const createNotice = async (req, res) => {
    const { title, content, category, audience, classId, pinUntil, } = req.body;
    if (!title || !content || !category || !audience) {
        return res.status(400).json({ message: "title, content, category and audience are required" });
    }
    const validCategories = ["general", "academic", "event", "fees", "urgent", "birthday", "meeting"];
    const validAudiences = ["all", "students", "staff", "class"];
    if (!validCategories.includes(category)) {
        return res.status(400).json({ message: `Invalid category` });
    }
    if (!validAudiences.includes(audience)) {
        return res.status(400).json({ message: `Invalid audience` });
    }
    if (audience === "class" && !classId) {
        return res.status(400).json({ message: "classId is required when audience is 'class'" });
    }
    const notice = await prisma_1.prisma.notice.create({
        data: {
            title,
            content,
            category: category,
            audience: audience,
            class_id: audience === "class" ? classId : null,
            pin_until: pinUntil ? new Date(pinUntil) : null,
            is_active: true,
            created_by: req.user.id,
        },
        include: {
            creator: { select: { email: true } },
            class: { select: { name: true, arm: true } },
        },
    });
    await prisma_1.prisma.auditLog.create({
        data: {
            user_id: req.user.id,
            action: "notice_created",
            entity: "Notice",
            entity_id: notice.id,
            details: { title, category, audience },
        },
    });
    res.status(201).json({ message: "Notice created", notice });
};
exports.createNotice = createNotice;
const updateNotice = async (req, res) => {
    const id = req.params.id;
    const { title, content, category, audience, classId, pinUntil, isActive } = req.body;
    const notice = await prisma_1.prisma.notice.findUnique({ where: { id } });
    if (!notice)
        return res.status(404).json({ message: "Notice not found" });
    const updated = await prisma_1.prisma.notice.update({
        where: { id },
        data: {
            title: title ?? notice.title,
            content: content ?? notice.content,
            category: (category ?? notice.category),
            audience: (audience ?? notice.audience),
            class_id: classId ?? notice.class_id,
            pin_until: pinUntil ? new Date(pinUntil) : notice.pin_until,
            is_active: isActive ?? notice.is_active,
        },
        include: {
            creator: { select: { email: true } },
            class: { select: { name: true, arm: true } },
        },
    });
    res.json({ message: "Notice updated", notice: updated });
};
exports.updateNotice = updateNotice;
const deleteNotice = async (req, res) => {
    const id = req.params.id;
    const notice = await prisma_1.prisma.notice.findUnique({ where: { id } });
    if (!notice)
        return res.status(404).json({ message: "Notice not found" });
    // Soft delete — set is_active to false
    await prisma_1.prisma.notice.update({ where: { id }, data: { is_active: false } });
    res.json({ message: "Notice removed" });
};
exports.deleteNotice = deleteNotice;
