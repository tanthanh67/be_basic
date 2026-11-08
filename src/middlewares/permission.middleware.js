import {
  checkAnyPermission,
  checkPermission,
} from "../services/permission.service.js";
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

// Passes when the user has at least one of the given permissions.
// Use it when a route serves several access levels (e.g. CLASS_READ_ALL / CLASS_READ_OWN)
// and the service decides what data each level can see.
export const requireAnyPermission = (...permissions) => {
  return async (req, res, next) => {
    const user = req.user;

    if (!user) {
      return next(new UnauthorizedError("User not authenticated"));
    }

    const hasPermission = await checkAnyPermission(user.id, permissions);

    if (!hasPermission) {
      return next(
        new ForbiddenError("User does not have the required permission"),
      );
    }

    next();
  };
};
