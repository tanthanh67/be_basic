import { Router } from "express";
import * as classController from "../controllers/class.controller.js";

const router = Router();

router.get("/", classController.getAllClasses);
router.post("/", classController.createClass);
router.put("/:id", classController.updateClass);
router.delete("/:id", classController.deleteClass);

export default router;
