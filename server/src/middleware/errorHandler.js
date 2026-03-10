import env from "../config/env.js";

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal Server Error";

  if (!err.isOperational) console.error("Unhandled Error:", err);

  res.status(statusCode).json({
    error: message,
    ...(err.details && { details: err.details }),
    ...(env.isDev && { stack: err.stack }),
  });
};

export const notFound = (req, _res, next) => {
  const error = new Error(`Not Found – ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
