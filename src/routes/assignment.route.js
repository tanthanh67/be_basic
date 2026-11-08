import { Router } from "express";
import * as assignmentController from "../controllers/assignment.controller.js";
import {
  createAssignmentRules,
  idParamRules,
  updateAssignmentRules,
  validate,
} from "../middlewares/validate.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

const router = Router();

router.get(
  "/classes/:id/assignments",
  requirePermission("ASSIGNMENT_READ"),
  validate(idParamRules),
  assignmentController.getAssignmentsByClass,
);
router.post(
  "/classes/:id/assignments",
  requirePermission("ASSIGNMENT_CREATE"),
  validate([...idParamRules, ...createAssignmentRules]),
  assignmentController.createAssignment,
);
router.get(
  "/assignments/:id",
  requirePermission("ASSIGNMENT_READ"),
  validate(idParamRules),
  assignmentController.getAssignmentById,
);
router.patch(
  "/assignments/:id",
  requirePermission("ASSIGNMENT_UPDATE"),
  validate([...idParamRules, ...updateAssignmentRules]),
  assignmentController.updateAssignment,
);
router.delete(
  "/assignments/:id",
  requirePermission("ASSIGNMENT_DELETE"),
  validate(idParamRules),
  assignmentController.deleteAssignment,
);

export default router;
