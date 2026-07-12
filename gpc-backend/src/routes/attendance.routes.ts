import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { protect, authorize } from "../middleware/auth";
import * as ctrl from "../controllers/attendance.controller";

const router = Router();

router.get("/", protect, asyncHandler(ctrl.getAttendance));
router.post("/", protect, authorize("staff", "super_admin", "admin"), asyncHandler(ctrl.recordAttendance));
router.get("/student/:studentId", protect, asyncHandler(ctrl.getStudentAttendance));

export default router;