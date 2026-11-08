import { Router } from "express";
import * as classController from "../controllers/class.controller.js";
import {
  createClassRules,
  idParamRules,
  updateClassRules,
  validate,
} from "../middlewares/validate.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

const router = Router();

router.get("/", classController.getAllClasses);
router.post(
  "/",
  requirePermission("CLASS_CREATE"),
  validate(createClassRules),
  classController.createClass,
);
router.put(
  "/:id",
  requirePermission("CLASS_UPDATE"),
  validate(idParamRules),
  validate(updateClassRules),
  classController.updateClass,
);
router.delete(
  "/:id",
  requirePermission("CLASS_DELETE"),
  validate(idParamRules),
  classController.deleteClass,
);

export default router;
