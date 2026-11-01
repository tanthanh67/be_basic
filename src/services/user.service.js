import { ConflictError, NotFoundError } from "../core/error.response.js";
import * as userRepository from "../repository/user.repository.js";
import { hashPassword } from "../utils/password.helper.js";

export const getAllUser = async (query) => {
  return await userRepository.findAll(query);
};

export const getUserById = async (userId) => {
  const id = Number(userId);
  const user = await userRepository.findById(id);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return user;
};

export const addUser = async ({ name, email, password, age }) => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ConflictError("Email already exists");
  }

  const hashedPassword = await hashPassword(password);

  return await userRepository.create({
    name,
    email,
    password: hashedPassword,
    age,
  });
};

export const updateUser = async (userId, { name, email, password, age }) => {
  const id = Number(userId);
  const existingUser = await userRepository.findById(id);
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }

  if (email && email !== existingUser.email) {
    const emailTaken = await userRepository.findByEmail(updatedData.email);
    if (emailTaken && emailTaken.id !== id) {
      throw new ConflictError("Email already exists");
    }
  }

  const hashedPassword = hashPassword(password);

  return await userRepository.update(id, {
    name,
    email,
    password: hashedPassword,
    age,
  });
};

export const deleteUser = async (userId) => {
  const id = Number(userId);

  const existingUser = await userRepository.findById(id);
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }

  return await userRepository.deleteById(id);
};
