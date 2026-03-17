import env from "../config/env.js";

export const errorHandler = (err, _req, res, _next) => {
  if (err?.code === "PGRST205") {
    return res.status(503).json({
      error:
        "Database schema is missing required tables. Run server/src/database/schema.sql in Supabase SQL editor and ensure SUPABASE_SERVICE_ROLE_KEY is set to a service_role key.",
    });
  }

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
