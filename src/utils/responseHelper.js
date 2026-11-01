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
