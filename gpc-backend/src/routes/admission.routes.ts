import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { protect, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload";
import * as ctrl from "../controllers/admission.controller";

const router = Router();

// Public
router.post(
  "/",
  upload.fields([
    { name: "passport", maxCount: 1 },
    { name: "birthCert", maxCount: 1 },
    { name: "medicalReport", maxCount: 1 },
    { name: "academicReport", maxCount: 1 },
    { name: "extraDoc", maxCount: 1 },
  ]),
  asyncHandler(ctrl.createAdmission)
);
router.get("/track/:ref", asyncHandler(ctrl.trackAdmission));

// Admin (order matters — specific paths before /:id)
router.get("/export", protect, authorize("super_admin", "admin"), asyncHandler(ctrl.exportAdmissionsCsv));
router.get("/", protect, authorize("super_admin", "admin"), asyncHandler(ctrl.listAdmissions));
router.get("/:id", protect, authorize("super_admin", "admin"), asyncHandler(ctrl.getAdmission));
router.patch("/:id/status", protect, authorize("super_admin", "admin"), asyncHandler(ctrl.updateAdmissionStatus));

export default router;