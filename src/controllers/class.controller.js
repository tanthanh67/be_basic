import * as classService from "../services/class.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export const getAllClasses = catchAsync(async (req, res) => {
  const classes = await classService.getAllClasses();

  return sendSuccess(res, 200, "Classes retrieved succesfully", classes);
});

export const createClass = catchAsync(async (req, res) => {
  const newClass = await classService.createClass(req.body);

  return sendSuccess(res, 201, "Class created successfully", newClass);
});

export const updateClass = catchAsync(async (req, res) => {
  const updatedClass = await classService.updateClass(req.params.id, req.body);

  return sendSuccess(res, 200, "Class updated successfully", updatedClass);
});

export const deleteClass = catchAsync(async (req, res) => {
  const deletedClass = await classService.deleteClass(req.params.id);

  return sendSuccess(res, 200, "Class deleted successfully", deletedClass);
});
