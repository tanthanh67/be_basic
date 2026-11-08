import { ForbiddenError, NotFoundError } from "../core/error.response.js";
import * as classRepository from "../repository/class.repository.js";
import * as classMemberRepository from "../repository/classMember.repository.js";
import { checkPermission } from "./permission.service.js";

export const getClassAccess = async (classId, userId) => {
  const foundClass = await classRepository.findById(classId);
  if (!foundClass) {
    throw new NotFoundError("Class not found");
  }

  const membership = await classMemberRepository.findMembership(
    classId,
    userId,
  );
  const canReadAll = await checkPermission(userId, "CLASS_READ_ALL");

  return {
    class: foundClass,
    isMentor: foundClass.mentor_id === userId,
    isMember: Boolean(membership),
    canReadAll,
  };
};

export const ensureCanView = (access) => {
  if (!access.canReadAll && !access.isMentor && !access.isMember) {
    throw new ForbiddenError("You do not have access to this class");
  }
};

export const ensureMentor = (access) => {
  if (!access.isMentor) {
    throw new ForbiddenError(
      "Only the mentor of this class can perform this action",
    );
  }
};

export const ensureMember = (access) => {
  if (!access.isMember) {
    throw new ForbiddenError(
      "Only members of this class can perform this action",
    );
  }
};
