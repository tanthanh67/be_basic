import { ConflictError, NotFoundError } from "../core/error.response.js";
import * as userRepository from "../repository/user.repository.js";

export const getAllUser = async () => {
  return await userRepository.findAll();
};

export const getUserById = async (userId) => {
  const id = Number(userId);
  const user = await userRepository.findById(id);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return user;
};

export const addUser = async (userData) => {
  const existingUser = await userRepository.findByEmail(userData.email);
  if (existingUser) {
    throw new ConflictError("Email already exists");
  }
  return await userRepository.create(userData);
};

export const updateUser = async (userId, updatedData) => {
  const id = Number(userId);
  const existingUser = await userRepository.findById(id);
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }

  if (updatedData.email && updatedData.email !== existingUser.email) {
    const emailTaken = await userRepository.findByEmail(updateData.email);
    if (emailTaken && emailTaken.id !== id) {
      throw new ConflictError("Email already exists");
    }
  }

  return await userRepository.update(id, updatedData);
};

export const deleteUser = async (userId) => {
  const id = Number(userId);

  const existingUser = await userRepository.findById(id);
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }

  return await userRepository.deleteById(id);
};
