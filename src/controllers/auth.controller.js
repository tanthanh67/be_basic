import * as authService from "../services/auth.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export const register = catchAsync(async (req, res) => {
  const newUser = await authService.register(req.body);
  return sendSuccess(res, 201, "User registered successfully", newUser);
});

export const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  return sendSuccess(res, 200, "Login successful", {
    user,
    accessToken,
    refreshToken,
  });
});

export const getMe = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const user = await authService.getMe(userId);
  return sendSuccess(res, 200, "User profile retrieved successfully", user);
});

export const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  const result = await authService.refreshAccessToken(refreshToken);
  return sendSuccess(res, 200, "Access token refreshed successfully", result);
});
