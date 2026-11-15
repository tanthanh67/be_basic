import * as authService from "../services/auth.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";
import {
  readRefreshCookie,
  refreshCookieName,
  refreshCookieOptions,
} from "../utils/refreshCookie.helper.js";

export const register = catchAsync(async (req, res) => {
  const newUser = await authService.register(req.body);
  return sendSuccess(res, 201, "User registered successfully", newUser);
});

export const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken, refreshTokenExpiresAt } =
    await authService.login(req.body);

  res.set("Cache-Control", "no-store");
  res.cookie(refreshCookieName, refreshToken, {
    ...refreshCookieOptions,
    expires: refreshTokenExpiresAt,
  });

  return sendSuccess(res, 200, "Login successful", {
    user,
    accessToken,
  });
});

export const getMe = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const user = await authService.getMe(userId);
  return sendSuccess(res, 200, "User profile retrieved successfully", user);
});

export const refreshToken = catchAsync(async (req, res) => {
  res.set("Cache-Control", "no-store");
  const result = await authService.refreshAccessToken(readRefreshCookie(req));
  return sendSuccess(res, 200, "Access token refreshed successfully", result);
});

export const logout = catchAsync(async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    await authService.logout(readRefreshCookie(req));
  } finally {
    res.clearCookie(refreshCookieName, refreshCookieOptions);
  }

  return sendSuccess(res, 200, "Logout successful");
});
