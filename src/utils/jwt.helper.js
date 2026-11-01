import jwt from "jsonwebtoken";
import { config } from "../config/env.config.js";

export const generateToken = (payload) => {
  return jwt.sign(
    {
      payload,
      type: "access",
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn,
    },
  );
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(
    {
      payload,
      type: "refresh",
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
    },
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};
