import { randomUUID } from "node:crypto";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../core/error.response.js";
import * as userRepository from "../repository/user.repository.js";
import * as authSessionRepository from "../repository/authSession.repository.js";
import {
  generateRefreshToken,
  generateToken,
  verifyRefreshToken,
} from "../utils/jwt.helper.js";
import { hashPassword, comparePassword } from "../utils/password.helper.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const readRefreshPayload = (refreshToken) => {
  if (typeof refreshToken !== "string" || !refreshToken.trim()) {
    throw new UnauthorizedError("Refresh token is required");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const payload = decoded?.payload;
  if (
    decoded?.type !== "refresh" ||
    !Number.isSafeInteger(decoded?.exp) ||
    !Number.isSafeInteger(payload?.id) ||
    payload.id <= 0 ||
    payload.id > 2147483647 ||
    typeof payload.sessionId !== "string" ||
    !UUID_PATTERN.test(payload.sessionId)
  ) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  return { id: payload.id, sessionId: payload.sessionId };
};

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
    sessionId: randomUUID(),
  };

  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const { exp } = verifyRefreshToken(refreshToken);
  const refreshTokenExpiresAt = new Date(exp * 1000);
  await authSessionRepository.create({
    id: tokenPayload.sessionId,
    userId: user.id,
    expiresAt: refreshTokenExpiresAt,
  });

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
    refreshTokenExpiresAt,
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
  const payload = readRefreshPayload(refreshToken);
  const session = await authSessionRepository.findActive(
    payload.sessionId,
    payload.id,
  );
  if (!session) {
    throw new UnauthorizedError("Session has expired or been revoked");
  }

  const user = await userRepository.findById(payload.id);
  if (!user) {
    throw new UnauthorizedError("User no longer exists");
  }

  return {
    accessToken: generateToken({
      id: user.id,
      email: user.email,
      sessionId: session.id,
    }),
  };
};

export const logout = async (refreshToken) => {
  const payload = readRefreshPayload(refreshToken);

  // Repeated logout succeeds even when the session is already revoked or gone.
  await authSessionRepository.revoke(payload.sessionId, payload.id);
};
