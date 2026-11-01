import { BadRequestError } from "../core/error.response.js";

export const parseUserId = (id) => {
  const parsedId = Number(id);
  if (!parsedId || Number.isNaN(parsedId) || parsedId <= 0) {
    throw new BadRequestError("Invalid user ID");
  }
  return parsedId; 
};

export default parseUserId;
