// src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from "express";
import { z, ZodType } from "zod";
export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Données invalides",
        details: z.flattenError(result.error).fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}