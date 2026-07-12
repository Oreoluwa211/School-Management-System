import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { protect, authorize } from "../middleware/auth";
import * as ctrl from "../controllers/staff.portal.controller";


const router = Router();

router.use(protect, authorize("staff", "super_admin", "admin"));

router.get("/dashboard", asyncHandler(ctrl.getStaffDashboard));
router.get("/my-students", asyncHandler(ctrl.getMyStudents));
router.get("/lesson-notes", asyncHandler(ctrl.getLessonNotes));
router.post("/lesson-notes", asyncHandler(ctrl.createLessonNote));
router.patch("/lesson-notes/:id", asyncHandler(ctrl.updateLessonNote));
router.get("/class-students", asyncHandler(ctrl.getClassStudents));


export default router;