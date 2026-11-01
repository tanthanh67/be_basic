import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import {
  validate,
  registerRules,
  loginRules,
} from "../middlewares/validate.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", validate(registerRules), authController.register);
router.post("/login", validate(loginRules), authController.login);
router.get("/me", authenticateToken, authController.getMe);
router.post("/refresh", authController.refreshToken);

export default router;
