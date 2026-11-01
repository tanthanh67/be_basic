import { Router } from "express";
import userRouter from "./user.route.js";
import authRouter from "./auth.route.js";
import classRouter from "./class.route.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use("/auth", authRouter);
router.use(authenticateToken);
router.use("/users", userRouter);
router.use("/classes", classRouter);

export default router;
