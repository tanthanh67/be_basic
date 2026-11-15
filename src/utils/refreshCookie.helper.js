import { config } from "../config/env.config.js";
import { UnauthorizedError } from "../core/error.response.js";

export const refreshCookieName = "refresh";
export const refreshCookieOptions = {
  httpOnly: true,
  secure: config.cookie.secure,
  sameSite: "lax",
  path: "/",
};

export const readRefreshCookie = (req) => {
  const cookies = (req.headers.cookie || "").split(";").filter((cookie) => {
    const separator = cookie.indexOf("=");
    return separator >= 0 && cookie.slice(0, separator).trim() === refreshCookieName;
  });

  if (!cookies.length) return undefined;
  if (cookies.length > 1) throw new UnauthorizedError("Ambiguous refresh cookie");

  const cookie = cookies[0];
  try {
    return decodeURIComponent(cookie.slice(cookie.indexOf("=") + 1).trim());
  } catch {
    throw new UnauthorizedError("Invalid refresh cookie");
  }
};
