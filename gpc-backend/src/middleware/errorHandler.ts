import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.issues.map((e) => ({ path: e.path.join("."), message: e.message })),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[])?.join(", ") || "field";
      return res.status(409).json({ message: `A record with this ${target} already exists.` });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Record not found." });
    }
    return res.status(400).json({ message: "Database error.", code: err.code });
  }

  if (err instanceof jwt.TokenExpiredError) {
    return res.status(401).json({ message: "Token has expired." });
  }
  if (err instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({ message: "Invalid token." });
  }

  const status = err.statusCode || err.status || 500;
  res.status(status).json({ message: err.message || "Internal server error" });
}