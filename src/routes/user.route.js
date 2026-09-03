import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import {
  validate,
  createUserRules,
  updateUserRules,
} from "../middlewares/validate.js";
import parseUserId from "../middlewares/parseUserId.js";

const router = Router();

router.get("/", userController.getAllUser);
router.get("/:id", parseUserId, userController.getUserById);
router.post("/", validate(createUserRules), userController.addUser);
router.put(
  "/:id",
  parseUserId,
  validate(updateUserRules),
  userController.updateUser,
);
router.delete("/:id", parseUserId, userController.deleteUser);

export default router;
