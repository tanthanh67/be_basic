export const sendSuccess = (
  res,
  statusCode = 200,
  message = "Success",
  data = null,
) => {
  const response = {
    statusCode,
    message,
    data,
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (
  res,
  statusCode = 500,
  message = "Internal Server Error",
  errors = null,
) => {
  const response = {
    statusCode,
    message,
    errors,
  };

  if (errors !== null && errors !== undefined) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
