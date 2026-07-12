import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { protect, authorize } from "../middleware/auth";
import * as ctrl from "../controllers/export.controller";

const router = Router();
const admin = ["super_admin", "admin"];
const staffAndAdmin = ["staff", "super_admin", "admin"];

router.get(
  "/report-card/:studentId/:termId",
  protect,
  asyncHandler(ctrl.downloadReportCard)
);

router.get(
  "/acceptance-letter/:admissionId",
  protect,
  authorize(...admin),
  asyncHandler(ctrl.downloadAcceptanceLetter)
);

router.get(
  "/broadsheet/:classId/:termId",
  protect,
  authorize(...staffAndAdmin),
  asyncHandler(ctrl.downloadBroadsheet)
);

export default router;