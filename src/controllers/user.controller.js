import * as userService from "../services/user.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export const getAllUser = catchAsync(async (req, res) => {
  const users = await userService.getAllUser(req.query);

  return sendSuccess(res, 200, "Users retrieved successfully", users);
});

export const getUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  return sendSuccess(res, 200, "User retrieved successfully", user);
});

export const addUser = catchAsync(async (req, res) => {
  const newUser = await userService.addUser(req.body);

  return sendSuccess(res, 201, "User added successfully", newUser);
});

export const updateUser = catchAsync(async (req, res) => {
  const updatedUser = await userService.updateUser(req.params.id, req.body);

  return sendSuccess(res, 200, "User updated successfully", updatedUser);
});

export const deleteUser = catchAsync(async (req, res) => {
  const deletedUser = await userService.deleteUser(req.params.id);

  return sendSuccess(res, 200, "User deleted successfully", deletedUser);
});
