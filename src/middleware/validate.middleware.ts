import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ApiError } from "../utils/api-error.js";

interface Schemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

/**
 * Validates and coerces `req.body` / `req.params` / `req.query` against the
 * given Zod schemas, replacing each with its parsed (typed) value on success.
 */
export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        throw ApiError.badRequest("Invalid request body", result.error.flatten().fieldErrors);
      }
      req.body = result.data;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        throw ApiError.badRequest("Invalid request parameters", result.error.flatten().fieldErrors);
      }
      req.params = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        throw ApiError.badRequest("Invalid query parameters", result.error.flatten().fieldErrors);
      }
      Object.assign(req.query, result.data);
    }

    next();
  };
}
