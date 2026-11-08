import * as assignmentService from "../services/assignment.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export const getAssignmentsByClass = catchAsync(async (req, res) => {
  const assignments = await assignmentService.getAssignmentsByClass(
    req.params.id,
    req.user.id,
  );

  return sendSuccess(
    res,
    200,
    "Assignments retrieved successfully",
    assignments,
  );
});

export const createAssignment = catchAsync(async (req, res) => {
  const assignment = await assignmentService.createAssignment(
    req.params.id,
    req.user.id,
    req.body,
  );

  return sendSuccess(res, 201, "Assignment created successfully", assignment);
});

export const getAssignmentById = catchAsync(async (req, res) => {
  const assignment = await assignmentService.getAssignmentById(
    req.params.id,
    req.user.id,
  );

  return sendSuccess(res, 200, "Assignment retrieved successfully", assignment);
});

export const updateAssignment = catchAsync(async (req, res) => {
  const assignment = await assignmentService.updateAssignment(
    req.params.id,
    req.user.id,
    req.body,
  );

  return sendSuccess(res, 200, "Assignment updated successfully", assignment);
});

export const deleteAssignment = catchAsync(async (req, res) => {
  const assignment = await assignmentService.deleteAssignment(
    req.params.id,
    req.user.id,
  );

  return sendSuccess(res, 200, "Assignment deleted successfully", assignment);
});
