import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

// Attaches a unique request ID to every incoming request.
// This makes it easy to trace a specific request through the logs.
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = uuidv4();
  req.headers["x-request-id"] = requestId;
  res.setHeader("x-request-id", requestId);
  next();
}

// Simple request logger: logs method, path, status code, and how long it took.
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();
  const requestId = req.headers["x-request-id"];

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
}
