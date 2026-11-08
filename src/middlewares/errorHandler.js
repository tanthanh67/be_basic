import multer from "multer";
import ApiError from "../core/error.response.js";

const PG_ERRORS = {
  23505: { statusCode: 409, message: "Resource already exists" }, // unique_violation
  23503: {
    statusCode: 400,
    message: "Related resource does not exist or is still in use",
  },
  23502: { statusCode: 400, message: "A required field is missing" }, // not_null_violation
  23514: { statusCode: 400, message: "Data violates a validation rule" }, // check_violation
  "22P02": { statusCode: 400, message: "Invalid input value" }, // invalid_text_representation
  22007: { statusCode: 400, message: "Invalid date/time format" }, // invalid_datetime_format
  22008: { statusCode: 400, message: "Date/time value out of range" }, // datetime_field_overflow
};

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

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      statusCode: 400,
      message: "Invalid JSON body",
    });
  }

  const pgError = PG_ERRORS[err.code];
  if (pgError) {
    return res.status(pgError.statusCode).json({
      statusCode: pgError.statusCode,
      message: pgError.message,
    });
  }

  return res.status(500).json({
    statusCode: 500,
    message: "Internal Server Error",
  });
};

export default errorHandler;
