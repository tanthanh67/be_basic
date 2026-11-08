import { Router } from "express";
import * as classMembersController from "../controllers/classMember.controller.js";
import {
  addClassMemberRules,
  idParamRules,
  memberIdParamRules,
  validate,
} from "../middlewares/validate.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

const router = Router({ mergeParams: true });

router.get(
  "/",
  requirePermission("CLASS_MEMBER_READ"),
  validate(idParamRules),
  classMembersController.getClassMembers,
);
router.post(
  "/",
  requirePermission("CLASS_MEMBER_ADD"),
  validate([...idParamRules, ...addClassMemberRules]),
  classMembersController.addClassMember,
);
router.delete(
  "/:memberId",
  requirePermission("CLASS_MEMBER_REMOVE"),
  validate([...idParamRules, ...memberIdParamRules]),
  classMembersController.removeClassMember,
);

export default router;
