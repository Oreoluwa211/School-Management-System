import { Response } from "express";
import { Prisma, NoticeCategory, NoticeAudience } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

export const listNotices = async (req: AuthRequest, res: Response) => {
  const {
    audience, category, classId,
    page = "1", limit = "20",
  } = req.query as Record<string, string>;

  const where: Prisma.NoticeWhereInput = { is_active: true };
  if (audience) where.audience = audience as NoticeAudience;
  if (category) where.category = category as NoticeCategory;
  if (classId) where.class_id = classId;

  const take = Math.min(Number(limit) || 20, 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [total, data] = await Promise.all([
    prisma.notice.count({ where }),
    prisma.notice.findMany({
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

export const getNotice = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const notice = await prisma.notice.findUnique({
    where: { id },
    include: {
      creator: { select: { email: true } },
      class: { select: { name: true, arm: true } },
    },
  });
  if (!notice) return res.status(404).json({ message: "Notice not found" });
  res.json(notice);
};

export const createNotice = async (req: AuthRequest, res: Response) => {
  const {
    title, content, category, audience,
    classId, pinUntil,
  } = req.body;

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

  const notice = await prisma.notice.create({
    data: {
      title,
      content,
      category: category as NoticeCategory,
      audience: audience as NoticeAudience,
      class_id: audience === "class" ? classId : null,
      pin_until: pinUntil ? new Date(pinUntil) : null,
      is_active: true,
      created_by: req.user!.id,
    },
    include: {
      creator: { select: { email: true } },
      class: { select: { name: true, arm: true } },
    },
  });

  await prisma.auditLog.create({
    data: {
      user_id: req.user!.id,
      action: "notice_created",
      entity: "Notice",
      entity_id: notice.id,
      details: { title, category, audience },
    },
  });

  res.status(201).json({ message: "Notice created", notice });
};

export const updateNotice = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { title, content, category, audience, classId, pinUntil, isActive } = req.body;

  const notice = await prisma.notice.findUnique({ where: { id } });
  if (!notice) return res.status(404).json({ message: "Notice not found" });

  const updated = await prisma.notice.update({
    where: { id },
    data: {
      title: title ?? notice.title,
      content: content ?? notice.content,
      category: (category ?? notice.category) as NoticeCategory,
      audience: (audience ?? notice.audience) as NoticeAudience,
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

export const deleteNotice = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const notice = await prisma.notice.findUnique({ where: { id } });
  if (!notice) return res.status(404).json({ message: "Notice not found" });

  // Soft delete — set is_active to false
  await prisma.notice.update({ where: { id }, data: { is_active: false } });
  res.json({ message: "Notice removed" });
};