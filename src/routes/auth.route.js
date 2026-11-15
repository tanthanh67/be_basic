import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import {
  validate,
  registerRules,
  loginRules,
} from "../middlewares/validate.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { requireAuthHeader } from "../middlewares/csrf.middleware.js";

const router = Router();

router.post("/register", validate(registerRules), authController.register);
router.post("/login", requireAuthHeader, validate(loginRules), authController.login);
router.get("/me", authenticateToken, authController.getMe);
router.post("/refresh", requireAuthHeader, authController.refreshToken);
router.post("/logout", requireAuthHeader, authController.logout);

export default router;
