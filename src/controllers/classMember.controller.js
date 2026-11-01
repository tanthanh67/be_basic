import * as classMemberService from "../services/classMember.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export const getClassMembers = catchAsync(async (req, res) => {
  const classId = req.params.id;
  const members = await classMemberService.getClassMembers(classId);

  return sendSuccess(res, 200, "Class members retrieved successfully", members);
});

export const addClassMember = catchAsync(async (req, res) => {
  const classId = req.params.id;
  const memberId = req.body.memberId;
  const newMember = await classMemberService.addClassMember(classId, memberId);

  return sendSuccess(res, 201, "Member added to class successfully", newMember);
});
