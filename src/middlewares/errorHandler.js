import ApiError from "../core/error.response.js";

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.name}: ${err.message}`);

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
