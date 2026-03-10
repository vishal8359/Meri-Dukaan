class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = "Bad request") {
    return new AppError(msg, 400);
  }
  static unauthorized(msg = "Not authorized") {
    return new AppError(msg, 401);
  }
  static forbidden(msg = "Forbidden") {
    return new AppError(msg, 403);
  }
  static notFound(msg = "Not found") {
    return new AppError(msg, 404);
  }
  static conflict(msg = "Conflict") {
    return new AppError(msg, 409);
  }
}

export default AppError;
