import { Router } from "express";
import * as classController from "../controllers/class.controller.js";
import {
  createClassRules,
  idParamRules,
  updateClassRules,
  validate,
} from "../middlewares/validate.js";
import {
  requireAnyPermission,
  requirePermission,
} from "../middlewares/permission.middleware.js";

const router = Router();

router.get(
  "/",
  requireAnyPermission("CLASS_READ_ALL", "CLASS_READ_OWN"),
  classController.getAllClasses,
);
router.get(
  "/:id",
  requireAnyPermission("CLASS_READ_ALL", "CLASS_READ_OWN"),
  validate(idParamRules),
  classController.getClassById,
);
router.post(
  "/",
  requirePermission("CLASS_CREATE"),
  validate(createClassRules),
  classController.createClass,
);
router.put(
  "/:id",
  requirePermission("CLASS_UPDATE"),
  validate([...idParamRules, ...updateClassRules]),
  classController.updateClass,
);
router.delete(
  "/:id",
  requirePermission("CLASS_DELETE"),
  validate(idParamRules),
  classController.deleteClass,
);

export default router;
