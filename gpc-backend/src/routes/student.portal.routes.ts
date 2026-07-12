import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { protect, authorize } from "../middleware/auth";
import * as ctrl from "../controllers/student.portal.controller";

const router = Router();

router.use(protect, authorize("student", "super_admin", "admin"));

router.get("/dashboard", asyncHandler(ctrl.getStudentDashboard));
router.get("/results", asyncHandler(ctrl.getMyResults));
router.get("/attendance", asyncHandler(ctrl.getMyAttendance));
router.get("/notices", asyncHandler(ctrl.getMyNotices));
router.get("/library", asyncHandler(ctrl.getELibrary));
router.get("/fees", asyncHandler(ctrl.getMyFees));

export default router;