import { ForbiddenError } from "../core/error.response.js";

// Cross-origin browser requests need a CORS preflight to send this header.
// If CORS is enabled later, allow only explicitly trusted frontend origins.
export const requireAuthHeader = (req, res, next) => {
  if (req.get("X-Requested-With") !== "XMLHttpRequest") {
    return next(new ForbiddenError("X-Requested-With: XMLHttpRequest is required"));
  }
  return next();
};
