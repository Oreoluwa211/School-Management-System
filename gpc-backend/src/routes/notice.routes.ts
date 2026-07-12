import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { protect, authorize } from "../middleware/auth";
import * as ctrl from "../controllers/notice.controller";

const router = Router();
const admin = ["super_admin", "admin"];

router.get("/", protect, asyncHandler(ctrl.listNotices));
router.get("/:id", protect, asyncHandler(ctrl.getNotice));
router.post("/", protect, authorize(...admin), asyncHandler(ctrl.createNotice));
router.patch("/:id", protect, authorize(...admin), asyncHandler(ctrl.updateNotice));
router.delete("/:id", protect, authorize(...admin), asyncHandler(ctrl.deleteNotice));

export default router;