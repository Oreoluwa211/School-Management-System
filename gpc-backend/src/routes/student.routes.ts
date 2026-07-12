import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { protect, authorize } from "../middleware/auth";
import * as ctrl from "../controllers/student.controller";

const router = Router();
const admin = ["super_admin", "admin"];

router.get("/export", protect, authorize(...admin), asyncHandler(ctrl.exportStudentsCsv));
router.get("/", protect, authorize(...admin), asyncHandler(ctrl.listStudents));
router.get("/:id", protect, authorize(...admin), asyncHandler(ctrl.getStudent));
router.post("/", protect, authorize(...admin), asyncHandler(ctrl.createStudent));
router.post("/enroll", protect, authorize(...admin), asyncHandler(ctrl.enrollStudent));
router.patch("/:id/status", protect, authorize(...admin), asyncHandler(ctrl.updateStudentStatus));

export default router;