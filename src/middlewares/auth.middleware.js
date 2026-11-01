import { UnauthorizedError } from "../core/error.response.js";
import { verifyToken } from "../utils/jwt.helper.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid authorization header");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    if (!decoded || decoded.type !== "access") {
      throw new UnauthorizedError("Invalid access token");
    }

    req.user = decoded.payload;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token has expired");
    }
    throw new UnauthorizedError("Invalid token");
  }
};
