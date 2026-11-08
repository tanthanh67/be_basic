import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../core/error.response.js";
import * as classRepository from "../repository/class.repository.js";
import * as classMemberRepository from "../repository/classMember.repository.js";
import * as userRepository from "../repository/user.repository.js";
import { checkPermission } from "./permission.service.js";

export const getAllClasses = async (query, userId) => {
  const canReadAll = await checkPermission(userId, "CLASS_READ_ALL");
  if (canReadAll) {
    return classRepository.findAll(query);
  }

  return classRepository.findAllForUser(userId, query);
};

export const getClassById = async (classId, userId) => {
  const id = Number(classId);
  const existingClass = await classRepository.findById(id);

  if (!existingClass) {
    throw new NotFoundError("Class not found");
  }

  const canReadAll = await checkPermission(userId, "CLASS_READ_ALL");
  if (canReadAll) {
    return existingClass;
  }

  const isMentor = existingClass.mentor_id === userId;
  if (!isMentor) {
    const membership = await classMemberRepository.findMembership(id, userId);
    if (!membership) {
      throw new ForbiddenError("You do not have access to this class");
    }
  }

  return existingClass;
};

export const createClass = async (classData) => {
  const existingClass = await classRepository.findByName(classData.name);
  if (existingClass) {
    throw new ConflictError("Class already exist");
  }

  await ensureMentorValid(classData.mentorId);

  return await classRepository.create(classData);
};

export const updateClass = async (classId, updatedData) => {
  const id = Number(classId);
  const existingClass = await classRepository.findById(id);

  if (!existingClass) {
    throw new NotFoundError("Class not found");
  }

  if (updatedData.name && updatedData.name !== existingClass.name) {
    const sameNameClass = await classRepository.findByName(updatedData.name);
    if (sameNameClass && sameNameClass.id !== id) {
      throw new ConflictError("Class already exist");
    }
  }

  const finalStartDate = updatedData.startDate ?? existingClass.start_date;
  const finalEndDate = updatedData.endDate ?? existingClass.end_date;
  if (finalStartDate && finalEndDate && finalEndDate < finalStartDate) {
    throw new BadRequestError("End date cannot be before start date");
  }

  await ensureMentorValid(updatedData.mentorId);

  return await classRepository.update(id, updatedData);
};

export const deleteClass = async (classId) => {
  const id = Number(classId);
  const existingClass = await classRepository.findById(id);

  if (!existingClass) {
    throw new NotFoundError("Class not found");
  }

  return await classRepository.deleteById(id);
};

const ensureMentorValid = async (mentorId) => {
  if (mentorId === undefined || mentorId === null) {
    return;
  }
  const mentor = await userRepository.findById(mentorId);
  if (!mentor) {
    throw new NotFoundError("Mentor not found");
  }
};
