import { Router } from "express";
import * as submissionController from "../controllers/submission.controller.js";
import {
  idParamRules,
  reviewSubmissionRules,
  submitAssignmentRules,
  validate,
} from "../middlewares/validate.js";
import {
  requireAnyPermission,
  requirePermission,
} from "../middlewares/permission.middleware.js";

const router = Router();

router.post(
  "/assignments/:id/submissions",
  requirePermission("SUBMISSION_CREATE"),
  validate([...idParamRules, ...submitAssignmentRules]),
  submissionController.submitAssignment,
);
router.get(
  "/assignments/:id/submissions",
  requireAnyPermission("SUBMISSION_READ_CLASS", "SUBMISSION_READ_OWN"),
  validate(idParamRules),
  submissionController.getSubmissionsByAssignment,
);
router.get(
  "/submissions/:id",
  requireAnyPermission("SUBMISSION_READ_CLASS", "SUBMISSION_READ_OWN"),
  validate(idParamRules),
  submissionController.getSubmissionById,
);
router.patch(
  "/submissions/:id/review",
  requirePermission("SUBMISSION_REVIEW"),
  validate([...idParamRules, ...reviewSubmissionRules]),
  submissionController.reviewSubmission,
);

export default router;
