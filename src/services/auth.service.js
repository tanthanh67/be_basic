import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../core/error.response.js";
import * as userRepository from "../repository/user.repository.js";
import {
  generateRefreshToken,
  generateToken,
  verifyRefreshToken,
  verifyToken,
} from "../utils/jwt.helper.js";
import { hashPassword, comparePassword } from "../utils/password.helper.js";

export const register = async ({ name, email, password, age }) => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ConflictError("Email already exists");
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await userRepository.createWithRole(
    {
      name,
      email,
      password: hashedPassword,
      age,
    },
    "MEMBER",
  );

  return newUser;
};

export const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const roleNames = await userRepository.findRoleNames(user.id);

  const tokenPayload = {
    id: user.id,
    email: user.email,
  };

  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      roles: roleNames,
      created_at: user.created_at,
    },
    accessToken,
    refreshToken,
  };
};

export const getMe = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const roleName = await userRepository.findRoleNames(user.id);

  return { ...user, roles: roleName };
};

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new UnauthorizedError("Refresh token is required");
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    if (decoded.type !== "refresh") {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const user = await userRepository.findById(decoded.payload.id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
    };

    const newAccessToken = generateToken(tokenPayload);

    return {
      accessToken: newAccessToken,
    };
  } catch (error) {
    throw new UnauthorizedError("Invalid refresh token");
  }
};
