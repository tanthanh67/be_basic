import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import {
  validate,
  createUserRules,
  updateUserRules,
} from "../middlewares/validate.js";

const router = Router();

router.get("/", userController.getAllUser);
router.get("/:id", userController.getUserById);
router.post("/", validate(createUserRules), userController.addUser);
router.put("/:id", validate(updateUserRules), userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
