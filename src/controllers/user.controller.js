import * as userService from "../services/user.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";
import { NotFoundError } from "../core/error.response.js";

export const getAllUser = catchAsync(async (req, res) => {
  const users = await userService.getAllUser();

  return sendSuccess(res, 200, "Users retrieved successfully", users);
});

export const getUserById = catchAsync(async (req, res) => {
  const userId = req.params.id;

  const users = await userService.getAllUser();
  const user = users.find((u) => u.id === parseInt(userId));

  if (user) {
    return sendSuccess(res, 200, "User retrieved successfully", user);
  } else {
    throw new NotFoundError("User not found");
  }
});

export const addUser = catchAsync(async (req, res) => {
  const newUser = await userService.addUser(req.body);
  return sendSuccess(res, 201, "User added successfully", newUser);
});

export const updateUser = catchAsync(async (req, res) => {
  const updatedUser = await userService.updateUser(req.params.id, req.body);

  if (!updatedUser) {
    throw new NotFoundError("User not found");
  }

  return sendSuccess(res, 200, "User updated successfully", updatedUser);
});

export const deleteUser = catchAsync(async (req, res) => {
  const userIndex = req.params.id;

  const deletedUser = await userService.deleteUser(userIndex);

  if (!deletedUser) {
    throw new NotFoundError("User not found");
  }

  return sendSuccess(res, 200, "User deleted successfully", deletedUser);
});
