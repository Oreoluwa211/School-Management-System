import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { protect, authorize } from "../middleware/auth";
import * as ctrl from "../controllers/staff.controller";

const router = Router();
const admin = ["super_admin", "admin"];

router.get("/export", protect, authorize(...admin), asyncHandler(ctrl.exportStaffCsv));
router.get("/", protect, authorize(...admin), asyncHandler(ctrl.listStaff));
router.get("/:id", protect, authorize(...admin), asyncHandler(ctrl.getStaff));
router.post("/", protect, authorize(...admin), asyncHandler(ctrl.createStaff));
router.patch("/:id", protect, authorize(...admin), asyncHandler(ctrl.updateStaff));
router.patch("/:id/toggle-active", protect, authorize(...admin), asyncHandler(ctrl.toggleStaffActive));

export default router;