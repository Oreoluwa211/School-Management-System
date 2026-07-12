import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { protect, authorize } from "../middleware/auth";
import * as ctrl from "../controllers/result.controller";

const router = Router();
const admin = ["super_admin", "admin"];
const staffAndAdmin = ["staff", "super_admin", "admin"];

router.get("/broadsheet", protect, authorize(...admin), asyncHandler(ctrl.getBroadsheet));
router.get("/student/:studentId", protect, asyncHandler(ctrl.getStudentResults));
router.get("/", protect, asyncHandler(ctrl.listResults));
router.post("/bulk", protect, authorize(...staffAndAdmin), asyncHandler(ctrl.bulkSaveResults));
router.patch("/submit", protect, authorize(...staffAndAdmin), asyncHandler(ctrl.submitResults));

export default router;