import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import {
  validate,
  createUserRules,
  updateUserRules,
} from "../middlewares/validate.js";
import parseUserId from "../utils/parseUserId.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

const router = Router();

router.get("/", requirePermission("USER_READ"), userController.getAllUser);
router.get(
  "/:id",
  requirePermission("USER_READ"),
  parseUserId,
  userController.getUserById,
);
router.post(
  "/",
  requirePermission("USER_CREATE"),
  validate(createUserRules),
  userController.addUser,
);
router.put(
  "/:id",
  requirePermission("USER_UPDATE"),
  parseUserId,
  validate(updateUserRules),
  userController.updateUser,
);
router.delete(
  "/:id",
  requirePermission("USER_DELETE"),
  parseUserId,
  userController.deleteUser,
);

export default router;
