import { ConflictError, NotFoundError } from "../core/error.response.js";
import * as classRepository from "../repository/class.repository.js";

export const getAllClasses = async () => {
  return classRepository.findAll();
};

export const createClass = async (classData) => {
  const existingClass = await classRepository.findByTitle(classData.title);
  if (existingClass) {
    throw new ConflictError("Class already exist");
  }

  return await classRepository.create(classData);
};

export const updateClass = async (classId, updatedData) => {
  const id = Number(classId);
  const existingClass = await classRepository.findById(id);

  if (!existingClass) {
    throw new NotFoundError("Class not found");
  }

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
