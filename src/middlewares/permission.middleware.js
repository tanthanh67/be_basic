import { checkPermission } from "../services/permission.service.js";
import { UnauthorizedError, ForbiddenError } from "../core/error.response.js";

export const requirePermission = (permission) => {
  return async (req, res, next) => {
    const user = req.user;

    if (!user) {
      return next(new UnauthorizedError("User not authenticated"));
    }

    const hasPermission = await checkPermission(user.id, permission);

    if (!hasPermission) {
      return next(
        new ForbiddenError("User does not have the required permission"),
      );
    }

    next();
  };
};
