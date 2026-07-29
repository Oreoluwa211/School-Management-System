import { Request, Response, NextFunction } from "express";
import xss from "xss";

function sanitizeValue(value: any): any {
  if (typeof value === "string") return xss(value.trim());
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value !== null && typeof value === "object") {
    const sanitized: any = {};
    for (const key of Object.keys(value)) {
      sanitized[key] = sanitizeValue(value[key]);
    }
    return sanitized;
  }
  return value;
}

export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  if (req.body) req.body = sanitizeValue(req.body);

  // req.query is read-only in newer Node — sanitize values in place instead
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      const val = req.query[key];
      if (typeof val === "string") {
        (req.query as any)[key] = xss(val.trim());
      }
    });
  }

  if (req.params) req.params = sanitizeValue(req.params);
  next();
}