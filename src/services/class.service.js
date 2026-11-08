import { ConflictError, NotFoundError } from "../core/error.response.js";
import * as classRepository from "../repository/class.repository.js";
import * as userRepository from "../repository/user.repository.js";

export const getAllClasses = async (query) => {
  return classRepository.findAll(query);
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
