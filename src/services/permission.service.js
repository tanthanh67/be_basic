import * as permissionRepository from "../repository/permission.repository.js";

export const checkPermission = async (userId, permission) => {
  return await permissionRepository.hasPermission(userId, permission);
};
