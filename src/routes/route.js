import { Router } from "express";
import userRouter from "./user.route.js";
import authRouter from "./auth.route.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateToken);
router.use("/users", userRouter);
router.use("/auth", authRouter);

export default router;
