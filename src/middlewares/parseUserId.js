import { BadRequestError } from "../core/error.response.js";

const parseUserId = (req, res, next) => {
  const userId = req.params.id;

  if (!userId || isNaN(parseInt(userId))) {
    throw new BadRequestError("Invalid user ID");
  }

  const parsedUserId = parseInt(userId);
  req.userId = parsedUserId;
  return next();
};

export default parseUserId;
