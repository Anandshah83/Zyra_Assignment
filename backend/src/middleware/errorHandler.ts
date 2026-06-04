import { Request, Response, NextFunction } from "express";

// Custom error class so we can attach a status code to thrown errors
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

// Global error handler - catches anything thrown in route handlers.
// Always includes the request ID so errors are traceable in logs.
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const requestId = req.headers["x-request-id"] || "unknown";
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    statusCode === 500 ? "An unexpected error occurred" : err.message;

  // Log the full error server-side but send a clean message to the client
  console.error(
    `[ERROR] [${requestId}] ${err.name}: ${err.message}`,
    err.stack
  );

  res.status(statusCode).json({
    error: message,
    requestId,
  });
}
