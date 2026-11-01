import { Router } from "express";
import * as classController from "../controllers/class.controller.js";
import { idParamRules, validate } from "../middlewares/validate.js";

const router = Router();

router.get("/", classController.getAllClasses);
router.post("/", classController.createClass);
router.put("/:id", validate(idParamRules), classController.updateClass);
router.delete("/:id", validate(idParamRules), classController.deleteClass);

export default router;
