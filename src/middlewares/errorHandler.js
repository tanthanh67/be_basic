import multer from "multer";
import ApiError from "../core/error.response.js";

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.name}: ${err.message}`);

  if (err instanceof multer.MulterError) {
    let message = err.message;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File size is too large.";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected field or too many files.";
    }

    return res.status(400).json({
      statusCode: 400,
      message,
    });
  }

  if (err instanceof ApiError) {
    const response = {
      statusCode: err.statusCode,
      message: err.message,
    };
    if (err.errors) {
      response.errors = err.errors;
    }
    return res.status(err.statusCode).json(response);
  }

  return res.status(500).json({
    statusCode: 500,
    message: "Internal Server Error",
  });
};

export default errorHandler;
