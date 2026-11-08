import { Router } from "express";
import * as lessonController from "../controllers/lesson.controller.js";
import {
  createLessonRules,
  idParamRules,
  updateLessonRules,
  validate,
} from "../middlewares/validate.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

const router = Router();

router.get(
  "/classes/:id/lessons",
  requirePermission("LESSON_READ"),
  validate(idParamRules),
  lessonController.getLessonsByClass,
);
router.post(
  "/classes/:id/lessons",
  requirePermission("LESSON_CREATE"),
  validate([...idParamRules, ...createLessonRules]),
  lessonController.createLesson,
);
router.get(
  "/classes/:id/progress",
  requirePermission("PROGRESS_READ_OWN"),
  validate(idParamRules),
  lessonController.getClassProgress,
);
router.get(
  "/lessons/:id",
  requirePermission("LESSON_READ"),
  validate(idParamRules),
  lessonController.getLessonById,
);
router.patch(
  "/lessons/:id",
  requirePermission("LESSON_UPDATE"),
  validate([...idParamRules, ...updateLessonRules]),
  lessonController.updateLesson,
);
router.delete(
  "/lessons/:id",
  requirePermission("LESSON_DELETE"),
  validate(idParamRules),
  lessonController.deleteLesson,
);
router.post(
  "/lessons/:id/complete",
  requirePermission("LESSON_COMPLETE"),
  validate(idParamRules),
  lessonController.completeLesson,
);

export default router;
