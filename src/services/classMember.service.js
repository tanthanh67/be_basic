import * as classMembersRepository from "../repository/classMember.repository.js";
import * as classRepository from "../repository/class.repository.js";
import * as userRepository from "../repository/user.repository.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../core/error.response.js";

export const getClassMembers = async (classId) => {
  const existingClass = await classRepository.findById(classId);

  if (!existingClass) {
    throw new NotFoundError("Class not found");
  }

  return classMembersRepository.findByClassId(classId);
};

export const addClassMember = async (classId, memberId) => {
  const existingClass = await classRepository.findById(classId);
  if (!existingClass) {
    throw new NotFoundError("Class not found");
  }

  const user = await userRepository.findById(memberId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const isMember = await userRepository.hasRole(memberId, "MEMBER");
  if (!isMember) {
    throw new BadRequestError("User must have the MEMBER role");
  }

  const existingMember = await classMembersRepository.findMembership(
    classId,
    memberId,
  );
  if (existingMember) {
    throw new ConflictError("Member already exists in the class");
  }

  const newMember = await classMembersRepository.create(classId, memberId);
  if (!newMember) {
    // Another request may have inserted the same membership after our check.
    throw new ConflictError("Member already exists in the class");
  }

  return newMember;
};
