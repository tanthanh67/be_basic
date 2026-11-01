import { Router } from "express";
import * as classMembersController from "../controllers/classMember.controller.js";
import { idParamRules, validate } from "../middlewares/validate.js";

const router = Router({ mergeParams: true });

router.get("/", validate(idParamRules), classMembersController.getClassMembers);
router.post("/", validate(idParamRules), classMembersController.addClassMember);

export default router;
